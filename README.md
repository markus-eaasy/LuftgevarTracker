# Luftgevärstracker

Webbapp för att logga träningar och tävlingar i luftgevärsskytte och följa resultat över tid.

## Komma igång

1. Skapa ett gratis projekt på [supabase.com](https://supabase.com).
2. Öppna **SQL Editor** i Supabase och kör innehållet i [`supabase/schema.sql`](supabase/schema.sql).
3. Gå till **Project Settings → API** och kopiera **Project URL** och **anon public key**.
4. Kopiera `.env.example` till `.env` och fyll i värdena:

   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=din-anon-nyckel
   ```

5. Installera beroenden och starta appen:

   ```
   npm install
   npm run dev
   ```

## Funktioner

- Lägg till träningar och tävlingar med datum, plats och anteckningar.
- Registrera resultat (totalpoäng, antal serier/skott, inner-tior) per pass.
- Se utveckling över tid i ett diagram baserat på alla registrerade resultat.

## Säkerhet

Databasens RLS-policy i `supabase/schema.sql` tillåter all läsning/skrivning utan inloggning,
vilket passar för privat bruk där ingen delar projektets URL/nyckel offentligt. Om appen ska
publiceras på internet bör autentisering läggas till och policyn begränsas till inloggade användare.
