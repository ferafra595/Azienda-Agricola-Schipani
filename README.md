# Azienda Agricola Schipani — sito ufficiale

Sito statico + backend serverless progettato per **GitHub + Cloudflare Pages**.

## Cosa contiene
- Home premium e responsive in stile agricolo contemporaneo
- Pagina La nostra storia
- Catalogo prodotti dinamico
- Prezzi e formati modificabili da admin
- Scheda prodotto in modal
- Richiesta acquisto via WhatsApp
- Area `/admin.html` privata con login
- CRUD prodotti (crea, modifica, nascondi, elimina)
- Upload foto prodotto su Cloudflare R2
- Database prodotti su Cloudflare D1

## 1. Caricamento su GitHub
Carica **il contenuto di questa cartella** in un nuovo repository GitHub.

## 2. Cloudflare Pages
Crea un progetto Pages collegato al repository GitHub.

Impostazioni consigliate:
- Framework preset: None
- Build command: lascia vuoto
- Build output directory: `public`

Le Functions presenti nella cartella `/functions` verranno rilevate da Cloudflare Pages.

## 3. Crea D1
Da Cloudflare > Workers & Pages > D1 crea un database, per esempio `schipani-db`.
Esegui il file `migrations/0001_init.sql` sul database.

Nel progetto Pages aggiungi il binding D1:
- Variable name: `DB`
- Database: quello appena creato

## 4. Crea R2
Crea un bucket R2, per esempio `schipani-media`.
Nel progetto Pages aggiungi il binding R2:
- Variable name: `MEDIA`
- Bucket: quello appena creato

## 5. Password admin
In Settings > Variables and Secrets del progetto Pages aggiungi:
- `ADMIN_PASSWORD` = la password che vuoi usare
- `SESSION_SECRET` = una stringa lunga e casuale

## 6. WhatsApp
La configurazione viene letta dalla tabella `settings` di D1.
Dopo aver scelto il numero, esegui:

```sql
UPDATE settings SET value='393XXXXXXXXX' WHERE key='whatsapp';
```

Usa prefisso internazionale e solo numeri.

## 7. Dominio
Quando acquisterai il dominio, collegalo da Cloudflare Pages > Custom domains.

## Foto provvisorie
Le immagini ambientali della Home/Storia sono placeholder esterni e vanno sostituite con foto reali dell'azienda appena disponibili. Le foto dei prodotti, invece, si caricano direttamente dall'Admin e vengono salvate in R2.

## Nota sui contenuti
La storia dell'azienda presente nel sito è volutamente provvisoria, costruita su un arco narrativo di oltre 20 anni. Va sostituita con la storia reale quando sarà disponibile.
