import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import pino from "pino";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import * as Sentry from "@sentry/node";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import cors from "cors";
import { registerRoutes } from "./routes/routes";
import { storage } from "./storage";

export async function createServer(): Promise<express.Express> {
  const app = express();

  // Initialize Sentry for error tracking
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });
  }

  // Initialize logger with JSON format for production
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    transport:
      process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  });

  // CORS middleware
  const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5000'];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };

  app.use(cors(corsOptions));

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
  app.use(limiter);

  // Auth rate limiting (stricter)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    message: "Too many authentication attempts, please try again later.",
  });

  // Core Middleware
  app.use(pinoHttp({ logger }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Passport configuration
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Session configuration with Redis store
  let sessionConfig: any = {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      httpOnly: true, // Prevent XSS attacks
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };
  
  // Configure Redis client and store
  if (process.env.REDIS_URL) {
    const redisClient = createClient({
      url: process.env.REDIS_URL
    });
  
    redisClient.connect().catch(console.error);
  
    const redisStore = new RedisStore({
      client: redisClient,
      prefix: 'skavtech:sess:',
      ttl: 24 * 60 * 60 // 24 hours
    });
  
    sessionConfig.store = redisStore;
  } else if (process.env.DATABASE_URL) {
    // Fallback to PostgreSQL for session storage
    const PgSession = connectPgSimple(session);
    sessionConfig.store = new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'user_sessions',
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
    });
  }

  app.use(session(sessionConfig));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  const server = await registerRoutes(app);

  // Authentication routes
  app.post('/api/auth/login', authLimiter, (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Login failed' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET || 'jwt-secret-key-change-in-production',
          { expiresIn: '24h' }
        );

        // Remove password from response
        const { password, ...userResponse } = user;
        res.json({
          message: 'Login successful',
          user: userResponse,
          token
        });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...user } = req.user as any;
      res.json({ user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development'
    };
    res.json(healthCheck);
  });

  // Readiness check endpoint
  app.get('/api/ready', async (req, res) => {
    try {
      // Check database connectivity
      await storage.getUsers();
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      });
    }
  });

  // Centralized Error Handler - must be after all other middleware and routes
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Report error to Sentry
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    }

    // pino-http attaches the logger to the request
    req.log.error({
      err,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
      message,
      ...(isDevelopment && { stack: err.stack, details: err.details })
    };

    res.status(status).json(errorResponse);
  });

  if (app.get("env") === "development") {
    try {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    } catch (error) {
      console.warn("Vite setup failed, running in production mode:", error);
      // Fallback to static serving in development if vite fails
      const express = await import("express");
      const path = await import("path");
      const fs = await import("fs");

      const distPath = path.resolve(process.cwd(), "client", "dist");
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use("*", (_req, res) => {
          res.sendFile(path.resolve(distPath, "index.html"));
        });
      }
    }
  } else if (app.get("env") !== "test") {
    // Production: Serve static files directly
    const express = await import("express");
    const path = await import("path");
    const fs = await import("fs");

    const distPath = path.resolve(process.cwd(), "client", "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      console.warn(`Static files not found at ${distPath}`);
    }
  }

  return app;
}

(async () => {
  const app = await createServer();

  const port = parseInt(process.env.PORT || '5000', 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`serving on port ${port}`);
  });
})();

