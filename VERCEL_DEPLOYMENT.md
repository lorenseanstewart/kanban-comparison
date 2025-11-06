# Vercel Deployment Guide

This guide covers deploying all kanban apps to Vercel using a shared Neon Postgres database.

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **Neon Account**: Sign up at https://neon.tech
3. **GitHub/GitLab/Bitbucket**: Repository hosted on one of these platforms
4. **Node.js**: v20.x or higher installed locally

## Part 1: Set Up Neon Postgres Database

### 1.1 Create Neon Database

1. Go to https://console.neon.tech
2. Click **"Create Project"**
3. Choose a project name (e.g., "kanban-comparison")
4. Select a region close to your Vercel deployment region
5. Click **"Create Project"**

### 1.2 Get Database Connection String

1. In your Neon dashboard, go to your project
2. Click on **"Connection Details"**
3. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this - you'll need it for both local development and Vercel

### 1.3 Run Database Migrations

You only need to run migrations once since all apps share the same database:

```bash
# Pick any app to run migrations (we'll use Next.js)
cd kanban-nextjs

# Create .env.local file
echo "DATABASE_URL=your-neon-connection-string-here" > .env.local

# Install dependencies
npm install

# Generate migrations for Postgres
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Seed the database with initial data
npm run seed
```

**Note**: The database schema is identical across all apps, so running migrations from one app sets up the database for all of them.

## Part 2: Deploy to Vercel

Each app needs to be deployed separately. Here's the process:

### 2.1 Deploy kanban-nextjs

#### Via Vercel CLI:

```bash
cd kanban-nextjs

# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name: kanban-nextjs
```

#### Via Vercel Dashboard:

1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the `kanban-nextjs` directory as the root
4. Framework Preset: Next.js (auto-detected)
5. Add environment variable:
   - Name: `DATABASE_URL`
   - Value: Your Neon connection string
6. Click **"Deploy"**

### 2.2 Deploy kanban-nuxt

```bash
cd kanban-nuxt
vercel

# Or via dashboard:
# - Root Directory: kanban-nuxt
# - Framework: Nuxt.js
# - Environment Variable: DATABASE_URL = <neon-connection-string>
```

### 2.3 Deploy kanban-sveltekit

```bash
cd kanban-sveltekit
vercel

# Or via dashboard:
# - Root Directory: kanban-sveltekit
# - Framework: SvelteKit
# - Environment Variable: DATABASE_URL = <neon-connection-string>
```

### 2.4 Deploy kanban-htmx (Astro)

```bash
cd kanban-htmx
vercel

# Or via dashboard:
# - Root Directory: kanban-htmx
# - Framework: Astro
# - Build Command: npm run build
# - Output Directory: dist
# - Environment Variable: DATABASE_URL = <neon-connection-string>
```

### 2.5 Deploy kanban-analog

```bash
cd kanban-analog
vercel

# Or via dashboard:
# - Root Directory: kanban-analog
# - Framework: Other
# - Build Command: npm run build
# - Output Directory: dist/analog/public
# - Environment Variable: DATABASE_URL = <neon-connection-string>
```

## Part 3: Configure Environment Variables

For each deployed app on Vercel:

1. Go to your project dashboard on Vercel
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add the following:
   - **Name**: `DATABASE_URL` (or `POSTGRES_URL`)
   - **Value**: Your Neon Postgres connection string
   - **Environments**: Select all (Production, Preview, Development)
5. Click **"Save"**

## Part 4: Verify Deployment

### 4.1 Check Build Logs

1. Go to each project on Vercel
2. Click on the latest deployment
3. Check the build logs for any errors
4. Common issues:
   - Missing environment variables
   - Database connection failures
   - Build configuration issues

### 4.2 Test Each Application

Visit each deployed URL and verify:

1. **Homepage loads** - You should see the list of boards
2. **Create a board** - Test board creation
3. **Create cards** - Add cards to lists
4. **Drag and drop** - Move cards between lists
5. **Comments** - Add comments to cards
6. **Tags** - Assign tags to cards

### 4.3 Check Database

Since all apps share the same database:

1. Create a board in kanban-nextjs
2. Visit kanban-nuxt - you should see the same board
3. Add a card in kanban-sveltekit
4. Check kanban-htmx - the card should appear there too

This confirms all apps are correctly connected to the shared database.

## Part 5: Troubleshooting

### Database Connection Issues

**Error**: `Connection refused` or `ECONNREFUSED`

