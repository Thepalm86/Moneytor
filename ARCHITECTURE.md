# Moneytor - System Architecture & Technical Specifications

## Architecture Overview

### System Architecture
```
Frontend (Next.js 14)
├── App Router (RSC + Client Components)
├── TypeScript (Strict Mode)
├── Tailwind CSS + Custom Design System
└── Zustand (State Management)

Backend Services
├── Supabase (PostgreSQL + Auth + Real-time)
├── Row Level Security (RLS)
├── Database Functions & Triggers
└── Real-time Subscriptions

External Integrations
├── Recharts (Data Visualization)
├── Radix UI (Accessible Primitives)
├── Lucide React (Premium Icons)
└── React Hook Form + Zod (Form Validation)
```

## Database Schema Design

### Core Tables Structure

#### 1. **profiles** - User Profile Management
```sql
- id (uuid, primary key, references auth.users)
- first_name (text)
- last_name (text)
- email (text, unique)
- avatar_url (text, optional)
- currency (text, default 'ILS')
- theme_preference (text, default 'system')
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 2. **categories** - Income/Expense Categories
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- name (text, not null)
- type ('income' | 'expense')
- color (text, hex color code)
- icon (text, lucide icon name)
- is_active (boolean, default true)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 3. **transactions** - Financial Transactions
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- category_id (uuid, references categories.id)
- amount (decimal(10,2), not null)
- type ('income' | 'expense')
- description (text)
- date (date, not null)
- tags (text[], optional)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 4. **targets** - Budget Targets
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- category_id (uuid, references categories.id, optional)
- name (text, not null)
- target_amount (decimal(10,2), not null)
- period_type ('weekly' | 'monthly' | 'yearly')
- period_start (date, not null)
- period_end (date, not null)
- is_active (boolean, default true)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 5. **saving_goals** - Savings Goals
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- name (text, not null)
- description (text, optional)
- target_amount (decimal(10,2), not null)
- current_amount (decimal(10,2), default 0)
- target_date (date, optional)
- color (text, hex color code)
- is_achieved (boolean, default false)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### 6. **achievements** - Gamification System
```sql
- id (uuid, primary key)
- name (text, not null, unique)
- description (text, not null)
- badge_icon (text, lucide icon name)
- badge_color (text, hex color code)
- points (integer, not null)
- criteria (jsonb, achievement rules)
- category ('saving' | 'spending' | 'budgeting' | 'consistency')
- is_active (boolean, default true)
- created_at (timestamptz)
```

#### 7. **user_achievements** - User Achievement Progress
```sql
- id (uuid, primary key)
- user_id (uuid, references profiles.id)
- achievement_id (uuid, references achievements.id)
- earned_at (timestamptz)
- progress (jsonb, optional progress data)
- created_at (timestamptz)
```

### Database Security & Performance

#### Row Level Security (RLS) Policies
- **profiles**: Users can only access their own profile
- **categories**: Users can only access their own categories
- **transactions**: Users can only access their own transactions
- **targets**: Users can only access their own budget targets
- **saving_goals**: Users can only access their own goals
- **user_achievements**: Users can only access their own achievements
- **achievements**: Read-only access for all authenticated users

#### Database Indexes
```sql
-- Performance optimization indexes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_targets_user_period ON targets(user_id, period_start, period_end);
CREATE INDEX idx_categories_user_type ON categories(user_id, type);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
```

#### Database Functions & Triggers
```sql
-- Automatic profile creation on user signup
-- Automatic updated_at timestamp management
-- Achievement progress calculation functions
-- Budget spending calculation functions
```

## Technology Stack

### Frontend Framework
- **Next.js 14**: App Router, Server Components, Client Components
- **TypeScript**: Strict mode for type safety
- **React 18**: Concurrent features, Suspense boundaries

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI primitives
- **CSS Variables**: Theme system (light/dark mode)
- **Framer Motion**: Premium animations and transitions

### State Management
- **Zustand**: Lightweight state management
- **React Query/SWR**: Server state management
- **React Context**: Authentication state

### Data & API
- **Supabase**: 
  - PostgreSQL database with real-time subscriptions
  - Authentication with RLS policies
  - Auto-generated TypeScript types
  - File storage (for future avatar uploads)

### Forms & Validation
- **React Hook Form**: Performant form handling
- **Zod**: Schema validation with TypeScript inference
- **Input validation**: Client-side + server-side validation

### Data Visualization
- **Recharts**: Responsive charts and graphs
- **Custom Chart Components**: Tailored for financial data

### Development Tools
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript Compiler**: Type checking
- **Supabase CLI**: Database management and type generation

## Component Architecture

### Component Hierarchy
```
App Layout
├── RootLayout (Global styles, providers)
├── AuthLayout (Authentication pages)
└── DashboardLayout (Protected routes)
    ├── Sidebar Navigation
    ├── Header (User profile, search)
    └── Main Content Area
        ├── Dashboard (Overview)
        ├── Transactions (CRUD)
        ├── Categories (Management)
        ├── Targets (Budget tracking)
        ├── Goals (Savings goals)
        ├── Reports (Analytics)
        └── Achievements (Gamification)
