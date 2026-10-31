-- Migration: lägg till skyttestöd på results-tabellen
-- Kör detta i Supabase SQL Editor om du redan har kört schema.sql tidigare

alter table results
  add column if not exists shooter_name text,
  add column if not exists shooter_nr int,
  add column if not exists bana int,
  add column if not exists serie text,
  add column if not exists series_scores jsonb;
