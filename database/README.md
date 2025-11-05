# Database Setup Guide

## Prerequisites
- PostgreSQL 14+ installed
- Database created: `jobcrawl`

## Quick Start

### 1. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE jobcrawl;

# Exit
\q
```

### 2. Update Environment Variables
Edit `backend/.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/jobcrawl
```

### 3. Run Migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. (Optional) Seed Database
```bash
npx prisma db seed
```

## Useful Commands

### View Database in Browser
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Deploy to Production
```bash
npx prisma migrate deploy
```

## Schema Overview

### Tables
- **users** - User authentication and basic info
- **profiles** - Extended user profile (CV, skills, preferences)
- **job_listings** - Scraped job postings from various sources
- **applications** - User applications and their status

### Relationships
- User has one Profile
- User has many Applications
- JobListing has many Applications
- Application belongs to one User and one JobListing

## Indexes
- `users.email` - Unique index
- `job_listings.source` - For filtering by source
- `job_listings.scraped_at` - For sorting by recency
- `applications.user_id` - For user application queries
- `applications.status` - For filtering by status