```

### Design System Components
```
UI Components (src/components/ui/)
├── Button (variants, sizes, states)
├── Card (layouts, shadows, borders)
├── Input (types, validation, icons)
├── Select (searchable, multi-select)
├── Dialog (modal, drawer, popover)
├── Badge (status, category, achievement)
├── Progress (linear, circular, stepped)
├── Chart (wrapper components)
└── Form (field, label, error, group)

Layout Components (src/components/layout/)
├── Sidebar (navigation, collapse)
├── Header (profile, notifications)
├── PageHeader (title, actions, breadcrumb)
├── Container (responsive widths)
└── Grid (responsive layouts)
```

## Data Flow Architecture

### Authentication Flow
```
1. User visits app → Middleware checks auth
2. If not authenticated → Redirect to /auth/login
3. Login/Signup → Supabase Auth
4. Success → Create/update profile → Redirect to /dashboard
5. Protected routes → Verify session → Allow access
```

### Data Fetching Strategy
- **Server Components**: Static data, initial page loads
- **Client Components**: Interactive data, real-time updates
- **SWR/React Query**: Caching, background updates, optimistic UI
- **Supabase Realtime**: Live transaction updates, collaborative features

### State Management Strategy
```
Global State (Zustand)
├── User Profile & Preferences
├── UI State (sidebar, modals, notifications)
└── Transaction Filters & Search

Server State (SWR/React Query)
├── Categories, Transactions, Targets, Goals
├── Analytics & Reports Data
└── Achievement Progress

Local State (useState)
├── Form Data
├── Component UI State
└── Temporary Interactions
```

## Security Architecture

### Authentication Security
- **Supabase Auth**: Industry-standard OAuth 2.0
- **JWT Tokens**: Automatic token refresh
- **Session Management**: Secure cookie-based sessions
- **Password Policies**: Strong password requirements

### Data Security
- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Content Security Policy headers

### Privacy & Compliance
- **Data Encryption**: At rest and in transit
- **GDPR Compliance**: Data export/deletion capabilities
- **Audit Logging**: User action tracking
- **Secure Headers**: HTTPS, HSTS, CSP

## Performance Architecture

### Loading & Optimization
- **Server-Side Rendering**: Fast initial page loads
- **Code Splitting**: Route-based and component-based
- **Image Optimization**: Next.js automatic optimization
- **Bundle Analysis**: Regular bundle size monitoring

### Caching Strategy
- **Browser Caching**: Static assets, API responses
- **CDN Caching**: Global content delivery
- **Database Query Optimization**: Indexed queries, connection pooling
- **SWR Caching**: Intelligent client-side caching

### Real-time Performance
- **Optimistic Updates**: Instant UI feedback
- **Background Sync**: Offline-first capabilities
- **Debounced Searches**: Efficient search implementation
- **Virtualization**: Large transaction lists

This architecture provides a solid foundation for a world-class personal finance application with enterprise-grade scalability, security, and user experience.