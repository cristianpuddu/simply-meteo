<script>
    import WeatherCard from "../components/WeatherCard.svelte";
    import Extremes from "../components/Extremes.svelte";
    import { fetchWeather } from "../lib/fetchWeather.js";
    import { onMount } from "svelte";

    export let mode;
    export let selectedDate; 
    export let onUpdate; 

    let weatherData = null;
    

    async function updateWeather() {
        const data = await fetchWeather("?select=*&order=time.desc&limit=1");

        if (data && data.length > 0) weatherData = data[0];

        if (onUpdate && weatherData) {
            onUpdate(weatherData.time);
        }
    }
   
    onMount(() => {
        updateWeather();
        const intervalWeather = setInterval(updateWeather, 30000);
        return () => clearInterval(intervalWeather);
    });
</script>

<div class="container">
    <div class="col">
        <div class="section-title">Condizioni attuali</div>
        <WeatherCard {weatherData} />
    </div>

    <div class="col">
        <div class="section-title">Estremi</div>
        <Extremes {mode} date={selectedDate} />
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: row;
        background-color: #000;
        min-height: 100vh;
        padding: 0;
        margin: 0;
        color: #fff;
        gap: 0.4rem;
    }

    .col {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #0f0f0f;
        padding: 0.4rem;
        border-radius: 10px;
        font-size: 0.85rem;
        text-align: center;
    }

    .section-title {
        font-size: 0.75rem;
        opacity: 0.65;
        margin-bottom: 0.4rem;
        letter-spacing: 0.4px;
        font-weight: 500;
    }
    
    @media (max-width: 420px) {
        .col {
            padding: 0.35rem;
            font-size: 0.78rem;
        }

        .section-title {
            font-size: 0.7rem;
        }
    }
</style>