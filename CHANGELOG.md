# Ändringslogg

Alla nya versioner och ändringar av Luftgevärstracker dokumenteras här.

## 2026-06-28

- Lade till ikon för luftgevärsskytte istället för textrubrik, samt dropdown-meny i headern för att växla mellan "Nytt pass", "Planerade pass" och "Resultat".
- "Planerade pass" visar nu pass utan registrerat resultat, "Resultat" visar pass med registrerat resultat.
- Fixade ett buggat mobilläge där diagram och resultattabell kunde trycka ut hela sidans bredd.
- Vänsterjusterade text i passkorten (rubrik, datum, bana, anteckning) och knappen "Lägg till resultat".
- Lade till bekräftelsepopup innan man tar bort ett pass eller resultat, för att undvika oavsiktlig radering.
- Lade till knappen "Ändra resultat" så man kan redigera ett redan sparat resultat istället för att radera och lägga till på nytt.
- Punkterna i diagrammet "Utveckling över tid" färgas nu orange för tävlingsresultat och blå för träningsresultat.
- Lade till sortering (tidigast/senast) i "Planerade pass" och filtrering (Alla/Tävling/Träning) i "Resultat".

## 2026-06-26

- Lade till "Nytt i versionen"-knapp i appen som visar denna ändringslogg i en popup.

## 2026-06-26 (lansering)

- Första versionen av appen.
- Lägg till träningar och tävlingar med datum, plats och anteckningar.
- Registrera resultat per pass (totalpoäng, antal serier, skott per serie, inner-tior).
- Diagram som visar poängutveckling över tid.
- Supabase används som databas.
