# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS-based personal finance API built with TypeScript, PostgreSQL, and TypeORM. The project implements JWT authentication and user management as foundational features for a comprehensive financial management system.

## Core Architecture

- **Framework**: NestJS with modular architecture
- **Database**: PostgreSQL with TypeORM migrations
- **Authentication**: JWT tokens with bcryptjs password hashing
- **Package Manager**: pnpm (specified in packageManager field)
- **Module Structure**: Feature-based modules (auth, user) with shared OrmConfigModule

Key architectural patterns:
- Dependency injection for services and database entities
- Service layer for business logic, controllers for HTTP handling
- TypeORM entities with decorators for database schema
- Centralized database configuration in OrmConfigModule

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server with hot reload
pnpm run start:dev

# Build for production
pnpm run build

# Run production server
pnpm run start:prod

# Code quality
pnpm run lint        # ESLint with auto-fix
pnpm run format      # Prettier formatting

# Testing
pnpm run test        # Unit tests
pnpm run test:watch  # Watch mode
pnpm run test:e2e    # End-to-end tests
pnpm run test:cov    # Coverage report

# Database migrations
pnpm run migration:generate  # Generate migration from entity changes
pnpm run migration:run       # Apply pending migrations
pnpm run migration:revert    # Rollback last migration
```

## Database Setup

1. Start PostgreSQL database:
   ```bash
   docker-compose up db -d
   ```

2. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Run migrations:
   ```bash
   pnpm run migration:run
   ```

## Environment Configuration

Required environment variables (see .env.example):
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` - PostgreSQL connection
- `JWT_SECRET` - JWT signing secret
- `PORT` - Application port (defaults to 3000)

## Code Conventions

- **NestJS Standards**: Use modules, providers, DTOs, decorators, and guards
- **TypeScript**: Strict typing enabled, decorators for entities and controllers  
- **Entity Naming**: PascalCase for classes, camelCase for properties
- **Database**: TypeORM migrations for schema changes (never use synchronize)
- **Authentication**: JWT-based with bcryptjs hashing, service-layer validation
- **Testing**: Jest for unit/e2e tests, maintain test coverage for new features
- **Prefer**
  - ?? over ||
- **TypeScript**
  - Run typecheck after each implementation

## Key Files and Structure

- `src/main.ts` - Application entry point
- `src/app.module.ts` - Root module importing all feature modules
- `src/ormconfig.module.ts` - Centralized TypeORM configuration
- `typeorm.config.ts` - Migration configuration with environment loading
- `migrations/` - Database migration files
- Feature modules in `src/auth/` and `src/user/` follow NestJS conventions

When adding new features, follow the existing modular structure and ensure proper database migrations are created for schema changes.