#!/bin/bash

# Load env variables
source .env

# Build Docker image
docker build -t agp-donor-backend .

# Tag for Artifact Registry
docker tag agp-donor-backend us-docker.pkg.dev/agp-donor/agp-donor-backend/agp-donor-backend:latest

# Push image
docker push us-docker.pkg.dev/agp-donor/agp-donor-backend/agp-donor-backend:latest

# Deploy to Cloud Run
gcloud run deploy agp-donor-backend \
  --image us-docker.pkg.dev/agp-donor/agp-donor-backend/agp-donor-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 4000 \
  --set-env-vars NODE_ENV=production,FRONTEND_URL=$FRONTEND_URL,SUPABASE_URL=$SUPABASE_URL,SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY,SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY,GROQ_API_KEY=$GROQ_API_KEY