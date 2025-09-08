# Skavtech ICT Hardware Distribution Platform

A full-stack smart ICT hardware distribution and service platform built with React, TypeScript, Express.js, and PostgreSQL.

## 🚀 Features

### Core Modules
- **Refurbishment Dashboard** - Track devices through repair stages with visual KPIs
- **Customer Trade-In Tool** - Instant device valuation with WhatsApp integration
- **Product Comparison Wizard** - Compare devices with smart recommendations
- **Warranty & Repair Tracker** - Real-time warranty and repair status tracking
- **AI Support Chatbot** - Intelligent customer assistance
- **Corporate Fleet Portal** - Enterprise device management

### Technical Features
- 🔐 JWT-based authentication with bcrypt password hashing
- 🛡️ Security hardening with Helmet, rate limiting, and CORS
- 📊 Real-time analytics and reporting
- 📱 Mobile-first responsive design
- 🔍 Advanced search and filtering
- 📧 Email and WhatsApp notifications
- 🐳 Docker containerization
- 📈 Performance monitoring with Sentry
- 🧪 Comprehensive testing suite

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with JWT
- **Testing**: Vitest, Cypress, Supertest
- **Deployment**: Docker, GitHub Actions CI/CD

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose
- Git

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/skavtech-platform.git
   cd skavtech-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL
   createdb skavtech_db

   # Run migrations
   npm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Using Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yaml up -d
   ```

3. **Manual Deployment**
   ```bash
   # Install PM2 globally
   npm install -g pm2

   # Start the application
   pm2 start dist/index.js --name skavtech
   ```

## 🧪 Testing

### Unit & Integration Tests
```bash
npm run test:server
```

### E2E Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm test
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
│   └── cypress/           # E2E tests
├── server/                 # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
├── migrations/            # Database migrations
├── .github/workflows/     # CI/CD pipelines
└── docker/                # Docker configurations
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

### Database Migrations

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate
```

## 🚢 Deployment

### Docker Deployment

1. **Build Images**
   ```bash
   docker build -t skavtech-client ./client
   docker build -t skavtech-server ./server
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yaml up -d
   ```

### Manual Deployment

1. **Build Assets**
   ```bash
   npm run build:client
   npm run build:server
   ```

2. **Start Services**
   ```bash
   # Using PM2
   pm2 start ecosystem.config.js

   # Or directly
   NODE_ENV=production node dist/index.js
   ```

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with configurable expiration
- Rate limiting on authentication endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation with Zod schemas

## 📊 Monitoring

- Health check endpoints: `/api/health`, `/api/ready`
- Sentry integration for error tracking
- Pino logging with JSON format in production
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@skavtech.co.ke or join our Slack community.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world ICT hardware distribution needs
- Designed for scalability and maintainability