**Solution**:
- Check that DATABASE_URL is set correctly in Vercel environment variables
- Ensure the connection string includes `?sslmode=require`
- Verify the Neon project is active (not paused)

**Error**: `Database does not exist`

**Solution**:
- Run migrations: `npm run db:migrate` locally
- Or use Neon's SQL Editor to run the migration files manually

### Build Failures

**Error**: `Type error: Argument of type 'NodePgDatabase' is not assignable to parameter of type 'BetterSQLite3Database'`

**Solution**:
- This occurs when migration files still import from `drizzle-orm/better-sqlite3/migrator`
- Update to use `drizzle-orm/node-postgres/migrator` instead
- Also ensure the migrate call uses `await` since Postgres migrations are async

Example fix:
```typescript
// Before (SQLite)
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
migrate(db, { migrationsFolder: 'drizzle/migrations' });

// After (Postgres)
import { migrate } from 'drizzle-orm/node-postgres/migrator';
await migrate(db, { migrationsFolder: 'drizzle/migrations' });
```

**Error**: `Cannot find module 'pg'`

**Solution**:
- Ensure `pg` is in `dependencies` (not `devDependencies`) in package.json
- Redeploy after updating package.json

**Error**: `Module not found: Can't resolve 'drizzle-orm/node-postgres'`

**Solution**:
- Update drizzle-orm to latest version: `npm install drizzle-orm@latest`
- Commit and push changes

### Runtime Errors

**Error**: `Cannot read property 'query' of undefined`

**Solution**:
- Database connection not initialized
- Check that DATABASE_URL is available at runtime
- Verify connection pooling is configured correctly

## Part 6: Performance Optimization

### Connection Pooling

All apps are configured with connection pooling:

```typescript
const pool = new Pool({
  connectionString,
  max: process.env.NODE_ENV === 'production' ? 1 : 10,
})
```

- **Production**: 1 connection per serverless function (Vercel recommendation)
- **Development**: 10 connections for local development

### Neon Auto-Suspend

Neon databases auto-suspend after inactivity. First request after suspension may be slower (cold start).

**Solution**: Use Neon's connection pooler for instant connections:
- In Neon dashboard, use the "Pooled connection" string instead of "Direct connection"

## Part 7: Monitoring and Maintenance

### Vercel Analytics

Enable Vercel Analytics to monitor:
- Page load times
- Web Vitals (LCP, FID, CLS)
- Real User Monitoring

### Neon Monitoring

In Neon dashboard, monitor:
- Connection count
- Query performance
- Storage usage
- Active time

### Database Backups

Neon provides automatic backups:
- Daily backups retained for 7 days
- Point-in-time recovery available

## Part 8: CI/CD Setup

### Automatic Deployments

Vercel automatically deploys on:
- Push to main/master branch → Production deployment
- Pull requests → Preview deployments

### Environment-Specific Databases

For production safety, consider:

1. **Development Database**: Separate Neon project for development
2. **Staging Database**: Preview deployments use staging database
3. **Production Database**: Production deployments use production database

Set different DATABASE_URL values per environment in Vercel.

## Part 9: Cost Considerations

### Neon Costs

- **Free Tier**:
  - 10 GB storage
  - 100 hours compute per month
  - Suitable for development/testing

- **Pro Tier**:
  - Unlimited storage
  - Unlimited compute
  - Better for production

### Vercel Costs

- **Hobby**: Free
  - 100 GB bandwidth
  - Suitable for side projects

- **Pro**: $20/month
  - 1 TB bandwidth
  - Better for production apps

## Part 10: Security Best Practices

### 1. Environment Variables

- Never commit `.env.local` files
- Use Vercel's encrypted environment variables
- Rotate database passwords regularly

### 2. Database Security

- Use connection pooling to limit connections
- Enable SSL (included in Neon connection strings)
- Use read-only connections for analytics queries

### 3. Rate Limiting

Consider adding rate limiting to API routes to prevent abuse.

## Summary

All five kanban apps are now deployed to Vercel and sharing a single Neon Postgres database. Each app is independently deployable but operates on the same data store, allowing for true framework comparison with identical data.

### Deployment URLs

After deployment, you should have URLs like:
- `https://kanban-nextjs.vercel.app`
- `https://kanban-nuxt.vercel.app`
- `https://kanban-sveltekit.vercel.app`
- `https://kanban-htmx.vercel.app`
- `https://kanban-analog.vercel.app`

All apps will share the same boards, cards, and data through the shared Neon database.
