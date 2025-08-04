# FleetTracker RUC Management System

## Overview

FleetTracker is a comprehensive Road User Charges (RUC) management system designed for fleet operators to track vehicle licenses, monitor odometer readings, and manage compliance with RUC regulations. The application provides real-time monitoring of license status, automated alerts for expiring licenses, and streamlined workflows for adding vehicles and renewing licenses.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with **React 18** using **TypeScript** and follows a component-based architecture:

- **UI Framework**: Utilizes shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
The server-side follows a RESTful API pattern with Express.js:

- **Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints for vehicle and RUC license management
- **Storage Layer**: Abstracted storage interface supporting both in-memory (development) and PostgreSQL (production)
- **Validation**: Zod schemas shared between client and server for consistent validation
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Data Storage Solutions
The application uses a flexible storage architecture:

- **Development**: In-memory storage implementation for rapid development and testing
- **Production**: PostgreSQL database with Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment

### Database Schema
**Vehicles Table**:
- Primary key with UUID generation
- Vehicle identification (plate number, make, model, year)
- Current odometer tracking
- Timestamp fields for audit trails

**RUC Licenses Table**:
- Links to vehicles via foreign key relationship
- Odometer range tracking (start/end)
- Active status management
- Purchase date tracking

### Business Logic
**License Status Calculation**:
- Active: License has remaining distance > 2000km
- Expiring: License has remaining distance ≤ 2000km but > 0
- Expired: Current odometer exceeds license end odometer

**Fleet Monitoring**:
- Real-time dashboard with summary statistics
- Alert banners for licenses requiring attention
- Searchable and filterable vehicle table

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management and validation
- **wouter**: Lightweight routing solution
- **zod**: Runtime type validation and schema definition

### UI Component Libraries
- **@radix-ui/react-***: Accessible, unstyled UI primitives (dialog, dropdown, forms, etc.)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **lucide-react**: Icon library

### Database and ORM
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **drizzle-kit**: Database migration and introspection tools
- **@neondatabase/serverless**: Serverless PostgreSQL connection driver

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class concatenation
- **nanoid**: URL-safe unique ID generation