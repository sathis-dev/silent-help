# Silent Help

Mental health support application with Next.js frontend and backend.

## Railway Deployment

This project is configured for deployment on Railway with separate services for frontend, backend, and PostgreSQL database.

### Quick Deploy

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Create a new project:
   ```bash
   railway init
   ```

### Service Setup

You'll need to create 3 services in your Railway project:

#### 1. PostgreSQL Database
- Add a PostgreSQL service from Railway's database templates
- Enable the `pgvector` extension (required for semantic search)
- Railway will automatically set `DATABASE_URL`

#### 2. Backend Service
- Create a new service and link to this repo
- Set the root directory to `/backend`
- Add these environment variables:
  - `DATABASE_URL` - Reference the PostgreSQL service
  - `OPENAI_API_KEY` - Your OpenAI API key
  - `JWT_SECRET` - A secure random string
  - `FRONTEND_URL` - Your frontend Railway URL (for CORS)
  - `NODE_ENV=production`

#### 3. Frontend Service
- Create a new service and link to this repo  
- Set the root directory to `/frontend`
- Add these environment variables:
  - `NEXT_PUBLIC_API_URL` - Your backend Railway URL
  - `NODE_ENV=production`

### Environment Variables

#### Backend
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-set by Railway) |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `JWT_SECRET` | Secret key for JWT authentication |
| `FRONTEND_URL` | Frontend URL for CORS configuration |
| `REDIS_URL` | (Optional) Redis connection string |

#### Frontend
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

### Post-Deployment

After deploying the backend, run Prisma migrations:
```bash
railway run -s backend npx prisma migrate deploy
```

### Local Development

```bash
# Frontend (runs on port 3000)
cd frontend && npm install && npm run dev

# Backend (runs on port 4000)
cd backend && npm install && npm run dev

# Database (Docker)
cd docker && docker-compose up -d
```
