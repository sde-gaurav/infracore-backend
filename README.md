# InfraCore — Enterprise Node.js Backend Template

> A production-ready, enterprise-grade backend starter template built for high-scale SaaS platforms and software companies. Reusable across all client projects.

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Runtime       | Node.js 20 LTS                      |
| Framework     | Express.js 4.x                      |
| Database      | MongoDB 7 + Mongoose 8              |
| Cache / Queue | Redis 7 + IORedis + BullMQ 5        |
| Auth          | JWT (access + refresh) + bcryptjs   |
| Validation    | Joi 17                              |
| Logging       | Winston + DailyRotateFile           |
| Real-time     | Socket.IO 4                         |
| Email         | Nodemailer                          |
| API Docs      | Swagger UI + swagger-jsdoc          |
| Testing       | Jest + Supertest                    |
| Code Quality  | ESLint (airbnb-base) + Prettier     |
| Git Hooks     | Husky + lint-staged                 |
| Container     | Docker (multi-stage) + Compose      |
| CI/CD         | GitHub Actions                      |

---

## Architecture

```
src/
├── config/            # Env config, logger, CORS, Swagger, email transporter, queue config
├── core/              # ApiError, ApiResponse, asyncHandler, BaseRepository, BaseService
├── database/          # Mongoose & Redis connection managers + seeder
├── models/            # Mongoose schemas: User, Role, Token, AuditLog
├── modules/
│   ├── auth/          # Register, login, refresh, logout, forgot/reset password, OTP, email verify
│   ├── users/         # CRUD, pagination, role assignment, avatar upload
│   └── roles/         # Role management with permission mapping
├── middlewares/       # auth, error, rateLimiter, validate, upload, permission, requestLogger, notFound
├── utils/             # jwt, bcrypt, pagination, apiFeatures, token, otp
├── helpers/           # date, string, array, file
├── constants/         # HTTP codes, roles, permissions, messages, regex
├── cache/             # Redis cache layer: generic, user, token/blocklist
├── routes/            # Versioned route registry
├── events/            # Node.js EventEmitter bus: user events, auth events
├── queues/            # BullMQ: email queue, notification queue + processors
├── jobs/              # node-cron: token cleanup job
├── sockets/           # Socket.IO: init, auth middleware, room handlers
├── emails/            # Nodemailer mailer + HTML templates
├── tests/             # Jest: integration (auth, users) + unit (services) + helpers
├── uploads/           # Multer upload destination (gitignored except .gitkeep)
├── logs/              # Winston log files (gitignored except .gitkeep)
├── app.js             # Express application factory
└── server.js          # HTTP server bootstrap with graceful shutdown
```

---

## Quick Start

### Prerequisites

- Node.js >= 20
- MongoDB 7+
- Redis 7+

### 1. Clone & Install

```bash
git clone <your-repo-url> infracore
cd infracore
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.development
# Edit .env.development with your values
```

**Required secrets in production:**

```
JWT_ACCESS_SECRET     # min 32 chars
JWT_REFRESH_SECRET    # min 32 chars
COOKIE_SECRET         # min 32 chars
MONGO_URI
```

### 3. Seed the Database

```bash
npm run migrate:seed
# Creates system roles and a default super admin account
# Default: superadmin@infracore.dev / SuperAdmin@1234
```

### 4. Run Development Server

```bash
npm run dev
```

Server starts on `http://localhost:5000`.

| Endpoint               | Description         |
|------------------------|---------------------|
| `/api/v1/health`       | Health check        |
| `/api-docs`            | Swagger UI          |
| `/api-docs.json`       | OpenAPI JSON spec   |

---

## Docker

### Development (with Mongo Express UI)

```bash
docker compose --profile dev up
```

### Production

```bash
docker compose up -d
```

Services:
- **App** → `localhost:5000`
- **MongoDB** → `localhost:27017`
- **Redis** → `localhost:6379`
- **Mongo Express** → `localhost:8081` (dev profile only)

---

## API Overview

### Authentication

| Method | Endpoint                         | Auth | Description                     |
|--------|----------------------------------|------|---------------------------------|
| POST   | `/api/v1/auth/register`          | ✗    | Register new user               |
| POST   | `/api/v1/auth/login`             | ✗    | Login, returns token pair       |
| POST   | `/api/v1/auth/refresh`           | ✗    | Rotate refresh token            |
| POST   | `/api/v1/auth/logout`            | ✓    | Revoke all sessions             |
| POST   | `/api/v1/auth/forgot-password`   | ✗    | Request reset link              |
| POST   | `/api/v1/auth/reset-password`    | ✗    | Reset password with token       |
| POST   | `/api/v1/auth/change-password`   | ✓    | Change password                 |
| GET    | `/api/v1/auth/verify-email`      | ✗    | Verify email via token          |
| POST   | `/api/v1/auth/resend-verification` | ✗  | Resend verification email       |
| POST   | `/api/v1/auth/send-otp`          | ✗    | Send OTP to email               |
| POST   | `/api/v1/auth/verify-otp`        | ✗    | Verify OTP                      |
| GET    | `/api/v1/auth/me`                | ✓    | Get own profile                 |

### Users

