#!/bin/bash

SERVICE_NAME=agp-donor-backend
REGION=us-central1

# Update Cloud Run with env vars from shell
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --set-env-vars \
NODE_ENV=$NODE_ENV,\
SUPABASE_URL=$SUPABASE_URL,\
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY,\
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY,\
GROQ_API_KEY=$GROQ_API_KEY,\
FRONTEND_URL=$FRONTEND_URL