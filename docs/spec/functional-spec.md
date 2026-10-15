# Specifica funzionale – App Secret Santa (MVP)

Versione 1.0, pronta per lo sviluppo. Tutte le decisioni sono chiuse (sezione 10) e i cataloghi nativi di domande e missioni sono nelle sezioni 13 e 14.

## 1. Obiettivo e ambito

App mobile per Android e iOS con cui un gruppo di amici organizza il Secret Santa: crea il gruppo, esegue un'estrazione che rispetta tutti i vincoli, offre giochi per la serata (domande anonime, missioni segrete, ipotesi sui mittenti, premi finali) e conserva lo storico tra un anno e l'altro.

**Principi guida**

- **Segretezza**: ogni partecipante vede solo il proprio destinatario; nessuno vede l'elenco completo nell'interfaccia, amministratore incluso.
- **Correttezza**: l'estrazione produce un abbinamento che soddisfa tutti i vincoli insieme, oppure dichiara che non esiste e indica come correggere le regole. Non si estrae mai per poi correggere a mano.
- **Opzionalità**: domande, missioni, ipotesi e premi si attivano edizione per edizione.
- **Semplicità**: nessuna notifica e nessun testo libero tra giocatori nell'MVP; solo scelte da catalogo e risposte sì/no.

**Dimensioni di riferimento**: gruppi fino a 30 membri, edizioni fino a 30 partecipanti, uso concentrato nelle settimane prima dello scambio.

**Lingua, valuta, fuso**: italiano, euro, fuso orario del gruppo (predefinito Europe/Rome).

## 2. Attori, ruoli e permessi

| Ruolo          | Descrizione                                          | Può fare                                                                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Utente         | Persona autenticata con account Google               | Creare gruppi, entrare con un invito, gestire il profilo, cancellare l'account                                                                                                                                                            |
| Candidato      | Entrato con link o codice, in attesa di approvazione | Vedere nome del gruppo e stato della richiesta; annullare la richiesta                                                                                                                                                                    |
| Membro         | Approvato dall'amministratore                        | Vedere gruppo, membri, edizioni e storico consentito; partecipare alle edizioni; uscire dal gruppo                                                                                                                                        |
| Partecipante   | Membro iscritto a una specifica edizione             | Usare le funzioni di gioco di quell'edizione                                                                                                                                                                                              |
| Amministratore | Creatore del gruppo; uno solo per gruppo             | Quanto fa un membro, più: approvare e rifiutare candidati, rimuovere membri, gestire gli inviti, creare e configurare edizioni, eseguire o annullare l'estrazione, avviare e chiudere la serata, trasferire il ruolo, eliminare il gruppo |

Regole sui ruoli:

- L'amministratore partecipa come gli altri, salvo che scelga di non farlo. In ogni caso non vede abbinamenti, missioni, domande, ipotesi né voti altrui.
- L'amministratore può trasferire il ruolo a un altro membro approvato. Finché nel gruppo ci sono altri membri non può uscire né cancellare l'account: deve prima trasferire il ruolo o eliminare il gruppo.
- Un candidato rifiutato non può rientrare con lo stesso link; solo l'amministratore può riammetterlo dall'elenco dei rifiutati.
- Un membro rimosso o uscito perde l'accesso al gruppo; se ha partecipato a edizioni concluse resta nello storico come «Ex partecipante».

## 3. Concetti e regole di dominio

| Termine                | Definizione                                                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gruppo                 | Contenitore permanente: nome, membri, regole di esclusione permanenti, edizioni e storico                                                                                        |
| Edizione               | Un Secret Santa di un anno: nome, data, budget, opzioni, stato, partecipanti, abbinamenti                                                                                        |
| Partecipante           | Membro che prende parte a una specifica edizione                                                                                                                                 |
| Abbinamento            | Coppia donatore → destinatario valida per una sola edizione                                                                                                                      |
| Regola di esclusione   | Reciproca (A non pesca B e B non pesca A) oppure unidirezionale (A non pesca B, ma B può pescare A). Può essere di gruppo (permanente, riproposta a ogni edizione) o di edizione |
| Anti-ripetizione       | Vincolo che vieta di ripetere coppie donatore → destinatario delle ultime N edizioni concluse                                                                                    |
| Domanda                | Quesito da catalogo posto in forma anonima dal donatore al destinatario; risposta solo sì/no                                                                                     |
| Missione               | Compito segreto da catalogo o personalizzato, uno per partecipante                                                                                                               |
| Ipotesi                | Scommessa segreta di un partecipante su chi ha fatto il regalo a un'altra persona                                                                                                |
| Voto premio            | Voto segreto in una delle quattro categorie                                                                                                                                      |
| Serata                 | Fase in cui si scambiano i regali e si giocano ipotesi e votazioni                                                                                                               |
| Rivelazione            | Momento in cui, alla chiusura della serata, si mostrano abbinamenti, ipotesi, statistiche, premi e missioni                                                                      |
| Snapshot dei risultati | Copia dei risultati aggregati salvata alla chiusura e conservata nello storico                                                                                                   |

Vincoli di dominio:

- Un gruppo ha al massimo un'edizione non conclusa alla volta.
- Solo i membri approvati possono essere partecipanti.
- Gli abbinamenti appartengono a un'edizione e non cambiano finché l'estrazione non viene annullata.
- Le regole di esclusione di gruppo si applicano alle nuove edizioni e possono essere disattivate per una singola edizione.

Limiti e validazioni:

| Campo                           | Vincolo                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------- |
| Nome gruppo, nome edizione      | 3–40 caratteri                                                                    |
| Nome visualizzato               | 2–30 caratteri                                                                    |
| Budget massimo                  | Facoltativo, intero da 1 a 1000 euro                                              |
| Data e ora dello scambio        | Obbligatoria prima dell'estrazione; deve essere futura al momento dell'estrazione |
| Membri per gruppo               | Massimo 30                                                                        |
| Partecipanti per edizione       | Minimo 3, massimo 30                                                              |
| Domande per persona             | Da 1 a 10, predefinito 5                                                          |
| Anti-ripetizione                | Da 0 (disattivata) a 5 edizioni, predefinito 2                                    |
| Missioni personalizzate         | Massimo 40 per edizione, 140 caratteri ciascuna                                   |
| Codice di invito                | 8 caratteri alfanumerici, valido 30 giorni                                        |
| Richieste di ingresso in attesa | Massimo 50 per gruppo                                                             |

## 4. Ciclo di vita dell'edizione

