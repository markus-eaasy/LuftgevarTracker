export interface ReleaseNote {
  date: string
  items: string[]
}

// Håll denna i synk med CHANGELOG.md
export const releaseNotes: ReleaseNote[] = [
  {
    date: '2026-11-22',
    items: [
      'Ledartavla med podium (Bästa poäng, Bästa snitt, Flest tior) och rankingtabell ersätter det gamla diagrammet i Resultat-vyn.',
      'Klicka på ett namn i ledartavlan för att se skyttens utveckling i en popup.',
      'Popupen visar trendindikatorer (↑↓→) för poäng och tior baserat på linjär regression.',
      'Grafen i popupen visar rådata, löpande viktat medelvärde (EWA) och linjär trendlinje — separata rutor för poäng och tior.',
      'Passkorten är nu ihopfällda som standard — klicka för att öppna.',
      'Bildanalys (OCR) flyttad till Vercel serverless-funktion för snabbare och mer tillförlitlig tolkning.',
    ],
  },
  {
    date: '2026-06-28',
    items: [
      'Lade till ikon för luftgevärsskytte istället för textrubrik, samt dropdown-meny i headern för att växla mellan "Nytt pass", "Planerade pass" och "Resultat".',
      '"Planerade pass" visar nu pass utan registrerat resultat, "Resultat" visar pass med registrerat resultat.',
      'Fixade ett buggat mobilläge där diagram och resultattabell kunde trycka ut hela sidans bredd.',
      'Vänsterjusterade text i passkorten (rubrik, datum, bana, anteckning) och knappen "Lägg till resultat".',
      'Lade till bekräftelsepopup innan man tar bort ett pass eller resultat, för att undvika oavsiktlig radering.',
      'Lade till knappen "Ändra resultat" så man kan redigera ett redan sparat resultat istället för att radera och lägga till på nytt.',
      'Punkterna i diagrammet "Utveckling över tid" färgas nu orange för tävlingsresultat och blå för träningsresultat.',
      'Lade till sortering (tidigast/senast) i "Planerade pass" och filtrering (Alla/Tävling/Träning) i "Resultat".',
    ],
  },
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
