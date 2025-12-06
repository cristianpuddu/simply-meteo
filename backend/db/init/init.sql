-- ===============================
--  Simply Meteo - INIT SCHEMA
-- ===============================

-- enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

DROP TABLE IF EXISTS weather_data;

CREATE TABLE weather_data (
  topic TEXT,
  time TIMESTAMPTZ NOT NULL,
  id INT,
  ch INT,  
  battery_ok BOOLEAN,
  temp_c DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  wind_gust DOUBLE PRECISION,
  wind_avg DOUBLE PRECISION,
  wind_dir INT,
  uv DOUBLE PRECISION,
  light_klx DOUBLE PRECISION,
  rain DOUBLE PRECISION,
  rain_h DOUBLE PRECISION,
  rain_d DOUBLE PRECISION,
  rain_w DOUBLE PRECISION,
  rain_m DOUBLE PRECISION
);

-- Create hypertable TimescaleDB
SELECT create_hypertable('weather_data', 'time', if_not_exists => TRUE);

-- Public role with minimal permissions for PostgREST
CREATE ROLE web_anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT ON weather_data TO web_anon;