| Stato                 | Cosa succede                                                                                                                                     | Chi lo fa avanzare                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Configurazione        | L'amministratore imposta nome, data, budget, opzioni e regole. L'edizione è visibile solo a lui                                                  | Amministratore: «Apri iscrizioni» (richiede nome e data)   |
| Iscrizioni            | L'edizione è visibile ai membri, che indicano «Partecipo» o «Non partecipo». L'amministratore definisce le regole e può correggere le iscrizioni | Amministratore: «Esegui estrazione»                        |
| Estrazione effettuata | Ognuno vede il proprio destinatario e la propria missione; si possono porre domande e rispondere                                                 | Amministratore: «Avvia serata»                             |
| Serata in corso       | Si scambiano i regali; si inseriscono ipotesi e voti; si segnano missioni completate                                                             | Amministratore: «Chiudi serata», oppure scadenza impostata |
| Serata conclusa       | Rivelazione di abbinamenti, ipotesi, statistiche, premi e missioni; l'edizione è in sola lettura e confluisce nello storico                      | Stato finale                                               |

Transizioni all'indietro: solo «Annulla estrazione» (da «Estrazione effettuata» a «Iscrizioni»). «Rifai estrazione» è lo stesso flusso: annulla ed esegue di nuovo in un solo passaggio.

Permessi per stato:

| Azione                                         | Config. | Iscrizioni | Estraz. effettuata | Serata in corso | Conclusa |
| ---------------------------------------------- | ------- | ---------- | ------------------ | --------------- | -------- |
| Modificare nome, data, ora, budget             | admin   | admin      | admin              | admin           | no       |
| Modificare partecipanti e regole               | admin   | admin      | no                 | no              | no       |
| Attivare o disattivare domande, ipotesi, premi | admin   | admin      | admin              | no              | no       |
| Scegliere la fonte delle missioni              | admin   | admin      | no                 | no              | no       |
| Porre domande                                  | no      | no         | sì                 | no              | no       |
| Rispondere alle domande                        | no      | no         | sì                 | sì              | no       |
| Segnare la missione come completata            | no      | no         | sì                 | sì              | no       |
| Inserire ipotesi e voti                        | no      | no         | no                 | sì              | no       |
| Eliminare l'edizione                           | admin   | admin      | no                 | no              | no       |

Edizione incompleta: se dopo l'estrazione un partecipante esce, viene rimosso o cancella l'account, l'edizione resta nel suo stato ma è contrassegnata come «incompleta». Tutti vedono un avviso; non si possono porre nuove domande né avviare la serata finché l'amministratore non annulla l'estrazione e la rifà senza quella persona.

## 5. Requisiti funzionali

### 5.1 Autenticazione e profilo

- **AUT-1** Accesso esclusivamente con account Google. Alla prima registrazione si crea il profilo con nome e foto di Google.
- **AUT-2** Il nome visualizzato è modificabile nell'app (2–30 caratteri); la foto resta quella di Google.
- **AUT-3** La sessione resta attiva sul dispositivo finché l'utente non esce.
- **AUT-4** L'utente può uscire e cancellare l'account; la cancellazione segue la regola di anonimizzazione (D-36) e l'amministratore di un gruppo con altri membri deve prima trasferire il ruolo.
- **AUT-5** Prima della pubblicazione su App Store si verifica se è richiesto anche «Accedi con Apple»; in tal caso si aggiunge come secondo provider.

### 5.2 Gruppi, inviti e membri

- **GRP-1** Ogni utente può creare un gruppo (nome 3–40 caratteri) e ne diventa amministratore.
- **GRP-2** Invito tramite link e codice di 8 caratteri; valido 30 giorni, riutilizzabile, revocabile. Rigenerarlo invalida il precedente.
- **GRP-3** Chi usa link o codice crea una richiesta di ingresso e vede solo il nome del gruppo e lo stato.
- **GRP-4** L'amministratore vede le richieste (nome e foto) e le approva o rifiuta; massimo 50 richieste in attesa.
- **GRP-5** Il candidato può annullare la propria richiesta.
- **GRP-6** L'amministratore può rimuovere un membro; un membro può uscire. Se la persona è partecipante di un'edizione già estratta, l'edizione diventa «incompleta».
- **GRP-7** Trasferimento del ruolo di amministratore a un membro approvato, con conferma.
- **GRP-8** Eliminazione del gruppo da parte dell'amministratore, con conferma scrivendo il nome; cancella edizioni, storico e dati collegati.
- **GRP-9** La home elenca i gruppi dell'utente e consente di crearne uno o di unirsi con un codice.

### 5.3 Edizione e impostazioni

- **EDZ-1** Creazione: nome (predefinito «Secret Santa» e anno), data e ora dello scambio nel fuso del gruppo, budget massimo facoltativo in euro.
- **EDZ-2** «Nuova edizione» propone le impostazioni dell'ultima edizione conclusa: opzioni, parametri, regole di gruppo e partecipanti.
- **EDZ-3** Opzioni di gioco attivabili una per una: domande anonime (massimo per persona, singole domande del catalogo disattivabili), missioni segrete (fonte nativa, personalizzata o entrambe; esclusione delle missioni natalizie; elenco personalizzato), ipotesi sui mittenti, premi finali (categorie fisse).
- **EDZ-4** Chiusura automatica facoltativa: data e ora oltre le quali la serata si chiude da sola. Vale anche come termine di votazione.
- **EDZ-5** In «Iscrizioni» ogni membro approvato indica «Partecipo» o «Non partecipo»; l'amministratore può correggere qualunque indicazione. Chi ha partecipato all'ultima edizione parte da «Partecipo», gli altri da «Non risposto». Entrano nell'estrazione solo i «Partecipo».
- **EDZ-6** L'amministratore ha una casella «Partecipo anch'io», attiva di default.
- **EDZ-7** Dopo l'estrazione restano modificabili nome, data, ora e budget (la dashboard mostra un avviso «Data modificata» o «Budget modificato» ai partecipanti); partecipanti, regole e fonte delle missioni richiedono di annullare l'estrazione.
- **EDZ-8** Si può eliminare un'edizione solo in «Configurazione» o «Iscrizioni».

### 5.4 Regole di abbinamento ed estrazione

