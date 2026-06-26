export interface ReleaseNote {
  date: string
  items: string[]
}

// Håll denna i synk med CHANGELOG.md
export const releaseNotes: ReleaseNote[] = [
  {
    date: '2026-06-26',
    items: ['Lade till "Nytt i versionen"-knapp i appen som visar denna ändringslogg i en popup.'],
  },
  {
    date: '2026-06-26 (lansering)',
    items: [
      'Första versionen av appen.',
      'Lägg till träningar och tävlingar med datum, plats och anteckningar.',
      'Registrera resultat per pass (totalpoäng, antal serier, skott per serie, inner-tior).',
      'Diagram som visar poängutveckling över tid.',
      'Supabase används som databas.',
    ],
  },
]
