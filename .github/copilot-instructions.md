Secret Santa – contesto per Copilot

Cos'è: app mobile (Expo, React Native, TypeScript) per organizzare il Secret Santa tra amici. Backend Supabase: Postgres, Auth Google, RLS, Edge Functions. Specifica completa in docs/spec/functional-spec.md (v1.0). Le decisioni sono chiuse e raccolte nella sezione 10 della specifica.

Prima di ogni lavoro:

- Leggi docs/PROGRESS.md e docs/architecture.md.
- Leggi solo le sezioni della specifica che riguardano il compito (indicate nel prompt, oppure trovale con gli ID dei requisiti, per esempio EST-4 o DOM-5).
- Se la richiesta contraddice la specifica, fermati e segnalalo prima di scrivere codice.

Regole di dominio non negoziabili:

- Segretezza: i client non leggono mai la tabella assignments. Il proprio destinatario si ottiene solo con la funzione get_my_recipient. Nessuna query dell'app deve poter restituire abbinamenti, missioni, domande, ipotesi o voti di altri utenti.
- Estrazione: o si trova un abbinamento che rispetta tutti i vincoli insieme, o si restituisce la diagnosi dei conflitti. Mai correzioni manuali a posteriori.
- Ruoli e stati dell'edizione sono imposti dal server (funzioni SQL e RLS). L'app nasconde i pulsanti ma non è mai l'unico controllo.
- Stati dell'edizione: configuration, signups, drawn, evening, concluded, più il flag incomplete.
- Nell'MVP niente notifiche e niente testo libero tra giocatori.

Stack e convenzioni:

- TypeScript strict, niente any. Componenti funzionali e hook. Expo Router per la navigazione. TanStack Query per i dati.
- Struttura per funzionalità: src/features/<area> con componenti, hook, API e test della stessa area.
- Codice, commenti, nomi di tabelle, colonne e funzioni, messaggi di commit in inglese (snake_case nel database, camelCase in TypeScript). Testi dell'interfaccia in italiano, sempre da src/i18n/it.ts, mai stringhe fisse nei componenti.
- Il database si modifica solo con migrazioni in supabase/migrations, una per cambiamento, con RLS e test pgTAP in supabase/tests. I tipi in src/types/database.ts si rigenerano, non si modificano a mano.
- La logica sul server sta in funzioni Postgres (security definer, search_path impostato, controlli su ruolo e stato) o in Edge Functions in supabase/functions. Il solver sta in supabase/functions/_shared/solver.
- Mai chiavi o segreti nel codice. Variabili pubbliche con prefisso EXPO_PUBLIC_, le altre solo nei segreti di Supabase.
- Ogni schermata gestisce caricamento, errore e stato vuoto.

Qualità:

- Per ogni modifica scrivi o aggiorna i test: Jest e React Native Testing Library per l'app, pgTAP per il database, test Deno per Edge Functions e solver.
- Prima di dichiarare finito esegui npm run lint, npm run typecheck, npm test e, se hai toccato il database, npm run db:test.
- Modifiche piccole e mirate: non rifattorizzare file non coinvolti.

Documentazione da tenere aggiornata:

- A fine compito aggiungi una riga al registro in docs/PROGRESS.md (data, ID del prompt o descrizione, file principali).
- Se cambia l'architettura o un flusso, aggiorna docs/architecture.md.
- Se prendi una decisione non prevista dalla specifica, scrivila in docs/dev-decisions.md.
- Se cambia il comportamento previsto, segnalalo: la specifica la aggiorna l'utente.

Comandi utili: npx expo start; npm run lint; npm run typecheck; npm test; npm run db:start; npm run db:reset; npm run db:test; npm run db:types.