- **EST-1** Esclusione reciproca: A non può pescare B e B non può pescare A.
- **EST-2** Esclusione unidirezionale: A non può pescare B, ma B può pescare A.
- **EST-3** Nessuno pesca sé stesso.
- **EST-4** Anti-ripetizione: vincolo rigido sulle ultime N edizioni concluse (0–5, predefinito 2). Contano solo le coppie in cui entrambe le persone sono ancora partecipanti.
- **EST-5** Opzione «vieta scambi diretti» (A dà a B e B dà ad A), disattivata di default.
- **EST-6** Le regole di esclusione sono visibili e modificabili solo dall'amministratore, per non fornire indizi ai partecipanti. Le regole di gruppo vengono riproposte a ogni nuova edizione.
- **EST-7** Prerequisiti dell'estrazione: edizione in «Iscrizioni», almeno 3 partecipanti, data dello scambio futura.
- **EST-8** L'estrazione gira sul server con generatore casuale sicuro, in un'unica transazione, con blocco sull'edizione: due richieste simultanee producono un solo risultato.
- **EST-9** Esito positivo: l'amministratore vede solo la conferma («Estrazione completata, N abbinamenti»), non gli abbinamenti. Ogni partecipante vede il proprio destinatario alla successiva apertura o aggiornamento.
- **EST-10** Esito negativo: non viene salvato nulla e l'app mostra la diagnosi. Elenca le regole in conflitto (persone e tipo di regola) e propone correzioni con un pulsante per applicarle (rimuovere una regola, ridurre l'anti-ripetizione, aggiungere partecipanti), poi permette di riprovare.
- **EST-11** Annullare o rifare l'estrazione richiede conferma e mostra cosa verrà perso: abbinamenti, domande e risposte, missioni assegnate. L'edizione torna a «Iscrizioni».
- **EST-12** Cambiare un partecipante dopo l'estrazione è possibile solo annullando e rifacendo l'estrazione.
- **EST-13** Viene registrato un log tecnico (data, ora, azione, numero di partecipanti, esito) senza abbinamenti.
- **EST-14** Gli abbinamenti restano nello storico e alimentano l'anti-ripetizione solo quando l'edizione è conclusa.

### 5.5 Dashboard dell'edizione

Contenuti: nome del gruppo e dell'edizione; data dello scambio; countdown; budget massimo; stato dell'edizione; stato personale (abbinamento ricevuto, domande in attesa, missione assegnata); accesso alle funzioni attivate; per l'amministratore le azioni di avanzamento dello stato.

- **DSH-1** Il countdown si aggiorna da solo (giorni, ore, minuti, secondi) mentre la schermata è aperta.
- **DSH-2** Dopo la data dello scambio il countdown diventa «È il giorno!» finché la serata non è chiusa; se la serata non è ancora stata avviata l'amministratore vede un promemoria.
- **DSH-3** Aggiornamento senza notifiche: refetch all'apertura e quando l'app torna in primo piano, «tira per aggiornare», polling ogni 30 secondi mentre la dashboard e le schermate di gioco sono visibili.
- **DSH-4** Avvisi visibili: «Edizione incompleta», «Data modificata», «Budget modificato», «Domande in attesa di risposta».

### 5.6 Domande anonime

- **DOM-1** Catalogo nativo di 40 domande (sezione 13); nessun testo libero.
- **DOM-2** Il donatore sceglie una domanda dal catalogo e la invia al proprio destinatario in forma anonima.
- **DOM-3** Il destinatario risponde solo sì o no; non c'è l'opzione di saltare.
- **DOM-4** Limite massimo di domande per persona (1–10, predefinito 5). Le domande in attesa contano nel limite.
- **DOM-5** La stessa domanda non può essere posta due volte allo stesso destinatario.
- **DOM-6** Finché il destinatario non risponde la domanda resta «in attesa» e il donatore la vede come tale.
- **DOM-7** Si possono porre domande da «Estrazione effettuata» fino all'avvio della serata; si può rispondere fino alla chiusura.
- **DOM-8** Il destinatario non vede chi ha posto la domanda; nessun altro, amministratore incluso, vede domande o risposte.

### 5.7 Missioni segrete

- **MIS-1** Pool di missioni: catalogo nativo (sezione 14), personalizzate dell'amministratore, o entrambe; le missioni natalizie sono escludibili.
- **MIS-2** Il server assegna a caso una missione a ogni partecipante al momento dell'estrazione. Se le missioni sono meno dei partecipanti, si riusano solo dopo aver usato tutte le altre.
- **MIS-3** La missione è visibile solo al suo assegnatario; l'amministratore non vede chi ha quale missione, anche se ha scritto lui le personalizzate.
- **MIS-4** Il completamento è un'autodichiarazione («Segna come completata»), annullabile fino alla chiusura.
- **MIS-5** Alla chiusura missioni ed esiti sono mostrati a tutti.

### 5.8 Serata e ipotesi sui mittenti

- **SER-1** L'amministratore avvia la serata; da quel momento si aprono ipotesi e votazioni.
- **SER-2** Ogni partecipante tocca «Ho ricevuto il regalo» (autodichiarazione) per sbloccare l'ipotesi su chi ha fatto il regalo a lui.
- **SER-3** Per ciascun altro partecipante X, escluso il proprio destinatario (di cui conosce già il donatore: sé stesso), si può indicare chi si pensa abbia fatto il regalo a X. Le scelte possibili sono tutti i partecipanti tranne X e tranne sé stessi.
- **SER-4** Le ipotesi sono segrete e modificabili fino alla chiusura; non è obbligatorio inserirle tutte.
- **SER-5** Ognuno vede, mentre inserisce, solo le proprie ipotesi e quante ne ha inserite rispetto a quante possibili.

### 5.9 Statistiche

Calcolate dal server alla chiusura e conservate nello snapshot.

- **STA-1** Percentuale di abbinamenti indovinati del gruppo: ipotesi corrette diviso ipotesi inserite.
- **STA-2** Numero di ipotesi corrette, per partecipante e complessivo, con classifica; a pari merito si mostrano insieme.
- **STA-3** Partecipante con più intuizioni corrette.
- **STA-4** Coppie indovinate più frequentemente: le prime tre coppie donatore → destinatario per numero di ipotesi corrette ricevute.
- **STA-5** Miglior depistatore: il donatore con la quota più bassa di ipotesi corrette tra quelle ricevute (minimo 3 ipotesi ricevute).
- **STA-6** Risultati complessivi: ipotesi inserite, corrette e copertura (inserite diviso possibili).
- **STA-7** Ognuno vede, con segno di giusto o sbagliato, le proprie ipotesi; le ipotesi degli altri restano private.

### 5.10 Premi finali

| Categoria            | Testo di aiuto mostrato accanto al voto                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Regalo più bello     | Il regalo che avresti voluto ricevere tu                                                                                      |
| Regalo più brutto    | Il più disastroso, in senso affettuoso                                                                                        |
| Regalo più originale | Il più creativo o inaspettato                                                                                                 |
| Miglior bluff        | Il regalo il cui donatore ha depistato meglio gli altri: indizi falsi, confezione ingannevole, sospetti fatti cadere su altri |

