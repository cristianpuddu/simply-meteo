# 🌦️ Simply Meteo

Sistema meteo didattico per mettere online i dati di una stazione meteo Bresser 7-1 che non dispone di collegamento in rete.

1. Ricezione via radio mediante ESP32 + modulo CC1101
   Vedi [BresserWeatherSensorReceiver](https://github.com/matthias-bs/BresserWeatherSensorReceiver) per le informazioni sulla ricezione. Ho usato BresserWeatherSensorMQTT.ino
2. Backend in container Docker (Telegraf, TimescaleDB, PostgREST)
3. Esempio di Frontend con Vite+Svelte
4. In produzione io ho usato Caddy per gestire il frontend.

## Architettura

* ESP32 → HiveMQ Cloud → Telegraf → TimescaleDB → PostgREST → Frontend

## Obiettivi didattici

* Studio ESP32 e moduli radio
* MQTT, Docker, SQL, TimescaleDB, PostgREST
* Deploy su VPS

## Avvio locale backend

Crea file `.env` (vedi `.env.example`)

```bash
cd backend
docker compose up -d
```

## Avvio remoto backend

Crea file `Caddyfile` (vedi `CaddyfileSample`)

```bash
cd backend
docker compose -f docker-compose.prod.yml up -d --build
```

## Avvio locale frontend

Crea file `.env.development` (vedi `.env.sample`)

```bash
cd frontend
npm install
npm run dev
```

## Avvio remoto frontend

Crea file `.env.production` (vedi `.env.sample`)

```bash
cd frontend
npm run build
```

## To-Do List

* Pulizia del database a fine anno
* Internazionalizzazione del progetto
* Grafico avanzato della direzione del vento
* Viste e tabelle nel database con gli estremi mensili e annuali
* Risolvere alcuni bug noti

## Note

Questo è il mio primo progetto creato con Svelte e con l'uso di container nel backend.


---

# 🌦️ Simply Meteo (English)

Educational weather system to publish online the data from a Bresser 7-1 weather station that does not have a network connection.

1. Radio reception via ESP32 + CC1101 module
   See [BresserWeatherSensorReceiver](https://github.com/matthias-bs/BresserWeatherSensorReceiver) for information on reception. You can use BresserWeatherSensorMQTT.ino
2. Backend in Docker container (Telegraf, TimescaleDB, PostgREST)
3. Example Frontend with Vite + Svelte
4. In production, I used Caddy to serve the frontend

## Architecture

* ESP32 → HiveMQ Cloud → Telegraf → TimescaleDB → PostgREST → Frontend

## Educational Goals

* Study ESP32 and radio modules
* MQTT, Docker, SQL, TimescaleDB, PostgREST
* VPS deployment

## Local backend startup

Create a `.env` file (see `.env.example`)

```bash
cd backend
docker compose up -d
```

## Remote backend startup

Create `Caddyfile` (see `CaddyfileSample`)

```bash
cd backend
docker compose -f docker-compose.prod.yml up -d --build
```

## Local frontend startup

Create `.env.development` file (see `.env.sample`)

```bash
cd frontend
npm install
npm run dev
```

## Remote frontend startup

Create `.env.production` file (see `.env.sample`)

```bash
cd frontend
npm run build
```

## To-Do List

* Database cleanup at the end of the year
* Project internationalization
* Advanced wind direction chart
* Views and tables in the database with monthly and annual extremes
* Fix some known bugs

## Notes

This is my first project created with Svelte and using containers in the backend.
