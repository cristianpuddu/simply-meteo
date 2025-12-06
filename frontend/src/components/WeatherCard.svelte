<script>
	import {
		Wind,
		Thermometer,
		Droplets,
		Sun,
		Gauge,
		CloudRain,
		Flame,
	} from "@lucide/svelte";

	import { windDirText, dewPoint, getPerceivedTemp } from "../lib/utils.js";

	export let weatherData = null;

	// Default value if weatherData is null

	$: temp = Number(weatherData?.temp_c ?? 0);

	$: hum = Number(weatherData?.humidity ?? 0);

	$: windAvg = Number(weatherData?.wind_avg ?? 0); // m/s

	$: windGust = Number(weatherData?.wind_gust ?? 0);

	$: windDir = Number(weatherData?.wind_dir ?? 0);

	$: rainH = Number(weatherData?.rain_h ?? 0);

	$: light = Number(weatherData?.light_klx ?? 0);

	$: uv = Number(weatherData?.uv ?? 0);

	$: time = weatherData?.time ?? new Date().toISOString();

	$: dirText = windDirText(windDir);

	$: dp = dewPoint(temp, hum).toFixed(1);

	$: feels = getPerceivedTemp(temp, hum, windAvg);
</script>

<div class="card">
	<div class="card-row">
		<Thermometer class="card-icon" />

		<div class="card-content">
			<p class="card-label">Temperatura</p>

			<p class="card-value">{temp} °C</p>
		</div>
	</div>

	<div class="card-row">
		<Flame class="card-icon" />

		<div class="card-content">
			<p class="card-label">Percepita</p>

			<p class="card-value">{feels} °C</p>
		</div>
	</div>

	<div class="card-row">
		<Droplets class="card-icon" />

		<div class="card-content">
			<p class="card-label">Umidità</p>

			<p class="card-value">{hum}%</p>
		</div>
	</div>

	<div class="card-row">
		<Sun class="card-icon" />

		<div class="card-content">
			<p class="card-label">Dew Point</p>

			<p class="card-value">{dp} °C</p>
		</div>
	</div>

	<div class="card-row">
		<Wind class="card-icon" />

		<div class="card-content">
			<p class="card-label">Vento</p>

			<p class="card-value">{windAvg} m/s<br />(dir: {dirText})</p>

			<p class="card-sub">Raffica: {windGust} m/s</p>
		</div>
	</div>

	<div class="card-row">
		<CloudRain class="card-icon" />

		<div class="card-content">
			<p class="card-label">Pioggia Oraria</p>

			<p class="card-value">{rainH} mm</p>
		</div>
	</div>

	<div class="card-row">
		<Gauge class="card-icon" />

		<div class="card-content">
			<p class="card-label">Radiazione</p>

			<p class="card-value">{light} klx</p>

			<p class="card-sub">UV: {uv}</p>
		</div>
	</div>

	<div class="card-footer">
		<p>Aggiornato: {new Date(time).toLocaleString()}</p>
	</div>
</div>
