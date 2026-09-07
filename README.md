# Azienda Agricola Schipani — versione semplificata

Struttura volutamente ridotta per Cloudflare Pages + GitHub.

## Cartelle
- `public/` = tutto il sito visibile
- `functions/api/[[path]].js` = tutta la logica API/Admin in un solo file
- `schema.sql` = database D1

## Cloudflare Pages
- Framework: Nessuna
- Build command: `exit 0`
- Build output directory: `public`
- Root directory: vuota

## Binding
- D1: variabile `DB`
- R2: variabile `MEDIA`

## Segreti
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

## Database
Esegui `schema.sql` sul database D1 una sola volta.
