# Casi d'uso disponibili

Attualmente `PnValidator` ti permette di emulare e verificare i seguenti casi d'uso:

### TC-SEND-01 <a href="#tc-send-01" id="tc-send-01"></a>

Creazione di una notifica che richiede un pagamento per un singolo destinatario, i passi necessari per il corretto completamento sono:

1. Richiedere due slot di upload
2. Effettuare l'upload di due documenti, uno dei quali il pagamento, usando le informazioni ritornate dal passo precedente
3. Creare una notifica contenente le seguenti informazioni:
   1. `physicalCommunicationType` impostato con il valore `REGISTERED_LETTER_890`
   2. il campo `recipients` deve contenere i seguenti campi:
      * `taxId`
      * `digitalDomicile`
      * `physicalAddress`
      * `payment`&#x20;
        * Deve referenziare uno dei documenti caricati in precedenza
   3. il campo `documents` deve contenere uno dei documenti caricati in precedenza

### TC-SEND-01bis <a href="#tc-send-01bis" id="tc-send-01bis"></a>

Creazione di una notifica senza pagamento, i passi necessari per il corretto completamento sono:

1. Richiedere uno slot di upload
2. Effettuare l'upload del documento usando le informazioni ritornate dal passo precedente.
3. Creare una notifica contenente le seguenti informazioni:
   1. `physicalCommunicationType` impostato con il valore `REGISTERED_LETTER_890`
   2. il campo `recipients` deve contenere i seguenti campi:
      * `taxId`
      * `digitalDomicile`
      * `physicalAddress`
   3. il campo `documents` deve contenere il documento caricato in precedenza

### TC-SEND-02 <a href="#tc-send-02" id="tc-send-02"></a>

Creazione di uno stream di eventi e consumo dei suoi elementi.

1. Completare con successo almeno uno dei seguenti casi d'uso: [`TC-SEND-01`](casi-duso-disponibili.md#tc-send-01), [`TC-SEND-01bis`](casi-duso-disponibili.md#tc-send-01bis)
2. Creare uno stream di eventi impostando il campo `eventType` a `TIMELINE`
3. Consumare lo stream molteplici volte, onorando il campo `retry-after`, finché le varie notifiche non termineranno con uno stato finale

### TC-SEND-03 <a href="#tc-send-02" id="tc-send-02"></a>

Scaricamento documenti allegati a notifica.

1. Compiere con successo il caso d'uso [`TC-SEND-02`](casi-duso-disponibili.md#tc-send-02)
2. Aver ricevuto gli eventi associati ad una notifica e recuperare le informazioni necessarie per ottenere i metadati dei documenti associati alla notifica
3. Recuperare i metadati dei documenti associati alla notifica (sia l'atto che il documento per il pagamento, se presente)
4. Effettuare il download dei documenti associati alla notifica, ovvero:
   1. l'atto notificato
   2. il documento di pagamento

### TC-PAYMENT-01

Richiesta costo della notifica per una notifica dove l’ente creditore per il pagamento coincide con la PA mittente.&#x20;

1. Compiere con successo i caso d'uso [TC-SEND-01](casi-duso-disponibili.md#tc-send-01) e [TC-SEND-02](casi-duso-disponibili.md#tc-send-02), impostando lo stesso codice fiscale per dell'ente creditore per il pagamento (`recipients.payment.creditorTaxId`) e la PA mittente (`senderTaxId`).
2. Recuperare il prezzo della notifica fornendo codice fiscale e `noticeCode` corretti.
