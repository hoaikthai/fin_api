# Personal Finance Backend API

A robust, scalable backend for personal finance management, built with NestJS and TypeScript.

---

## Features (Planned & In Progress)

- [x] User registration & authentication (JWT)
- [x] User profile management
- [ ] Multi-currency support
- [x] Account management (bank, cash, credit, etc.)
- [x] Transaction tracking (income, expense, transfer)
  - [x] Query with periods
- [x] Category & tag management
  - [x] Seed default categories
- [ ] Budget planning and tracking
- [ ] Recurring transactions
- [ ] Financial goals & savings tracking
- [ ] Reports and analytics (monthly, custom range, category breakdown)
- [ ] CSV/Excel import & export
- [ ] Notifications & reminders
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Admin panel (optional)

---

## Getting Started

```bash
# Install dependencies
$ pnpm install

# Run in development mode
$ pnpm run start:dev

# Run tests
$ pnpm run test
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your secrets and DB config:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=password
DB_NAME=fin_db
JWT_SECRET=secret
```

---

## Coding Conventions for AI Contributors

- **Follow existing file, folder, and import structure.**
- **Use TypeScript and NestJS best practices** (modules, providers, DTOs, guards, etc.).
- **Write clear, self-explanatory code and comments.**
- **Always write/maintain unit tests for all new features.**
- **Use consistent naming:**
  - Models/entities: `PascalCase`
  - Variables, functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
- **All endpoints must be RESTful and documented.**
- **No hardcoding of secrets or credentials.**
- **Prefer dependency injection for services and utilities.**
- **Keep controller logic thin; business logic goes in services.**
- **Write migrations for all DB schema changes.**
- **Update this checklist when adding new features.**

---

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
