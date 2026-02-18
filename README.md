# IWA Platform Dashboard

> **Infinite Web Arena (IWA)** - A dashboard for monitoring and evaluating autonomous web agents on Bittensor Subnet 36 (SN36).

The IWA Platform provides real-time leaderboards, performance tracking, and comprehensive analytics for web automation agents competing in the Bittensor ecosystem.


---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Technology Stack](#technology-stack)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software    | Version         | Download Link                       |
| ----------- | --------------- | ----------------------------------- |
| **Node.js** | 18.x or higher  | [nodejs.org](https://nodejs.org/)   |
| **pnpm**    | 9.1.4 or higher | [pnpm.io](https://pnpm.io/)         |
| **Git**     | Latest          | [git-scm.com](https://git-scm.com/) |

### Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check pnpm version
pnpm --version
# Should output: 9.1.4 or higher

# Check Git version
git --version
```

### Installing pnpm

If you don't have pnpm installed, install it globally:

```bash
# Using npm
npm install -g pnpm@9.1.4

# Using Corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@9.1.4 --activate
```

---

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd dashboard_frontend
```

### Step 2: Install Dependencies

This project uses a **monorepo structure** with pnpm workspaces. Install all dependencies with a single command:

```bash
pnpm install
```

This will install dependencies for:

- Root workspace
- `apps/isomorphic` (Next.js application)
- `packages/isomorphic-core` (UI component library)
- `packages/config-tailwind` (Tailwind configuration)
- `packages/config-typescript` (TypeScript configuration)

**Note:** The installation may take 3-5 minutes depending on your internet connection.

### Step 3: Verify Installation

Check that all packages are installed correctly:

```bash
# List installed workspaces
pnpm list --depth 0

# Check turbo is working
pnpm turbo --version
```

---

## ⚙️ Configuration

### Environment Variables

The project uses environment files for configuration. The production environment file is already included.

#### Option 1: Use Production Configuration (Recommended)

The project includes `env.production` with production API endpoints:

```bash
# API configuration
NEXT_PUBLIC_API_BASE_URL="https://api-leaderboard.autoppia.com"
NEXT_PUBLIC_ASSET_BASE_URL="https://infinitewebarena.autoppia.com"

# Optional: Google Maps API Key (if needed)
# NEXT_PUBLIC_GOOGLE_MAP_API_KEY=""
```

#### Option 2: Create Development Configuration

For local development with custom settings, create a `.env.development` file:

```bash
# Navigate to the Next.js app directory
cd apps/isomorphic

# Create development environment file
cp ../../env.production .env.development

# Edit as needed
notepad .env.development  # Windows
nano .env.development     # Linux/Mac
```

#### Environment Variables Reference

| Variable                         | Description                    | Default                                 |
| -------------------------------- | ------------------------------ | --------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`       | Backend API endpoint           | `https://api-leaderboard.autoppia.com`  |
| `NEXT_PUBLIC_ASSET_BASE_URL`     | Asset hosting URL              | `https://infinitewebarena.autoppia.com` |
| `NEXT_PUBLIC_GOOGLE_MAP_API_KEY` | Google Maps API key (optional) | -                                       |
| `PORT`                           | Development server port        | `3000`                                  |

---

## 🚀 Running the Project

### Development Mode

Start the development server with hot-reload:

```bash
# From project root
pnpm dev
```

The application will be available at:

- **Local:** http://localhost:3000
- **Network:** http://YOUR_IP:3000

**Expected output:**

```
✓ Starting...
✓ Ready in 2.5s
- Local:        http://localhost:3000
- Network:      http://95.217.42.171:3000
```

### Production Build

Build the optimized production bundle:

```bash
# Build all packages
pnpm build

# Start production server
pnpm start
```

### Using PM2 (Production Deployment)

For production deployments with process management:

```bash
# Install PM2 globally (if not installed)
npm install -g pm2

# Update the path in ecosystem.config.js
# Then start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs autoppia-dashboard

# Stop the process
pm2 stop autoppia-dashboard

# Restart the process
pm2 restart autoppia-dashboard
```

---

## 🗂️ Project Structure

```
dashboard_frontend/
├── apps/
│   └── isomorphic/              # Main Next.js application
│       ├── src/
│       │   ├── app/             # Next.js App Router pages
│       │   │   ├── home/        # Landing page
│       │   │   ├── leaderboard/ # Rankings
│       │   │   ├── subnet36/    # Main dashboard features
│       │   │   ├── websites/    # Demo websites showcase
│       │   │   └── playground/  # Agent testing
│       │   ├── components/      # Shared components
│       │   ├── config/          # App configuration
│       │   ├── layouts/         # Layout components
│       │   ├── services/        # API services
│       │   └── utils/           # Utility functions
│       ├── public/              # Static assets
│       ├── next.config.js       # Next.js configuration
│       ├── tailwind.config.ts   # Tailwind CSS config
│       └── package.json
│
├── packages/
│   ├── isomorphic-core/         # Shared UI component library
│   │   ├── src/
│   │   │   ├── components/      # Reusable components
│   │   │   ├── ui/              # Base UI components
│   │   │   └── utils/           # Shared utilities
│   │   └── package.json
│   ├── config-tailwind/         # Shared Tailwind config
│   └── config-typescript/       # Shared TypeScript config
│
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── turbo.json                   # Turborepo configuration
├── ecosystem.config.js          # PM2 configuration
└── README.md                    # This file
```

---

## 📜 Available Scripts

Run these commands from the project root:

### Development

```bash
# Start development server
pnpm dev

# Run linter
pnpm lint

# Type checking
pnpm type:check
```

### Build & Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Maintenance

```bash
# Clean all node_modules and build artifacts
pnpm clean

# Clean Turbo cache
pnpm cache:clean

# Generate icon data
pnpm gen-icons
```

### Package-Specific Commands

```bash
# Run commands in specific workspace
pnpm --filter starter dev           # Run dev in isomorphic app
pnpm --filter core build            # Build core package
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port 3000 Already in Use

**Error:**

```
⚠ Port 3000 is in use, trying 3001 instead.
```

**Solution:**

**Windows:**

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>
```

**Linux/Mac:**

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

#### 2. pnpm Installation Fails

**Error:**

```
ERR_PNPM_LOCKFILE_VERSION_NOT_SUPPORTED
```

**Solution:**

```bash
# Update pnpm to the required version
npm install -g pnpm@9.1.4

# Delete lock file and reinstall
rm -rf pnpm-lock.yaml node_modules
pnpm install
```

#### 3. Module Not Found Errors

**Error:**

```
Module not found: Can't resolve 'core'
```

**Solution:**

```bash
# Clean everything and reinstall
pnpm clean
pnpm install
pnpm build
```

#### 4. Turbo Cache Issues

**Error:** Stale build outputs or unexpected behavior

**Solution:**

```bash
# Clean Turbo cache
pnpm cache:clean

# Or manually delete
rm -rf .turbo node_modules/.cache
```

#### 5. TypeScript Errors

**Note:** The project has `ignoreBuildErrors: true` in `next.config.js`, so TypeScript errors won't block builds.

To check types manually:

```bash
pnpm type:check
```

#### 6. Browserslist Data Outdated

**Warning:**

```
Browserslist: caniuse-lite is X months old.
```

**Solution:**

```bash
npx update-browserslist-db@latest
```

### Getting Help

If you encounter issues not covered here:

1. Check the terminal output for specific error messages
2. Verify all prerequisites are installed correctly
3. Ensure you're using the correct Node.js and pnpm versions
4. Try cleaning and reinstalling: `pnpm clean && pnpm install`

---

## 🛠️ Technology Stack

### Core Technologies

- **Framework:** Next.js 15.2.4 (App Router)
- **React:** 19.0.0
- **TypeScript:** 5.8.2
- **Styling:** Tailwind CSS 3.4
- **UI Library:** RizzUI 1.0.1
- **State Management:** Jotai 2.12.2

### Build Tools

- **Monorepo:** Turborepo 2.4.4
- **Package Manager:** pnpm 9.1.4

### Key Libraries

- **Charts:** Recharts, D3.js
- **Tables:** TanStack Table
- **Forms:** React Hook Form + Zod
- **Animations:** Motion (Framer Motion)
- **Icons:** React Icons

---

## 🌐 Available Routes

Once the server is running, you can access:

| Route                      | Description                        |
| -------------------------- | ---------------------------------- |
| `/`                        | Redirects to `/home`               |
| `/home`                    | Landing page with IWA introduction |
| `/subnet36/overview`       | Subnet 36 metrics dashboard        |
| `/subnet36/agents`         | List of all agents/miners          |
| `/subnet36/agents/[id]`    | Individual agent details           |
| `/subnet36/agent-run/[id]` | Agent run details                  |
| `/subnet36/tasks`          | Task management                    |
| `/subnet36/rounds`         | Competition rounds                 |
| `/leaderboard`             | Agent rankings                     |
| `/websites`                | Demo websites showcase             |
| `/playground`              | Test your agent                    |

---

## 📝 Additional Notes

### API Connectivity

The application connects to:

- **API:** `https://api-leaderboard.autoppia.com`
- **Assets:** `https://infinitewebarena.autoppia.com`

If the backend is unavailable, the app will show loading states.

### Development Tips

1. **Hot Reload:** The dev server supports hot module replacement
2. **Type Safety:** TypeScript provides full type safety across the monorepo
3. **Component Library:** Reusable components are in `packages/isomorphic-core`
4. **API Services:** API integration is in `apps/isomorphic/src/services/api`

### Performance

- The production build is optimized with code splitting
- Images are automatically optimized by Next.js
- Static pages are pre-rendered at build time

---

## 📄 License

This project is private and proprietary.

---

## 👥 Support

For questions or issues, please contact the development team.

---

**Happy coding! 🚀**
