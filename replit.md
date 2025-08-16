# Overview

This is a comprehensive WhatsApp Business chatbot application built with a React frontend and Express.js backend. The application provides a complete admin dashboard for managing predefined responses, conversations, analytics, and bot settings. It features a modern UI built with shadcn/ui components and TailwindCSS, with in-memory storage for development and PostgreSQL support for production.

The system handles automated customer service interactions through WhatsApp, allowing businesses to set up predefined responses based on keywords, manage conversations, and track performance analytics. 

**Recent Updates (August 2025):**
- Added comprehensive PWA (Progressive Web App) support for mobile app functionality
- Implemented security features with obfuscated URLs and dual token authentication
- Created complete deployment configuration for multiple platforms (Render, VPS, Cloudflare Tunnel)
- Generated custom app icons and mobile-optimized interface
- Added offline functionality through Service Worker implementation

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with custom CSS variables for theming
- **Build Tool**: Vite with Hot Module Replacement (HMR)

The frontend follows a component-based architecture with clear separation of concerns:
- `/pages` - Route components for different sections (Dashboard, Conversations, Responses, Analytics, Settings)
- `/components` - Reusable UI components organized by feature
- `/lib` - Utility functions and shared logic
- `/hooks` - Custom React hooks

## Backend Architecture

**Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful API with JSON responses
- **Development Server**: Custom Vite integration for SSR in development
- **Error Handling**: Centralized error handling middleware
- **Request Logging**: Custom middleware for API request logging

The backend uses a modular approach:
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Database abstraction layer interface
- `shared/schema.ts` - Shared database schema and validation types

## Database Schema

**Database**: PostgreSQL with Drizzle ORM
- **users**: User authentication and management
- **predefinedResponses**: Automated response templates with keywords and categories
- **conversations**: Customer conversation tracking with status management
- **messages**: Individual message storage with conversation linking
- **botSettings**: Global bot configuration settings
- **analytics**: Performance metrics and statistics tracking

The schema supports multi-tenancy patterns and includes proper indexing for performance.

## Key Features

1. **Response Management**: CRUD operations for predefined responses with keyword matching
2. **Conversation Tracking**: Real-time conversation management with status updates
3. **Analytics Dashboard**: Performance metrics and usage statistics
4. **Bot Configuration**: Flexible settings for business hours, auto-responses, and handoff rules
5. **Real-time Updates**: Live data synchronization using React Query

## Development Setup

The application uses a monorepo structure with shared TypeScript types between frontend and backend. Vite handles both client bundling and development server proxy, while esbuild is used for production backend builds.

# External Dependencies

## Core Frameworks
- **React 18**: Frontend framework with TypeScript support
- **Express.js**: Backend web framework
- **Drizzle ORM**: Type-safe PostgreSQL ORM with migrations
- **TanStack Query**: Server state management and caching

## Database
- **PostgreSQL**: Primary database via `@neondatabase/serverless`
- **Drizzle Kit**: Database migrations and schema management

## UI Framework
- **Radix UI**: Headless UI primitives for accessibility
- **shadcn/ui**: Pre-built component library
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Production build optimization
- **Wouter**: Lightweight client-side routing

## WhatsApp Integration
- **WhatsApp Business API**: For messaging functionality (integration structure prepared)
- The application includes WhatsApp API utilities but requires configuration with Meta Business credentials

## Additional Libraries
- **React Hook Form**: Form validation and management
- **date-fns**: Date manipulation utilities
- **Zod**: Runtime type validation
- **clsx/tailwind-merge**: Conditional CSS class management

The application is configured for deployment on Replit with automatic database provisioning and environment variable management.