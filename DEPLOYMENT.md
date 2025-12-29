# Deployment Guide

This document covers deployment options for the eCom application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build for Production](#build-for-production)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Netlify](#netlify)
  - [Docker](#docker)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
  - [GitHub Pages](#github-pages)
- [Environment Variables](#environment-variables)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

- Node.js 18+ for building
- Production API backend (or continue using DummyJSON for demo)
- Domain name (optional but recommended)

---

## Build for Production

```bash
# Install dependencies
npm ci

# Run linting and tests
npm run lint
npm run test:run

# Build for production
npm run build

# Preview the build locally
npm run preview
```

The build output will be in the `dist/` folder.

### Build Analysis

```bash
# Analyze bundle size
npm run build:analyze
```

This opens a visualization of your bundle to identify optimization opportunities.

---

## Deployment Options

### Vercel (Recommended)

Vercel offers the best DX for React/Vite applications.

#### Option 1: Git Integration (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Import Project"
4. Select your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables
7. Click "Deploy"

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### Netlify

#### Option 1: Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
6. Add environment variables in Site Settings
7. Click "Deploy site"

#### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize (first time)
netlify init

# Deploy preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Netlify Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Environment-specific redirects
[[redirects]]
  from = "/api/*"
  to = "https://api.yourdomain.com/:splat"
  status = 200
  force = true
```

---

### Docker

#### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration

Create `nginx.conf` in project root:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
```

#### Docker Commands

```bash
# Build image
docker build -t ecom-app .

# Run container
docker run -p 8080:80 ecom-app

# Run with environment variables
docker run -p 8080:80 \
  -e VITE_API_BASE_URL=https://api.yourdomain.com \
  ecom-app
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_API_BASE_URL=https://api.yourdomain.com
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

### AWS S3 + CloudFront

#### 1. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://your-ecom-bucket --region us-east-1

# Enable static website hosting
aws s3 website s3://your-ecom-bucket \
  --index-document index.html \
  --error-document index.html
```

#### 2. Upload Build

```bash
# Build the app
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-ecom-bucket \
  --delete \
  --cache-control "max-age=31536000" \
  --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://your-ecom-bucket/ \
  --cache-control "no-cache, no-store, must-revalidate"
```

#### 3. Create CloudFront Distribution

Use AWS Console or CLI to create a CloudFront distribution with:
- Origin: Your S3 bucket
- Default root object: `index.html`
- Error pages: Redirect 404 to `/index.html` with 200 status (for SPA)
- HTTPS redirect enabled
- Gzip compression enabled

---

### GitHub Pages

> Note: GitHub Pages doesn't support SPA routing natively. Use a 404.html workaround.

#### 1. Configure Vite

Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/', // Add this for GitHub Pages
  // ... other config
});
```

#### 2. Add 404 Workaround

Create `public/404.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <script>
      // Redirect to index with path in query string
      const path = window.location.pathname;
      window.location.replace('/' + '?p=' + encodeURIComponent(path));
    </script>
  </head>
</html>
```

#### 3. Deploy with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Environment Variables

### Setting in Hosting Platforms

| Platform | Where to Set |
|----------|--------------|
| Vercel | Project Settings → Environment Variables |
| Netlify | Site Settings → Environment Variables |
| Docker | Pass via `-e` flag or docker-compose |
| AWS | Parameter Store or Secrets Manager |

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Production API URL | `https://api.yourdomain.com` |
| `VITE_SENTRY_DSN` | Error tracking (optional) | `https://xxx@sentry.io/xxx` |

### Build-Time vs Runtime

Vite environment variables are **build-time only**. They get embedded in the bundle during `npm run build`. To change them, you must rebuild.

---

## Post-Deployment Checklist

### Security

- [ ] HTTPS enabled (SSL certificate)
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] No secrets in client bundle
- [ ] API keys are server-side only

### Performance

- [ ] Gzip/Brotli compression enabled
- [ ] Static assets have cache headers
- [ ] CDN configured (CloudFront, Cloudflare, etc.)
- [ ] Bundle size < 250kb gzipped

### Functionality

- [ ] All routes work (including deep links)
- [ ] API connections working
- [ ] Authentication flow works
- [ ] Cart persistence works
- [ ] Forms submit correctly

### Monitoring

- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (if needed)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Log aggregation (if applicable)

### SEO

- [ ] Meta tags rendering correctly
- [ ] Open Graph tags for social sharing
- [ ] Robots.txt in place
- [ ] Sitemap generated (if needed)

---

## Troubleshooting

### Common Issues

#### 1. Routes return 404

**Problem**: Deep links like `/products/123` return 404.

**Solution**: Configure SPA fallback in your hosting platform (redirect all routes to `index.html`).

#### 2. Assets not loading

**Problem**: JS/CSS files return 404.

**Solution**: Check the `base` option in `vite.config.ts` matches your deployment path.

#### 3. API CORS errors

**Problem**: Browser blocks API requests.

**Solution**: Configure CORS headers on your API server, or use a proxy in your hosting platform.

#### 4. Environment variables not working

**Problem**: `import.meta.env.VITE_*` is undefined.

**Solution**: 
- Variables must start with `VITE_`
- Rebuild after changing env vars
- Check variable is set in hosting platform

---

## CI/CD Pipeline Example

See `.github/workflows/ci.yml` in the repository for a complete CI/CD setup that:
1. Runs linting
2. Runs tests
3. Builds the application
4. Deploys to hosting platform

---

## Need Help?

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Open an issue on GitHub
- Review hosting platform documentation
