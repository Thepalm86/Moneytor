# Moneytor - Technology Stack & Dependencies

## Core Dependencies

### Framework & Runtime
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0"
}
```

### Database & Authentication
```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/ssr": "^0.0.10"
}
```

### Styling & UI
```json
{
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-progress": "^1.0.3",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-popover": "^1.0.7",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-tooltip": "^1.0.7",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-badge": "^1.0.4",
  "@radix-ui/react-separator": "^1.0.3",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-switch": "^1.0.3",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-radio-group": "^1.1.3",
  "@radix-ui/react-slider": "^1.1.2",
  "@radix-ui/react-scroll-area": "^1.0.5",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "framer-motion": "^10.16.5",
  "@next/font": "^14.0.0",
  "next-themes": "^0.2.1"
}
```

### Icons & Data Visualization
```json
{
  "lucide-react": "^0.292.0",
  "recharts": "^2.8.0"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.47.0",
  "@hookform/resolvers": "^3.3.2",
  "zod": "^3.22.4"
}
```

### State Management & Data Fetching
```json
{
  "zustand": "^4.4.6",
  "swr": "^2.2.4"
}
```

### Utilities
```json
{
  "date-fns": "^2.30.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "@types/react-dom": "^18.0.0"
}
```

## Development Dependencies

### Code Quality & Formatting
```json
{
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0",
  "@typescript-eslint/parser": "^6.0.0",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "prettier": "^3.0.0",
  "prettier-plugin-tailwindcss": "^0.5.0"
}
```

### Development Tools
```json
{
  "shadcn-ui": "^0.4.1",
  "supabase": "^1.100.0",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.31",
  "@tailwindcss/forms": "^0.5.7",
  "@tailwindcss/typography": "^0.5.10",
  "@tailwindcss/aspect-ratio": "^0.4.2",
  "@tailwindcss/container-queries": "^0.1.1",
  "tailwindcss-animate": "^1.0.7"
}
```

## Configuration Files

### package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "supabase:gen-types": "supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/lib/database.types.ts",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:status": "supabase status",
    "supabase:reset": "supabase db reset"
  }
}
```

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Tailwind CSS Configuration (tailwind.config.ts)
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    require('tailwindcss-animate'),
  ],
}

export default config
```

### ESLint Configuration (.eslintrc.json)
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": [
    "node_modules/",
    ".next/",
    "out/",
    "public/"
  ]
}
```

### Prettier Configuration (.prettierrc)
```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## Environment Setup

### Required Environment Variables (.env.local)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Moneytor

# Development
NODE_ENV=development
```

### Supabase Configuration (supabase/config.toml)
```toml
project_id = "your-project-id"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326

[storage]
enabled = true
port = 54327
file_size_limit = "50MiB"

[auth]
enabled = true
port = 54328
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://your-production-domain.com"]
jwt_expiry = 3600
refresh_token_rotation_enabled = true
security_update_password_require_reauthentication = true

[auth.email]
enable_signup = true
double_confirm_email = false
enable_confirmations = false

[edge_functions]
enabled = false
```

## Development Workflow

### Setup Commands
```bash
# Install dependencies
npm install

# Start Supabase (if using local development)
supabase start

# Generate TypeScript types from database
npm run supabase:gen-types

# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Build Commands
```bash
# Production build
npm run build

# Start production server
npm start

# Deploy to Vercel (recommended)
vercel

# Deploy to Netlify
netlify deploy --prod
```

This technology stack provides a modern, performant, and scalable foundation for building a world-class personal finance application.