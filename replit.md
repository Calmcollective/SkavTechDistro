# Skavtech ICT Hardware Distribution Platform

## Overview

This is a full-stack smart ICT hardware distribution and service platform for Skavtech. It's a modern web application built with React frontend and Express backend, designed to handle device refurbishment, customer trade-ins, warranty management, repair tracking, and corporate fleet management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL store

### UI/UX Design
- **Component System**: Radix UI primitives with custom styling
- **Design System**: shadcn/ui "new-york" style variant
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Color Scheme**: Custom Skavtech brand colors (blue, green, yellow)
- **Icons**: Lucide React icon library

## Key Components

### 1. Refurbishment Dashboard (Admin Panel)
- **Purpose**: Track devices through refurbishment pipeline
- **Stages**: Received → Diagnosed → Repaired → QC → Ready for Sale
- **Features**: Status filtering, technician assignment, visual KPIs, bulk operations
- **Location**: `/admin` route, `AdminDashboard` component

### 2. Customer Trade-In Tool
- **Purpose**: Device valuation and collection scheduling
- **Features**: Instant price estimates, pickup scheduling, WhatsApp integration
- **Location**: `/trade-in` route, `TradeInForm` component
- **Integration**: Calendar scheduling, automated notifications

### 3. Product Comparison Wizard
- **Purpose**: Compare up to 3 devices (new/refurbished)
- **Features**: Spec comparison, warranty details, smart recommendations
- **Location**: `/products` route, `ComparisonWidget` component
- **Logic**: Best value badges, side-by-side comparison tables

### 4. Warranty & Repair Tracker
- **Purpose**: Warranty status lookup and repair job management
- **Features**: Serial number lookup, repair ticket creation, status tracking
- **Location**: `/services` route, `WarrantyLookup` and `RepairTracker` components
- **Admin Functions**: Repair job logging, status updates, completion tracking

### 5. AI Support Chatbot ("SkavBot")
- **Purpose**: Automated customer support and guidance
- **Features**: FAQ responses, purchase guidance, repair assistance
- **Location**: Floating widget, `ChatBot` component
- **Integration**: Triggers form submissions and support tickets

### 6. Corporate Fleet Portal
- **Purpose**: Enterprise device management
- **Features**: Device inventory, warranty tracking, audit logs, bulk operations
- **Location**: `/fleet` route, `FleetPortal` component
- **Enterprise Features**: Multi-location support, user management, analytics

## Data Flow

### Database Schema Structure
- **Users**: Authentication and role management (customer, admin, technician)
- **Products**: Device catalog with categories, pricing, specifications
- **Devices**: Refurbishment pipeline tracking with status and technician assignment
- **Warranties**: Warranty records linked to products and serial numbers
- **Repair Tickets**: Service requests with status tracking and customer info
- **Trade-Ins**: Customer device submissions with valuations
- **Fleet Devices**: Enterprise device management with company associations

### API Endpoints Structure
- `GET/POST /api/products` - Product catalog management
- `GET/POST/PUT /api/admin/devices` - Refurbishment dashboard data
- `POST /api/trade-in/estimate` - Trade-in valuations
- `GET /api/warranty/:serialNumber` - Warranty lookups
- `GET/POST/PUT /api/repair-tickets` - Repair job management
- `GET /api/fleet/:companyId` - Corporate fleet data
- `POST /api/chatbot` - AI chatbot interactions

### Error Handling Strategy
- **Client-side**: React Query for API error states with user-friendly messages
- **Server-side**: Express error middleware with consistent JSON error responses
- **Validation**: Zod schemas for runtime type checking and form validation
- **Fallbacks**: Graceful degradation for offline scenarios and API failures

## External Dependencies

### Database & ORM
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: Environment-based DATABASE_URL configuration

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Modern icon library
- **Class Variance Authority**: Component variant management

### Form & Validation
- **React Hook Form**: Performant form library
- **Zod**: TypeScript-first schema validation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Communication Integrations
- **WhatsApp Integration**: Direct messaging for customer support
- **Email Notifications**: Automated communication for repairs and trade-ins
- **Calendar Integration**: Appointment scheduling for device collection

## Deployment Strategy

### Development Setup
- **Dev Server**: Vite development server with HMR
- **Database Migrations**: Drizzle Kit for schema management
- **Environment**: NODE_ENV-based configuration
- **Scripts**: `dev`, `build`, `start`, `check`, `db:push`

### Production Build
- **Frontend**: Vite build with optimized assets
- **Backend**: ESBuild compilation to ESM format
- **Static Assets**: Served from `dist/public` directory
- **Process Management**: Node.js production server

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **WhatsApp**: VITE_WHATSAPP_NUMBER for customer communication
- **Sessions**: PostgreSQL session store for scalability
- **CORS**: Configured for production domain requirements

### Replit Integration
- **Development**: Vite plugin for runtime error overlay
- **Cartographer**: Development mode source mapping
- **Banner**: Development environment identification