- **PRM-1** Un voto per categoria per ogni partecipante; non è obbligatorio votare in tutte.
- **PRM-2** Si vota il regalo, identificato dal nome del destinatario; il premio va al donatore.
- **PRM-3** Non si può votare il regalo che si è fatto; si può votare quello ricevuto.
- **PRM-4** Il voto è segreto e modificabile fino alla chiusura.
- **PRM-5** I risultati compaiono solo alla chiusura della serata (da parte dell'amministratore o per scadenza). In caso di parità i vincitori sono mostrati ex aequo.

### 5.11 Chiusura della serata e rivelazione

- **CLS-1** L'amministratore chiude la serata con conferma, che indica quante persone non hanno ancora inserito ipotesi o voti; oppure la chiusura avviene alla scadenza impostata (EDZ-4).
- **CLS-2** Alla chiusura il server calcola statistiche, premi ed esiti delle missioni, salva lo snapshot e rende consultabili gli abbinamenti.
- **CLS-3** Ordine di rivelazione: abbinamenti e ipotesi, statistiche, premi, missioni.
- **CLS-4** Dopo la chiusura l'edizione è in sola lettura. I dettagli delle singole ipotesi, dei voti e delle risposte alle domande vengono eliminati dopo 30 giorni; lo snapshot resta.

### 5.12 Gruppi ricorrenti e storico

- **STO-1** Il gruppo resta disponibile dopo ogni edizione e propone «Nuova edizione» con i dati dell'ultima.
- **STO-2** Per ogni edizione si possono aggiungere o togliere partecipanti (EDZ-5).
- **STO-3** Lo storico elenca le edizioni concluse: data, partecipanti, abbinamenti, premi, statistiche, missioni ed esiti.
- **STO-4** Un membro vede il dettaglio completo (abbinamenti inclusi) delle sole edizioni concluse a cui ha partecipato; per le altre vede nome, data e partecipanti.
- **STO-5** Gli abbinamenti delle edizioni in corso restano segreti.
- **STO-6** Persone uscite o cancellate appaiono come «Ex partecipante».
- **STO-7** Le regole anti-ripetizione e le regole di esclusione di gruppo si basano sul gruppo e sullo storico.

## 6. Schermate e flussi principali

| Schermata             | Contenuto                                                                                                            | Ruolo                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Accesso               | Pulsante «Continua con Google»                                                                                       | Tutti                  |
| Home                  | Elenco gruppi, «Crea gruppo», «Unisciti con codice»                                                                  | Utente                 |
| Attesa approvazione   | Nome del gruppo, stato della richiesta, «Annulla richiesta»                                                          | Candidato              |
| Gruppo                | Membri, edizione corrente, storico, impostazioni                                                                     | Membro                 |
| Gestione gruppo       | Richieste in attesa, rifiutati, invito (link, codice, rigenera), regole di gruppo, trasferimento ruolo, eliminazione | Amministratore         |
| Dashboard edizione    | Contenuti di 5.5 e azioni per stato                                                                                  | Membro                 |
| Impostazioni edizione | Nome, data, budget, opzioni di gioco, missioni personalizzate, regole, iscrizioni                                    | Amministratore         |
| Iscrizioni            | «Partecipo» o «Non partecipo»; per l'amministratore elenco completo                                                  | Membro, amministratore |
| Esito estrazione      | Conferma oppure diagnosi del conflitto con correzioni applicabili                                                    | Amministratore         |
| Il mio destinatario   | Nome del destinatario e budget                                                                                       | Partecipante           |
| Domande               | Fai una domanda (catalogo), domande poste con stato, domande ricevute da cui rispondere                              | Partecipante           |
| La mia missione       | Testo e «Segna come completata»                                                                                      | Partecipante           |
| Serata                | «Ho ricevuto il regalo», ipotesi, voti                                                                               | Partecipante           |
| Rivelazione           | Quattro schermate in sequenza: abbinamenti e ipotesi, statistiche, premi, missioni                                   | Partecipante           |
| Storico               | Edizioni concluse e dettaglio                                                                                        | Membro                 |
| Profilo               | Nome visualizzato, esci, cancella account                                                                            | Utente                 |

Flussi:

1. **Primo accesso e ingresso**: accedi con Google → inserisci codice o apri il link → schermata di attesa → l'amministratore approva → il gruppo compare nella home.
2. **Preparazione e estrazione**: l'amministratore crea l'edizione → imposta data, opzioni e regole → apre le iscrizioni → i membri confermano → l'amministratore esegue l'estrazione → esito positivo oppure diagnosi da correggere.
3. **Prima della serata**: ognuno apre «Il mio destinatario» → pone domande dal catalogo → risponde a quelle ricevute → consulta la missione.
4. **Serata**: l'amministratore avvia → ognuno tocca «Ho ricevuto il regalo» → inserisce ipotesi e voti → segna la missione → l'amministratore chiude → rivelazione.
5. **Anno successivo**: nel gruppo si sceglie «Nuova edizione» → si aggiornano partecipanti e regole → si ripete dal punto 2.

## 7. Matrice di visibilità

| Informazione                      | Durante l'edizione                                                                                                 | Dopo la chiusura                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Abbinamenti                       | Ognuno vede solo il proprio destinatario; nessuno vede l'elenco, amministratore incluso                            | Partecipanti dell'edizione: tutti gli abbinamenti                |
| Regole di esclusione              | Solo l'amministratore                                                                                              | Solo l'amministratore                                            |
| Domande poste                     | Donatore: le proprie con stato. Destinatario: le ricevute, senza mittente                                          | Eliminate dopo 30 giorni                                         |
| Risposte                          | Solo il donatore che ha posto la domanda e il destinatario che l'ha data                                           | Eliminate dopo 30 giorni                                         |
| Missione                          | Solo l'assegnatario                                                                                                | Tutti i partecipanti, con esito                                  |
| «Ho ricevuto il regalo»           | Solo la persona stessa                                                                                             | Non mostrato                                                     |
| Ipotesi                           | Solo l'autore                                                                                                      | Ognuno vede le proprie con esito; degli altri solo gli aggregati |
| Voti dei premi                    | Solo l'autore                                                                                                      | Solo risultati e vincitori, non i singoli voti                   |
| Statistiche e premi               | Non disponibili                                                                                                    | Tutti i partecipanti                                             |
| Richieste di ingresso e rifiutati | Candidato e amministratore                                                                                         | Candidato e amministratore                                       |
| Storico                           | Solo edizioni concluse: dettaglio completo per quelle a cui si è partecipato, altrimenti nome, data e partecipanti | Idem                                                             |

## 8. Requisiti non funzionali

- **NFR-1 Prestazioni**: estrazione completata in meno di 3 secondi fino a 30 partecipanti; aperture di schermata sotto 1 secondo con rete normale.
- **NFR-2 Affidabilità**: tutte le operazioni critiche (estrazione, annullamento, chiusura, cancellazione account) sono transazionali e ripetibili senza effetti doppi.
- **NFR-3 Sicurezza**: Row Level Security su ogni tabella, nessun segreto nel client, ogni scadenza e ogni permesso verificati dal server.
- **NFR-4 Privacy**: informativa e consenso secondo GDPR, minimizzazione dei dati, cancellazione dell'account (D-36), conservazione limitata di ipotesi, voti e risposte (D-37), nessun tracciamento pubblicitario. L'informativa dichiara che lo sviluppatore ha accesso tecnico al database.
- **NFR-5 Accessibilità**: dimensione del testo di sistema rispettata, contrasto almeno AA, etichette per i lettori di schermo.
- **NFR-6 Rete**: nessun funzionamento offline; in assenza di rete l'app mostra un avviso e permette di riprovare.
- **NFR-7 Lingua**: italiano; tutte le stringhe in file di risorse per una futura localizzazione.
- **NFR-8 Compatibilità**: versioni minime di Android e iOS supportate dall'SDK Expo in uso.
- **NFR-9 Diagnostica**: segnalazione degli errori dell'app, senza abbinamenti né contenuti di gioco.

## 9. Architettura tecnica

### 9.1 Stack

- **App**: Expo (React Native) con TypeScript e Expo Router per navigazione e deep link; TanStack Query per le chiamate e l'aggiornamento dei dati.
- **Autenticazione**: Supabase Auth con provider Google. Su mobile si usa l'accesso Google nativo (libreria Google Sign-In per React Native) e si passa l'ID token a Supabase. Richiede un development build con EAS Build: non funziona in Expo Go.
- **Database**: Postgres su Supabase, con Row Level Security su ogni tabella.
- **Logica sensibile**: Edge Functions e funzioni Postgres. Il client non scrive mai abbinamenti, missioni, risultati o ipotesi altrui.
- **Aggiornamento dati**: refetch, pull to refresh e polling a 30 secondi (DSH-3). Supabase Realtime rimandato dopo l'MVP.
- **Attività pianificate**: job pianificato (pg\_cron o equivalente) per la chiusura automatica delle serate e per l'eliminazione dei dettagli dopo 30 giorni; la scadenza viene anche verificata alla lettura.
- **Build e distribuzione**: EAS Build ed EAS Submit per Android e iOS.

### 9.2 Modello dati

| Tabella                             | Contenuto                                                                   | Accesso dal client                                          |
| ----------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| profiles                            | Utente: id, nome visualizzato, foto                                         | Lettura dei membri dei propri gruppi                        |
| groups                              | Gruppo, fuso, id amministratore                                             | Lettura ai membri approvati                                 |
| group\_members                      | Appartenenza e stato (in attesa, approvato, rifiutato, uscito, rimosso)     | Lettura ai membri; modifica tramite funzioni                |
| group\_invites                      | Codice, link, scadenza, revoca                                              | Solo amministratore                                         |
| editions                            | Nome, data e ora in UTC, budget, opzioni, parametri, stato, flag incompleta | Lettura ai partecipanti; modifica tramite funzioni          |
| edition\_signups                    | Membro, edizione, stato (partecipo, non partecipo, non risposto)            | Lettura ai membri; modifica del proprio stato               |
| exclusion\_rules                    | Regola reciproca o unidirezionale, ambito (gruppo o edizione)               | Solo amministratore                                         |
| assignments                         | donatore → destinatario                                                     | Nessun accesso: solo funzioni server                        |
| draw\_log                           | Data, azione, esito, numero partecipanti                                    | Solo amministratore                                         |
| question\_catalog, mission\_catalog | Cataloghi nativi, con flag di attivazione e tema                            | Sola lettura                                                |
| edition\_disabled\_questions        | Domande disattivate per l'edizione                                          | Lettura ai partecipanti                                     |
| edition\_missions                   | Missioni personalizzate dell'amministratore                                 | Solo amministratore                                         |
| mission\_assignments                | Missione assegnata a un partecipante e stato di completamento               | Ognuno la propria riga                                      |
| edition\_questions                  | Domande poste e risposte                                                    | Donatore le proprie; destinatario le proprie senza mittente |
| gift\_received                      | Dichiarazione «Ho ricevuto il regalo»                                       | Ognuno la propria                                           |
| guesses                             | Ipotesi                                                                     | Ognuno le proprie fino alla chiusura                        |
| award\_votes                        | Voti dei premi                                                              | Ognuno i propri fino alla chiusura                          |
| edition\_results                    | Snapshot di statistiche, premi ed esiti missioni                            | Partecipanti, solo dopo la chiusura                         |

### 9.3 Funzioni server

| Funzione                              | Chi la chiama          | Cosa fa                                                                                              |
| ------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| join\_group                           | Utente                 | Valida il codice, crea la richiesta                                                                  |
| review\_member                        | Amministratore         | Approva, rifiuta o riammette un candidato                                                            |
| execute\_draw                         | Amministratore         | Controlla i prerequisiti, calcola e salva abbinamenti e missioni; altrimenti restituisce la diagnosi |
| cancel\_draw                          | Amministratore         | Elimina abbinamenti, domande e missioni; riporta a «Iscrizioni»                                      |
| get\_my\_recipient                    | Partecipante           | Restituisce una sola riga: il proprio destinatario                                                   |
| ask\_question, answer\_question       | Donatore, destinatario | Applica limite, unicità e stato                                                                      |
| start\_evening                        | Amministratore         | Passa a «Serata in corso»                                                                            |
| mark\_received, set\_guess, set\_vote | Partecipante           | Salva dichiarazione, ipotesi e voti secondo le regole                                                |
| close\_evening                        | Amministratore o job   | Calcola statistiche, premi ed esiti, salva lo snapshot, conclude l'edizione                          |
| transfer\_admin                       | Amministratore         | Trasferisce il ruolo                                                                                 |
| delete\_account                       | Utente                 | Anonimizza e cancella (D-36)                                                                         |

### 9.4 Algoritmo di estrazione

1. Si costruisce la matrice dei destinatari consentiti per ogni donatore: tutti tranne sé stesso, meno le esclusioni reciproche e unidirezionali, meno le coppie bloccate dall'anti-ripetizione.
2. Si verifica che esista un abbinamento perfetto sul grafo bipartito (algoritmo di Hopcroft-Karp). Se l'opzione «vieta scambi diretti» è attiva, il vincolo viene controllato durante la ricerca. Se non esiste soluzione, si passa al punto 6.
3. Si estrae con generatore crittografico (crypto.getRandomValues): si assegnano i donatori in ordine casuale, scegliendo a caso tra i destinatari ammessi e controllando a ogni passo che resti fattibile un abbinamento completo; se serve si torna indietro.
4. Si verificano di nuovo tutti i vincoli sul risultato.
5. Si salvano abbinamenti e missioni in un'unica transazione, con blocco sull'edizione.
6. Diagnosi: si cerca un sottoinsieme minimo di regole in conflitto rimuovendole una alla volta e ripetendo il controllo di fattibilità; si controllano anche numero minimo di partecipanti e anti-ripetizione. Il risultato diventa suggerimenti leggibili con pulsante di correzione.

La casualità non è garantita uniforme su tutte le soluzioni valide: è accettabile per questo uso.

### 9.5 Sicurezza e privacy

- RLS su tutte le tabelle; nessuna policy consente al client di leggere assignments.
- Le funzioni server controllano ruolo, stato dell'edizione e scadenze prima di ogni azione.
- Gli abbinamenti non sono cifrati: chi ha accesso alla console Supabase (lo sviluppatore) potrebbe leggerli. Va dichiarato nell'informativa e non c'è cifratura aggiuntiva nell'MVP.
- Cancellazione account: il profilo diventa «Ex partecipante» nello storico, gli abbinamenti conclusi restano senza dati personali per l'anti-ripetizione, e ipotesi, voti e risposte vengono eliminati. Un amministratore con altri membri deve prima trasferire il ruolo.
- Il link di invito apre l'app tramite deep link; per chi non ha ancora l'app esiste il codice di 8 caratteri.

### 9.6 Rischi principali

- **Accesso con Apple**: possibile richiesta in revisione App Store (AUT-5).
- **Accesso dello sviluppatore ai dati**: non eliminabile senza cifratura; accettato e dichiarato.
- **Assenza di notifiche**: domande e dichiarazioni dipendono dall'apertura dell'app; le notifiche push sono il primo passo dopo l'MVP.
- **Gruppi molto vincolati**: molte regole e anti-ripetizione alta aumentano i casi senza soluzione; la diagnosi serve a gestirli.
- **Ritiri dopo l'estrazione**: obbligano a rifare l'estrazione (edizione incompleta).

## 10. Registro delle decisioni

Tutte le decisioni sono chiuse. La colonna «Dove» rimanda alla sezione che le applica. La numerazione salta D-06, D-08 e D-10, che non sono mai state usate.

| ID   | Decisione                                                                                                                                                   | Dove    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| D-01 | Abbinamento come permutazione senza punti fissi; ciclo unico rimandato dopo l'MVP                                                                           | 5.4     |
| D-02 | Segretezza garantita dal server; accesso tecnico dello sviluppatore dichiarato nell'informativa; nessuna cifratura nell'MVP                                 | 9.5     |
| D-03 | Opzione «vieta scambi diretti», disattivata di default                                                                                                      | 5.4     |
| D-04 | Se non c'è soluzione: diagnosi con regole in conflitto e correzioni applicabili                                                                             | 5.4     |
| D-05 | Cinque stati con «Serata in corso»; una sola chiusura che rivela tutto                                                                                      | 4, 5.11 |
| D-07 | Anti-ripetizione rigida sulle ultime N edizioni, N da 0 a 5, predefinito 2                                                                                  | 5.4     |
| D-09 | Missioni assegnate a caso dal server all'estrazione; l'amministratore non vede le assegnazioni                                                              | 5.7     |
| D-11 | Dopo l'estrazione modificabili nome, data, ora, budget; domande, ipotesi e premi attivabili fino all'avvio della serata; missioni, partecipanti e regole no | 4       |
| D-12 | Fuso orario del gruppo, predefinito Europe/Rome; date salvate in UTC                                                                                        | 1, 9.2  |
| D-13 | Casualità non necessariamente uniforme su tutte le soluzioni                                                                                                | 9.4     |
| D-14 | Minimo 3 partecipanti, massimo 30                                                                                                                           | 3       |
| D-15 | L'amministratore partecipa di default, può scegliere di non farlo                                                                                           | 5.3     |
| D-16 | Un solo amministratore con trasferimento del ruolo; non può uscire né cancellare l'account con altri membri                                                 | 2       |
| D-17 | Invito con link e codice di 8 caratteri, valido 30 giorni, riutilizzabile, revocabile; massimo 50 richieste in attesa                                       | 5.2     |
| D-18 | Solo Google nell'MVP; accesso con Apple da verificare prima della pubblicazione                                                                             | 5.1     |
| D-19 | Partecipazione scelta per edizione, preselezionando chi ha partecipato all'ultima                                                                           | 5.3     |
| D-20 | Budget massimo facoltativo, intero in euro                                                                                                                  | 3       |
| D-21 | Nessuna chiusura automatica dell'edizione, salvo scadenza facoltativa impostata dall'amministratore                                                         | 5.3     |
| D-22 | Catalogo nativo di 40 domande                                                                                                                               | 13      |
| D-23 | Domande dall'estrazione all'avvio della serata; risposte fino alla chiusura                                                                                 | 5.6     |
| D-24 | Risposta solo sì/no, senza opzione di saltare                                                                                                               | 5.6     |
| D-25 | Missioni personalizzate in un pool comune con quelle native, a scelta dell'amministratore                                                                   | 5.7     |
| D-26 | Esiti delle missioni rivelati a tutti alla chiusura                                                                                                         | 5.7     |
| D-27 | Ipotesi aperte all'avvio della serata; la propria si sblocca con «Ho ricevuto il regalo»                                                                    | 5.8     |
| D-28 | Ipotesi modificabili fino alla chiusura                                                                                                                     | 5.8     |
| D-29 | Si ipotizza per tutti gli altri tranne il proprio destinatario; candidati: tutti tranne il destinatario dell'ipotesi e sé stessi                            | 5.8     |
| D-30 | Percentuale calcolata su ipotesi inserite; copertura mostrata a parte; depistatore con minimo 3 ipotesi                                                     | 5.9     |
| D-31 | «Miglior bluff» definito come regalo il cui donatore ha depistato meglio gli altri                                                                          | 5.10    |
| D-32 | Si vota il regalo (identificato dal destinatario); il premio va al donatore                                                                                 | 5.10    |
| D-33 | Non si vota il regalo fatto; si può votare quello ricevuto                                                                                                  | 5.10    |
| D-34 | Parità: vincitori ex aequo                                                                                                                                  | 5.10    |
| D-35 | Rivelazione in ordine: abbinamenti e ipotesi, statistiche, premi, missioni                                                                                  | 5.11    |
| D-36 | Cancellazione account: «Ex partecipante» nello storico, abbinamenti conclusi senza dati personali, ipotesi, voti e risposte eliminati                       | 9.5     |
| D-37 | Dettagli di ipotesi, voti e risposte eliminati 30 giorni dopo la chiusura; snapshot conservato                                                              | 5.11    |
| D-38 | Dettaglio dello storico solo per le edizioni a cui si è partecipato                                                                                         | 5.12    |
| D-39 | Expo e React Native con TypeScript                                                                                                                          | 9.1     |
| D-40 | Supabase (Postgres, Auth Google, RLS, Edge Functions)                                                                                                       | 9.1     |
| D-41 | Aggiornamento senza notifiche: refetch, pull to refresh, polling a 30 secondi                                                                               | 5.5     |
| D-42 | Solo italiano, stringhe in file di risorse                                                                                                                  | 8       |

## 11. Piano di sviluppo e criteri di accettazione

### 11.1 Fasi

| Fase                      | Contenuto                                                                            | Si considera finita quando                                              |
| ------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 1. Fondamenta             | Progetto Expo, Supabase con RLS, login Google, profilo, gruppi, inviti, approvazione | Un utente crea un gruppo, un secondo entra col codice e viene approvato |
| 2. Edizione ed estrazione | Edizione, iscrizioni, regole, solver, diagnosi, dashboard con countdown              | L'estrazione soddisfa i criteri di 11.2 su istanze di prova             |
| 3. Domande e missioni     | Cataloghi, domande anonime, assegnazione e completamento missioni                    | Un giro completo di domande e risposte tra più utenti                   |
| 4. Serata                 | Avvio serata, ipotesi, voti, chiusura, statistiche, rivelazione                      | Una serata simulata con 5 utenti arriva alla rivelazione                |
| 5. Ricorrenza e storico   | Nuova edizione, anti-ripetizione, storico, cancellazione account                     | Una seconda edizione rispetta l'anti-ripetizione                        |
| 6. Pubblicazione          | Test su dispositivi reali, informativa, accesso con Apple se richiesto, store        | Build approvate su App Store e Google Play                              |

### 11.2 Criteri di accettazione

**Estrazione**

- Su 1000 istanze casuali risolvibili (fino a 30 partecipanti, regole miste) ogni risultato rispetta tutte le regole, l'anti-ripetizione e l'assenza di punti fissi.
- Su istanze senza soluzione non viene salvato nulla e la diagnosi indica almeno una correzione che, applicata, rende risolvibile l'istanza quando una correzione esiste.
- L'estrazione termina in meno di 3 secondi con 30 partecipanti.
- Due richieste simultanee di estrazione producono un solo insieme di abbinamenti.

**Segretezza**

- Con il token di qualsiasi utente, amministratore incluso, le letture dirette di assignments, di missioni, domande, ipotesi e voti altrui restituiscono zero righe.
- get\_my\_recipient restituisce esattamente una riga.
- Prima della chiusura nessuna interrogazione restituisce statistiche, premi o ipotesi altrui.

**Regole di gioco**

- Non si supera il massimo di domande per persona e non si pone due volte la stessa domanda allo stesso destinatario.
- Una domanda senza risposta resta in attesa e conta nel limite.
- L'ipotesi sul proprio regalo è bloccata finché non si tocca «Ho ricevuto il regalo».
- Non si può votare il regalo fatto da sé.
- Alla chiusura statistiche, premi ed esiti delle missioni coincidono con i dati inseriti.

**Ruoli e stati**

- Ogni azione della tabella dei permessi (sezione 4) è rifiutata dal server fuori dallo stato o dal ruolo consentito.
- Il ritiro di un partecipante dopo l'estrazione rende l'edizione incompleta e blocca avvio serata e nuove domande.
- Annullare l'estrazione elimina abbinamenti, domande, risposte e missioni e riporta a «Iscrizioni».

**Account e storico**

- La cancellazione di un account anonimizza lo storico e rimuove i dati personali; un amministratore con altri membri è costretto a trasferire il ruolo.
- Il dettaglio dello storico è visibile solo per le edizioni concluse a cui si ha partecipato.

**Interfaccia**

- Il countdown si aggiorna ogni secondo e dopo la data mostra «È il giorno!».
- Tutti i testi sono in italiano e in file di risorse.

## 12. Fuori ambito e evoluzioni

Non fanno parte dell'MVP e si valutano dopo la prima edizione reale:

- Notifiche push ed email.
- Lista desideri o idee regalo per partecipante.
- Ciclo unico come opzione di estrazione.
- Più amministratori.
- Accesso con altri provider oltre a Google (Apple solo se richiesto dagli store).
- Aggiornamento in tempo reale con Supabase Realtime.
- Altre categorie di premio, domande personalizzate, risposte a più opzioni.
- Altre lingue.
- Cifratura degli abbinamenti per escludere l'accesso dello sviluppatore.

## 13. Catalogo nativo delle domande anonime

Tutte le domande ammettono risposta sì/no. Sono pensate per orientare la scelta del regalo senza essere indiscrete. Ogni domanda ha un ID stabile (da usare nel database) e una categoria per l'eventuale filtro nell'interfaccia.

| ID  | Domanda                                                                 | Categoria            |
| --- | ----------------------------------------------------------------------- | -------------------- |
| Q01 | Ti piacciono i colori vivaci?                                           | Gusti e stile        |
| Q02 | Preferisci uno stile classico a uno più moderno?                        | Gusti e stile        |
| Q03 | Indossi spesso sciarpe, cappelli o guanti?                              | Gusti e stile        |
| Q04 | Ti piacciono gli oggetti di design?                                     | Gusti e stile        |
| Q05 | Ti piacciono i regali fatti a mano?                                     | Gusti e stile        |
| Q06 | Preferisci un regalo utile a uno divertente?                            | Gusti e stile        |
| Q07 | Ti piace ricevere regali ironici?                                       | Gusti e stile        |
| Q08 | Apprezzi più la qualità della quantità?                                 | Gusti e stile        |
| Q09 | Leggi libri con regolarità?                                             | Hobby e tempo libero |
| Q10 | Giochi ai videogiochi?                                                  | Hobby e tempo libero |
| Q11 | Ti piacciono i giochi da tavolo?                                        | Hobby e tempo libero |
| Q12 | Fai sport con regolarità?                                               | Hobby e tempo libero |
| Q13 | Ti piace stare all'aria aperta?                                         | Hobby e tempo libero |
| Q14 | Cucini volentieri?                                                      | Hobby e tempo libero |
| Q15 | Ti piace viaggiare?                                                     | Hobby e tempo libero |
| Q16 | Ascolti musica ogni giorno?                                             | Hobby e tempo libero |
| Q17 | Hai un hobby creativo (disegno, musica, fai da te)?                     | Hobby e tempo libero |
| Q18 | Guardi spesso film o serie TV?                                          | Hobby e tempo libero |
| Q19 | Hai animali domestici?                                                  | Hobby e tempo libero |
| Q20 | Ti piacciono le piante?                                                 | Hobby e tempo libero |
| Q21 | Ti farebbe piacere ricevere un oggetto per la casa?                     | Casa e quotidiano    |
| Q22 | Hai già molti oggetti decorativi in casa?                               | Casa e quotidiano    |
| Q23 | Usi spesso accessori tecnologici (cuffie, accessori per lo smartphone)? | Casa e quotidiano    |
| Q24 | Lavori o studi molto al computer?                                       | Casa e quotidiano    |
| Q25 | Ti piace avere casa o scrivania molto in ordine?                        | Casa e quotidiano    |
| Q26 | Ti sposti spesso in bici, monopattino o a piedi?                        | Casa e quotidiano    |
| Q27 | Ti piacciono i dolci?                                                   | Cibo e bevande       |
| Q28 | Bevi caffè ogni giorno?                                                 | Cibo e bevande       |
| Q29 | Ti piacciono il tè o le tisane?                                         | Cibo e bevande       |
| Q30 | Apprezzi i prodotti gastronomici particolari o locali?                  | Cibo e bevande       |
| Q31 | Hai restrizioni alimentari (vegetariano, intolleranze o altro)?         | Cibo e bevande       |
| Q32 | Ti farebbe piacere ricevere una bottiglia (vino o liquore)?             | Cibo e bevande       |
| Q33 | Ti piacciono le sorprese anche un po' strane?                           | Tipo di regalo       |
| Q34 | Preferiresti un'esperienza (cena, ingresso, corso) a un oggetto?        | Tipo di regalo       |
| Q35 | Ti farebbe piacere ricevere qualcosa da usare ogni giorno?              | Tipo di regalo       |
| Q36 | Ti piacciono le cose personalizzate (nome, iniziali, dedica)?           | Tipo di regalo       |
| Q37 | Conservi volentieri ricordi (foto, souvenir)?                           | Tipo di regalo       |
| Q38 | Ti piacciono le cose a tema natalizio?                                  | Tipo di regalo       |
| Q39 | Hai già tutto ciò di cui hai bisogno?                                   | Tipo di regalo       |
| Q40 | Ti piace risolvere enigmi o rompicapo (escape room, puzzle)?            | Tipo di regalo       |

Note d'uso: le domande Q31 e Q32 sono le più sensibili; restano nel catalogo perché evitano regali sbagliati, ma l'admin può disattivarle per l'edizione. Lo stesso vale per tutte le altre.

## 14. Catalogo nativo delle missioni segrete

Le missioni sono leggere, giocabili durante una serata tra amici, non richiedono alcol, contatto fisico o situazioni imbarazzanti per altri, e si completano per autodichiarazione. Il campo **Tema** vale "generale" oppure "natalizio" (le missioni natalizie sono M05, M27, M31, M32, M34, M37): l'admin può escluderle se la serata non è natalizia.

| ID  | Missione                                                                                                       | Categoria      |
| --- | -------------------------------------------------------------------------------------------------------------- | -------------- |
| M01 | Chiedi a tre persone qual è il regalo più bello che abbiano mai ricevuto.                                      | Conversazione  |
| M02 | Racconta a qualcuno un aneddoto su un regalo che ti ha fatto sorridere.                                        | Conversazione  |
| M03 | Fai un complimento sincero ad almeno tre persone diverse.                                                      | Conversazione  |
| M04 | Scopri cosa vorrebbe ricevere in regalo qualcuno l'anno prossimo, senza fargli capire che è una missione.      | Conversazione  |
| M05 | Fatti raccontare da tre persone il loro ricordo di Natale più bello.                                           | Conversazione  |
| M06 | Inserisci la parola "tombola" in tre conversazioni diverse senza spiegare perché.                              | Conversazione  |
| M07 | Fai ridere almeno tre persone con una barzelletta o una battuta.                                               | Conversazione  |
| M08 | Scopri il film o la serie preferita di almeno tre persone.                                                     | Conversazione  |
| M09 | Convinci almeno due persone che sospetti di un'altra persona come autore del tuo regalo (anche se non è vero). | Depistaggio    |
| M10 | Lancia durante la serata un indizio falso ma innocuo su chi ti ha fatto il regalo.                             | Depistaggio    |
| M11 | Chiedi a tre persone chi pensano abbia fatto il regalo a un altro partecipante e ascolta le risposte.          | Depistaggio    |
| M12 | Mantieni un'espressione impassibile quando viene aperto il regalo del tuo destinatario.                        | Depistaggio    |
| M13 | Brinda con almeno quattro persone diverse (va bene anche con acqua o analcolico).                              | Azioni leggere |
| M14 | Proponi un brindisi alla serata, anche semplice.                                                               | Azioni leggere |
| M15 | Aiuta a servire o a sparecchiare almeno due volte senza che te lo chiedano.                                    | Azioni leggere |
| M16 | Fai almeno una foto di gruppo con tutti i partecipanti.                                                        | Azioni leggere |
| M17 | Scatta una foto a qualcuno mentre scarta il regalo, senza farti notare.                                        | Azioni leggere |
| M18 | Offri da bere o da mangiare a tre persone diverse.                                                             | Azioni leggere |
| M19 | Proponi un gioco di gruppo durante la serata.                                                                  | Azioni leggere |
| M20 | Presenta tra loro due persone che parlano poco e fai partire una conversazione.                                | Azioni leggere |
| M21 | Lascia un bigliettino gentile a una persona della serata.                                                      | Azioni leggere |
| M22 | Fai un breve discorso di ringraziamento (30 secondi) a chi ha organizzato.                                     | Azioni leggere |
| M23 | Fai una previsione ad alta voce sul regalo che riceverà un'altra persona e verifica se avevi ragione.          | Gioco          |
| M24 | Proponi una sfida rapida (carta-sasso-forbici) a tre persone diverse.                                          | Gioco          |
| M25 | Fai scommettere due persone sul contenuto di un regalo prima che venga aperto.                                 | Gioco          |
| M26 | Avvia una storia collettiva in cui ogni frase è aggiunta da una persona diversa (almeno quattro).              | Gioco          |
| M27 | Fai mimare a qualcuno un titolo di film natalizio e fallo indovinare agli altri.                               | Gioco          |
| M28 | Insegna a qualcuno un gioco di carte o un trucco semplice.                                                     | Gioco          |
| M29 | Proponi un indovinello al gruppo e osserva se qualcuno lo risolve.                                             | Gioco          |
| M30 | Formula una domanda "vero o falso" sul gruppo e raccogli le risposte.                                          | Gioco          |
| M31 | Raccogli tre propositi per l'anno nuovo da persone diverse.                                                    | Gruppo         |
| M32 | Fai cantare insieme almeno quattro persone un ritornello natalizio.                                            | Gruppo         |
| M33 | Fatti raccontare da almeno tre persone una cosa buffa successa loro quest'anno.                                | Gruppo         |
| M34 | Assegna a una persona un nome da elfo divertente e fallo usare dagli altri per un po'.                         | Gruppo         |
| M35 | Chiedi a due persone di raccontare come si sono conosciute.                                                    | Gruppo         |
| M36 | Fai un cin cin finale con tutti i presenti prima della fine della serata.                                      | Gruppo         |
| M37 | Convinci qualcuno a indossare un accessorio natalizio per almeno cinque minuti.                                | Gruppo         |
| M38 | Scopri qual è il regalo più strano mai ricevuto da almeno tre persone.                                         | Gruppo         |
| M39 | Scopri qualcosa di innocuo che nessuno sapeva di almeno due persone presenti.                                  | Gruppo         |
| M40 | Chiedi a tre persone il loro consiglio per il regalo ideale e annota quale ti convince di più.                 | Conversazione  |

**Nota per il database**: il campo `tema` vale «natalizio» per M05, M27, M31, M32, M34 e M37, e «generale» per tutte le altre.
