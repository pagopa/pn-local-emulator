# Home

Benvenuto, se ti trovi in questa pagina probabilmente hai bisogno di verificare che la tua integrazione con Piattaforma Notifiche soddisfi i criteri minimi per poter operare in ambiente di staging.

Il tool [PnValidator](https://github.com/pagopa/pn-local-emulator) mette a disposizione un'emulazione (minimale) del sistema Piattaforma Notifiche e un endpoint che produce un report riguardo l'integrazione. Iniziare è molto semplice:

1. Fai partire il tool `PnValidator` seguendo una delle modalità descritte nella sezione [Come eseguire PnValidator](come-eseguire-pnvalidator.md).
2. Configura la tua integrazione nel seguente modo:
   1. Usa come token di autenticazione (parametro in header `x-api-key`) il valore `key-value`,
   2. Imposta come URL l'indirizzo dove poter raggiungere `PnValidator` (il valore dipende da dove e come lo hai inizializzato, e.g.: `http://localhost:3000`).
3. Esegui la tua integrazione.
4. Invoca l'endpoint `/checklistresult` di `PnValidator` per avere un report in formato JSON riguardo l'integrazione.

```bash
# the port and the hostname depend on how you started the PnValidator system
curl --location --request GET 'http://localhost:3000/checklistresult'
```
