# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 17 accounting system frontend with SSR (Server-Side Rendering) support. The application manages accounting operations including journal entries, ledgers, accounts, and balance reports. It connects to a backend API at `http://localhost:8080`.

## Commands

### Development
```bash
npm start                    # Start dev server at http://localhost:4200/
ng serve                     # Alternative to npm start
npm run watch                # Build in watch mode with development config
```

### Testing
```bash
npm test                     # Run all tests via Karma
ng test                      # Alternative to npm test
```

### Building
```bash
npm run build                # Production build to dist/front-final-v3
ng build                     # Alternative production build
ng build --configuration development  # Development build
```

### SSR
```bash
npm run serve:ssr:front-final-v3     # Serve SSR build (requires prior build)
```

### Code Generation
```bash
ng generate component component-name  # Generate new component
ng generate service service-name      # Generate new service
ng generate guard guard-name          # Generate new guard
```

## Architecture

### Core Structure

The app follows Angular standalone components architecture (no NgModules). Key architectural patterns:

**Core Layer** (`src/app/core/`)
- `models/`: TypeScript interfaces for domain entities (Account, JournalEntry, User, etc.)
- `service/`: Business logic and HTTP services
  - All services use `providedIn: 'root'` for singleton instances
  - `auth.interceptor.ts`: Functional HTTP interceptor that adds Bearer token to requests
- `guard/`: Route guards using functional `CanActivateFn` pattern
  - `auth.guard.ts`: Protects authenticated routes
  - `admin.guard.ts`: Protects admin-only routes

**Feature Modules** (feature folders in `src/app/`)
- `login/`: Authentication UI
- `dashboard/`: Main dashboard (authenticated users only)
- `accounts/`: Account management with tree view (account-tree) and admin management (account-manage)
- `entries/`: Journal entries with entry-form, entry-detail, ledger, and balance components
- `users/`: User management (admin only)

### Configuration & Bootstrap

**App Configuration** (`app.config.ts`)
- Uses `ApplicationConfig` pattern (not NgModule)
- Configured with:
  - Router via `provideRouter(routes)`
  - HTTP client with auth interceptor via `provideHttpClient(withInterceptors([authInterceptor]))`

**SSR Configuration**
- Enabled in `angular.json` with prerendering
- Server entry point: `server.ts`
- SSR-safe code required: All components using `localStorage` must check `isBrowser()` first (see AuthService example)

### Routing & Guards

Routes defined in `app.routes.ts` with role-based access:
- Public: `/login`
- Authenticated (`authGuard`): `/dashboard`, `/accounts/tree`, `/entries/:id`, `/ledger`
- Admin only (`adminGuard`): `/accounts/manage`, `/users/*`, `/entries/new`, `/balance`

Guards are functional guards using `inject()` pattern, not class-based.

### Authentication Flow

**Token Management** (AuthService)
- JWT tokens stored in `localStorage` with 1-hour expiration
- Roles stored separately in `localStorage` as JSON array
- All localStorage access wrapped in `isBrowser()` check for SSR compatibility
- Token automatically injected via `authInterceptor` on all HTTP requests

**Important SSR Pattern**: When accessing browser APIs (localStorage, window, document), always check:
```typescript
private isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}
```

### Data Models

Key interfaces in `src/app/core/models/`:
- `Account`: Hierarchical account structure with parent-child relationships (`parentId`, `children[]`)
- `JournalEntry`: Accounting entries with double-entry details array
- `JournalEntryDetail`: Individual debit/credit line items
- `AuthUser`: User authentication data
- `AuthToken`: JWT token with roles and expiration

### Styling

- Bootstrap 5.3.2 (included globally in `angular.json`)
- Bootstrap JS bundle included for interactive components
- Component-specific styles in `.css` files alongside components

### Environment Configuration

Two environments in `src/environments/`:
- `environment.ts`: Development (apiUrl: http://localhost:8080)
- `environments.prod.ts`: Production

Update `apiUrl` in these files to change backend endpoint.

## Important Conventions

1. **Standalone Components**: All components must be standalone with explicit imports
2. **Functional Guards**: Use `CanActivateFn` type, not class-based guards
3. **Functional Interceptors**: Use `HttpInterceptorFn` type with `inject()`
4. **SSR Safety**: Always check `isBrowser()` before accessing browser APIs
5. **Role-Based Access**: Verify routes use correct guards (`authGuard` vs `adminGuard`)
6. **Service Injection**: Services use `providedIn: 'root'`, inject via constructor DI

## Common Pitfalls

- **SSR Errors**: If seeing "localStorage is not defined", wrap access in `isBrowser()` check
- **Standalone Components**: Missing imports in component metadata will cause runtime errors
- **Route Guards**: Functional guards require `inject()` for dependencies, not constructor injection
- **Balance Route**: Currently misconfigured (route after wildcard in app.routes.ts:55-56)
