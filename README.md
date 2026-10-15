# Secret Santa

Secret Santa è un'app mobile per organizzare un'edizione del Secret Santa
tra amici. È sviluppata con Expo, React Native e TypeScript; il backend
utilizza Supabase per PostgreSQL, autenticazione Google, Row Level Security
(RLS) e funzioni server.

## Requisiti

- Node.js 20 o superiore
- Docker Desktop avviato, per il database Supabase locale
- Supabase CLI
- Un development build Expo per le funzionalità native di autenticazione
  Google; Expo Go non è sufficiente per l'app completa

Installare le dipendenze del progetto con:

```bash
npm install
```

Creare il file `.env` a partire da
[`.env.example`](.env.example) e inserire l'URL e la chiave anonima del
progetto Supabase. Le variabili `EXPO_PUBLIC_*` sono pubbliche e non devono
contenere segreti.

## Avvio dell'app

Avviare il server di sviluppo Expo:

```bash
npm start
```

Sono disponibili anche i comandi per una piattaforma specifica:

```bash
npm run android
npm run ios
npm run web
```

Per Android e iOS è necessario usare un development build quando sono
richiesti moduli nativi non inclusi in Expo Go.

## Avvio del database locale

Con Docker Desktop in esecuzione, avviare i servizi Supabase locali dalla
radice del progetto:

```bash
supabase start
supabase status
```

Il comando `supabase status` mostra gli endpoint e le chiavi locali da
riportare nel file `.env`. Per arrestare i servizi:

```bash
supabase stop
```

## Script npm

| Script | Descrizione |
| --- | --- |
| `npm start` | Avvia Expo |
| `npm run android` | Avvia Expo con il target Android |
| `npm run ios` | Avvia Expo con il target iOS |
| `npm run web` | Avvia Expo per il web |
| `npm run lint` | Esegue ESLint tramite Expo |
| `npm run typecheck` | Esegue il controllo dei tipi TypeScript |
| `npm run format` | Formatta i file con Prettier |
| `npm test` | Esegue i test Jest |

## Struttura delle cartelle

```text
.
├── assets/                 # Asset grafici dell'app
├── docs/                   # Specifica, architettura e decisioni di sviluppo
├── src/
│   ├── app/                # Schermate e layout Expo Router
│   ├── components/         # Componenti riutilizzabili
│   ├── constants/          # Tema e costanti dell'app
│   ├── features/           # Funzionalità organizzate per area
│   ├── hooks/              # Hook condivisi
│   ├── i18n/               # Testi localizzati
│   ├── lib/                # Integrazioni e utility condivise
│   └── types/              # Tipi dell'app
├── test/                   # Supporto ai test
├── app.json                # Configurazione Expo
└── package.json            # Dipendenze e script npm
```

## Documentazione

- [Specifica funzionale](docs/spec/functional-spec.md)
- [Architettura](docs/architecture.md)
- [Decisioni di sviluppo](docs/dev-decisions.md)
- [Avanzamento del progetto](docs/PROGRESS.md)
- [Istruzioni per Copilot](.github/copilot-instructions.md)