| Method | Endpoint                        | Role         | Description                  |
|--------|---------------------------------|--------------|------------------------------|
| GET    | `/api/v1/users`                 | admin+       | Paginated user list          |
| GET    | `/api/v1/users/profile`         | any          | Own profile                  |
| PATCH  | `/api/v1/users/profile`         | any          | Update own profile           |
| POST   | `/api/v1/users/avatar`          | any          | Upload avatar                |
| GET    | `/api/v1/users/:id`             | admin+       | Get user by ID               |
| PATCH  | `/api/v1/users/:id`             | owner/admin+ | Update user                  |
| PATCH  | `/api/v1/users/:id/role`        | admin+       | Change user role             |
| PATCH  | `/api/v1/users/:id/deactivate`  | admin+       | Soft deactivate user         |
| DELETE | `/api/v1/users/:id`             | super_admin  | Hard delete user             |

### Roles

| Method | Endpoint             | Role        | Description         |
|--------|----------------------|-------------|---------------------|
| GET    | `/api/v1/roles`      | admin+      | List active roles   |
| GET    | `/api/v1/roles/:id`  | admin+      | Get role by ID      |
| POST   | `/api/v1/roles`      | super_admin | Create role         |
| PATCH  | `/api/v1/roles/:id`  | super_admin | Update role         |
| DELETE | `/api/v1/roles/:id`  | super_admin | Delete role         |

---

## Query String API Features

All list endpoints support:

```
?page=1&limit=10        # Pagination
?sort=-createdAt        # Sort (- prefix = descending)
?fields=email,firstName # Field selection
?search=john            # Full-text search (name/email)
?role=admin&isActive=true  # Filters (any model field)
?firstName[gte]=A       # Comparison operators
```

---

## Role Hierarchy & Permissions

```
super_admin → admin → manager → employee
```

| Permission     | employee | manager | admin | super_admin |
|----------------|:--------:|:-------:|:-----:|:-----------:|
| user:read      | ✓        | ✓       | ✓     | ✓           |
| user:create    |          | ✓       | ✓     | ✓           |
| user:update    |          | ✓       | ✓     | ✓           |
| user:delete    |          |         | ✓     | ✓           |
| role:read      |          |         | ✓     | ✓           |
| role:create    |          |         |       | ✓           |
| role:update    |          |         |       | ✓           |
| role:delete    |          |         |       | ✓           |
| auth:manage    |          |         |       | ✓           |
| audit:read     |          |         | ✓     | ✓           |

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests use an in-memory MongoDB instance via `mongodb-memory-server` — no external DB required.

---

## Scripts

| Script                  | Description                          |
|-------------------------|--------------------------------------|
| `npm run dev`           | Start dev server (nodemon)           |
| `npm start`             | Start production server              |
| `npm run lint`          | Run ESLint (zero warnings)           |
| `npm run lint:fix`      | Auto-fix ESLint issues               |
| `npm run format`        | Format with Prettier                 |
| `npm run format:check`  | Check Prettier formatting            |
| `npm test`              | Run Jest test suite                  |
| `npm run test:coverage` | Coverage report                      |
| `npm run migrate:seed`  | Seed database with roles + superadmin|

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. **Lint** — ESLint + Prettier check
2. **Test** — Jest suite with live MongoDB + Redis services
3. **Build** — Multi-arch Docker image (`linux/amd64`, `linux/arm64`)
4. **Security** — `npm audit --audit-level=high`
5. **Deploy** — SSH/deployment hook (configure for your infra)

Triggers on push to `main` / `develop` and all PRs.

---

## Security Features

| Feature               | Implementation                                     |
|-----------------------|----------------------------------------------------|
| Secure headers        | Helmet (CSP, HSTS, X-Frame-Options, etc.)         |
| CORS                  | Allowlist-based with credentials support           |
| NoSQL injection       | express-mongo-sanitize strips `$` / `.` operators |
| XSS protection        | xss-clean sanitises HTML in request bodies         |
| HPP prevention        | hpp removes duplicate query params                 |
| Rate limiting         | Redis-backed sliding window (global + auth routes) |
| Brute-force guard     | Auth endpoints limited to 10 req/15 min            |
| JWT rotation          | Access token (15m) + refresh token (7d) + rotation |
| Token blocklist       | Revoked access tokens cached until natural expiry  |
| Password hashing      | bcrypt with 12 salt rounds                         |
| Sensitive field filter| Passwords stripped from all JSON responses         |
| Cookie security       | HttpOnly + Secure + SameSite                       |
| Production stack hide | Stack traces never sent in production              |

---

## Adding a New Module

1. Create `src/modules/<name>/` with:
   - `<name>.model.js` → Mongoose schema
   - `<name>.repository.js` → extends `BaseRepository`
   - `<name>.service.js` → extends `BaseService`
   - `<name>.controller.js` → uses `asyncHandler` + `ApiResponse`
   - `<name>.routes.js` → express Router
   - `<name>.validation.js` → Joi schemas

2. Register the router in `src/routes/v1/index.js`:
   ```js
   router.use('/your-module', require('../../modules/your-module/your-module.routes'));
   ```

3. Add Swagger JSDoc annotations to the routes file.

---

## Environment Variables Reference

See [.env.example](.env.example) for the full annotated reference.

---

## License

MIT © InfraCore Engineering
