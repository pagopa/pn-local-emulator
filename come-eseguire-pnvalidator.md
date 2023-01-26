# Come eseguire PnValidator

## Esecuzione come container Docker <a href="#esecuzione-come-container-docker" id="esecuzione-come-container-docker"></a>

Per eseguire il validator tramite [Docker](https://www.docker.com/):

* Scarica l'immagine più recente con il seguente comando:

```bash
docker pull ghcr.io/pagopa/pn-local-emulator:latest
```

* Fai partire il container

```bash
docker run -p 3000:3000 ghcr.io/pagopa/pn-local-emulator:latest
```

{% hint style="info" %}
Puoi cambiare la porta cambiando il valore del parametro `-p`.
{% endhint %}

Per verificare il corretto funzionamento prova ad invocare l'endpoint che restituisce il report:

```bash
# the port and the hostname depend on how you started the PnValidator system
curl --location --request GET 'http://localhost:3000/checklistresult'
```
