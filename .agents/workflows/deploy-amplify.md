---
description: Deploy Angular app to AWS Amplify Hosting (easiest option, auto CI/CD)
---

# Deploy MiDinero-UI to AWS Amplify Hosting

AWS Amplify Hosting is the **easiest** way to deploy your Angular app — similar to Vercel or Netlify but within the AWS ecosystem.

## Prerequisites
- AWS account
- GitHub repository (your MiDinero-UI repo must be pushed to GitHub)

---

## Setup Steps

### 1. Go to AWS Amplify Console
Open: https://console.aws.amazon.com/amplify

### 2. Click "New app" → "Host web app"

### 3. Connect your GitHub repository
- Authorize AWS Amplify to access your GitHub account
- Select the `MiDinero-UI` repository
- Select the branch you want to deploy (e.g., `main`)

### 4. Configure Build Settings

Amplify should auto-detect Angular. Verify the build settings look like this:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist/MiDinero-UI/browser
    files:
      - '**/*'
  cache:
    paths:
      - 'node_modules/**/*'
```

### 5. Configure Environment Variables (Optional)
If you use environment-specific API URLs, set them in Amplify Console:
- `API_URL` = `https://your-backend-url/api/v1`

### 6. Configure Rewrites for Angular Routing

In Amplify Console → App settings → Rewrites and redirects, add:

| Source | Target | Type |
|---|---|---|
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json\|webp)$)([^.]+$)/>` | `/index.html` | 200 (Rewrite) |

This ensures all Angular routes are handled by `index.html`.

### 7. Click "Save and Deploy"

Amplify will:
1. Clone your repo
2. Install dependencies (`npm ci`)
3. Build the app (`npm run build`)
4. Deploy to a global CDN
5. Provide you with a URL like `https://main.XXXXXXX.amplifyapp.com`

---

## Automatic Deployments

After initial setup, **every push to your connected branch** will automatically trigger a new build and deployment. No additional CI/CD configuration needed!

---

## Custom Domain (Optional)

1. In Amplify Console → Domain management → Add domain
2. Enter your custom domain
3. Amplify will handle DNS and SSL certificates automatically

---

## Update Production Environment

Before deploying, make sure `src/environments/environment.ts` has your production API URL:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://YOUR-BACKEND-URL/api/v1'
};
```

---

## Costs (Free Tier)
- **Build minutes**: 1,000 minutes/month free
- **Hosting**: 15GB served/month free, 5GB storage free
- **Total estimated**: $0/month within Free Tier limits
