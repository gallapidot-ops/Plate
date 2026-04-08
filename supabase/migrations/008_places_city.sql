-- Add city column to places table
-- Extracted from Google Places addressComponents (locality type)
-- Enables per-city filtering on the Profile screen

alter table places
  add column if not exists city text;
