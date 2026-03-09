---
description: Deploy Angular app to AWS S3 + CloudFront (static hosting)
---

# Deploy MiDinero-UI to S3 + CloudFront

## Prerequisites
- AWS CLI installed and configured (`aws configure` with your Access Key + Secret Key)
- Node.js and npm installed
- An S3 bucket and CloudFront distribution created (see Setup section below)

---

## One-Time Setup

### 1. Install AWS CLI (if not installed)
```powershell
winget install Amazon.AWSCLI
```

### 2. Configure AWS credentials
```powershell
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format: `json`

### 3. Create S3 Bucket
```powershell
aws s3 mb s3://midinero-ui --region us-east-1
```

### 4. Configure the bucket for static website hosting
```powershell
aws s3 website s3://midinero-ui --index-document index.html --error-document index.html
```

> **Note**: The `--error-document index.html` is CRITICAL for Angular routing to work (all routes fallback to index.html).

### 5. Set bucket policy for public access
Create a file `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::midinero-ui/*"
    }
  ]
}
```

Apply the policy:
```powershell
aws s3api put-bucket-policy --bucket midinero-ui --policy file://bucket-policy.json
```

Disable block public access:
```powershell
aws s3api put-public-access-block --bucket midinero-ui --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### 6. Create CloudFront Distribution
```powershell
aws cloudfront create-distribution --origin-domain-name midinero-ui.s3.amazonaws.com --default-root-object index.html
```

> Save the **Distribution ID** and **Domain Name** from the output. You'll need them later.

### 7. Configure CloudFront Custom Error Response (for Angular routing)

In the AWS Console, go to your CloudFront distribution > Error Pages:
- Create custom error response for **403** → Response page path: `/index.html`, HTTP Response Code: `200`
- Create custom error response for **404** → Response page path: `/index.html`, HTTP Response Code: `200`

---

## Deploy Steps

### 1. Update your production environment file

Edit `src/environments/environment.ts` and set the real API URL:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://YOUR-BACKEND-URL/api/v1'
};
```

### 2. Build the Angular app
// turbo
```powershell
cd c:\Users\andre\OneDrive\Escritorio\MiDinero-UI
npm run build
```

### 3. Upload to S3

Replace `midinero-ui` with your actual bucket name:
```powershell
aws s3 sync dist/MiDinero-UI/browser/ s3://midinero-ui --delete
```

> The `--delete` flag removes old files that are no longer in your build.

### 4. Invalidate CloudFront cache

Replace `DISTRIBUTION_ID` with your CloudFront distribution ID:
```powershell
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

### 5. Verify deployment

Open your CloudFront domain in the browser:
```
https://XXXXXX.cloudfront.net
```

---

## Quick Deploy (All-in-One)

Once everything is set up, you can deploy in one command:
```powershell
cd c:\Users\andre\OneDrive\Escritorio\MiDinero-UI; npm run build; aws s3 sync dist/MiDinero-UI/browser/ s3://midinero-ui --delete; aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

---

## Costs (Free Tier)
- **S3**: 5GB storage free, 20,000 GET requests free
- **CloudFront**: 1TB transfer out free, 10M requests free
- **Total estimated**: $0/month within Free Tier
