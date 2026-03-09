# Azure Deployment

## Activation
This folder activates when you deploy to **Azure App Service** or **Azure Container Apps**.

## Option A — Azure App Service (Node.js)

### Prerequisites
- Azure CLI: `az login`
- App Service plan created

### Deploy Steps
```bash
# 1. Create resource group
az group create --name rg-aifashion --location eastus

# 2. Create App Service plan
az appservice plan create --name plan-aifashion --resource-group rg-aifashion --sku B2 --is-linux

# 3. Create web app
az webapp create --resource-group rg-aifashion --plan plan-aifashion \
  --name aifashion-backend --runtime "NODE:20-lts"

# 4. Set environment variables (replace values)
az webapp config appsettings set --resource-group rg-aifashion \
  --name aifashion-backend \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="postgresql://..." \
    JWT_SECRET="..." \
    JWT_REFRESH_SECRET="..." \
    AI_KEY="..." \
    VERTEX_AI_PROJECT_ID="..." \
    VERTEX_AI_LOCATION="us-central1" \
    SMTP_HOST="..." \
    SMTP_PORT="587" \
    SMTP_USER="..." \
    SMTP_PASS="..." \
    STRIPE_SECRET_KEY="sk_live_..." \
    FRONTEND_URL="https://yourdomain.azurestaticapps.net" \
    CORS_ORIGINS="https://yourdomain.azurestaticapps.net"

# 5. Deploy backend
cd backend
npm install --production
zip -r ../backend.zip .
az webapp deployment source config-zip \
  --resource-group rg-aifashion --name aifashion-backend --src ../backend.zip
```

## Option B — Azure Static Web Apps (Frontend) + Azure App Service (Backend)

### Frontend (Static Web App)
```bash
az staticwebapp create \
  --name aifashion-frontend \
  --resource-group rg-aifashion \
  --source https://github.com/YOUR/REPO \
  --location "eastus2" \
  --branch main \
  --app-location "frontend" \
  --output-location "dist"
```

### Database (Azure Database for PostgreSQL)
```bash
az postgres flexible-server create \
  --resource-group rg-aifashion \
  --name aifashion-db \
  --admin-user aifashion \
  --admin-password "SecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32

# After creation, run schema:
psql $DATABASE_URL -f ../postgres/schema.sql
```

## Required Environment Variables
Same as Vercel — see backend/.env.example for the full list.

## Azure CI/CD (GitHub Actions)
See `.github/workflows/azure-deploy.yml` for automated deployment.
