<script>
    import { onMount } from "svelte";
    import { fetchWeather } from "../lib/fetchWeather.js";
    import {
        Thermometer,
        Droplets,
        CloudRain,
        Wind,
        Gauge,
    } from "@lucide/svelte";

   
    export let mode = 'L'; 
    export let date;       

    let tMax = null;
    let tMin = null;
    let hMax = null;
    let hMin = null;
    let windGustMax = null;
    let lightMax = null;
    let rainValue = null; 

    function getDateRange() {
        let start, end;

        if (mode === 'A' && date) { // year mode (A)
            const year = parseInt(date.substring(0, 4)); 
            
            // first day of the year
            const startDate = new Date(year, 0, 1);
            // last day of the year
            const endDate = new Date(year, 11, 31, 23, 59, 59);

            start = startDate.toISOString();
            end = endDate.toISOString();

        } else if (mode === 'M' && date) { // Month mode (M)
            const [year, month] = date.split('-').map(Number);
            
            // first day of the month
            const startDate = new Date(year, month - 1, 1);
            // last day of the month
            const endDate = new Date(year, month, 0);

            start = startDate.toISOString().split('.')[0] + 'Z';
            end = endDate.toISOString().split('T')[0] + 'T23:59:59Z';
        } else if (mode === 'D' && date) { // Mode Day (D)
            start = `${date}T00:00:00Z`;
            end = `${date}T23:59:59Z`;
        } else {
            // Live mode
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            start = `${y}-${m}-${d}T00:00:00Z`;
            end = `${y}-${m}-${d}T23:59:59Z`;
        }
        
        return { start, end };
    }

    async function loadExtremes() {
        const { start, end } = getDateRange();

        // Extreme
        tMax = await fetchWeather(`?select=temp_c,time&time=gte.${start}&time=lte.${end}&order=temp_c.desc&limit=1`);
        tMin = await fetchWeather(`?select=temp_c,time&time=gte.${start}&time=lte.${end}&order=temp_c.asc&limit=1`);
        hMax = await fetchWeather(`?select=humidity,time&time=gte.${start}&time=lte.${end}&order=humidity.desc&limit=1`);
        hMin = await fetchWeather(`?select=humidity,time&time=gte.${start}&time=lte.${end}&order=humidity.asc&limit=1`);
        
        // rainy 
        if (mode === 'A') {
            //Annual Rain Calculation: Sum of the last rain_m for each month
            const year = date.substring(0, 4);
            const now = new Date();
            const currentMonth = now.getMonth() + 1; // 1-12
            const selectedYear = parseInt(year);
            const isCurrentYear = selectedYear === now.getFullYear();
            
            let totalRain = 0;

            // Iterate only through months up to the current one (if it's the current year)

            for (let month = 1; month <= (isCurrentYear ? currentMonth : 12); month++) {
                const monthStr = String(month).padStart(2, '0');
                
                // Calculate the range for that specific month in the selected year

                const monthStart = `${year}-${monthStr}-01T00:00:00Z`;
                // LaAst Day of the Month
                const lastDayOfMonth = new Date(selectedYear, month, 0); 
                const monthEnd = lastDayOfMonth.toISOString().split('T')[0] + 'T23:59:59Z';
                
                // LAST value of rain_m in that month (cumulative up to the last reading)
                const monthRainRes = await fetchWeather(`?select=rain_m,time&time=gte.${monthStart}&time=lte.${monthEnd}&order=time.desc&limit=1`);

                if (monthRainRes?.[0]?.rain_m) {
                    totalRain += monthRainRes[0].rain_m;
                }
            }
            // Round the total to one decimal
            rainValue = parseFloat(totalRain.toFixed(1)); 

        } else if (mode === 'M') {
            // Monthly Rain Calculation: Last rain_m value in the month range
            const rainRes = await fetchWeather(`?select=rain_m,time&time=gte.${start}&time=lte.${end}&order=time.desc&limit=1`);
            rainValue = rainRes?.[0]?.rain_m ?? null;
            
        } else {
            // Mode D or L: we use rain_d (Daily Rain)
            const rainRes = await fetchWeather(`?select=rain_d,time&time=gte.${start}&time=lte.${end}&order=time.desc&limit=1`);
            rainValue = rainRes?.[0]?.rain_d ?? null;
        }

        windGustMax = await fetchWeather(`?select=wind_gust,time&time=gte.${start}&time=lte.${end}&order=wind_gust.desc&limit=1`);
        lightMax = await fetchWeather(`?select=light_klx,time&time=gte.${start}&time=lte.${end}&order=light_klx.desc&limit=1`);
    }

    onMount(() => {
        loadExtremes();
        const interval = setInterval(() => {
            if (mode === 'L') loadExtremes();
        }, 30000);
        return () => clearInterval(interval);
    });

    // Reload extremes when mode or selected date change
    $: if (mode || date) {
        loadExtremes();
    }
    
   
    
    // Helper function to get the formatted date/time based on mode
    function formatExtremesDate(time) {
        if (!time) return '';
        const d = new Date(time);
        
        const timePart = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (mode === 'M') {
            // Month: Day and Hour
            return `alle ${timePart} (${d.getDate()})`;
        } else if (mode === 'A') {
            // Anno: Year: Day, Month and Hour
            return `alle ${timePart} (${d.getDate()}/${d.getMonth() + 1})`;
        } else {
            //  D / L: Only Hour
            return `alle ${timePart}`;
        }
    }
    
    // Helper function for the rain label
    function getRainLabel() {
        if (mode === 'A') return 'Pioggia Annuale';
        if (mode === 'M') return 'Pioggia Mensile';
        return 'Pioggia Giornaliera';
    }
</script>

<div class="card">
    <div class="card-row">
        <Thermometer class="card-icon" />
        <div class="card-content">
            <p class="card-label">Temp. Massima</p>
            {#if tMax?.[0]}
                <p class="card-value">{tMax[0].temp_c} °C</p>
                <p class="card-sub">{formatExtremesDate(tMax[0].time)}</p>
            {:else}
                <p class="card-value">—</p>
            {/if}
        </div>
    </div>

    <div class="card-row">
        <Thermometer class="card-icon" />
        <div class="card-content">
            <p class="card-label">Temp. Minima</p>
            {#if tMin?.[0]}
                <p class="card-value">{tMin[0].temp_c} °C</p>
                <p class="card-sub">{formatExtremesDate(tMin[0].time)}</p>
            {:else}
                <p class="card-value">—</p>
            {/if}
        </div>
    </div>

    <div class="card-row">
        <Droplets class="card-icon" />
        <div class="card-content">
            <p class="card-label">Umidità Max</p>
            {#if hMax?.[0]}
                <p class="card-value">{hMax[0].humidity}%</p>
                <p class="card-sub">{formatExtremesDate(hMax[0].time)}</p>
            {:else}
                <p class="card-value">—</p>
            {/if}
        </div>
    </div>

    <div class="card-row">
        <Droplets class="card-icon" />
        <div class="card-content">
            <p class="card-label">Umidità Min</p>
            {#if hMin?.[0]}
                <p class="card-value">{hMin[0].humidity}%</p>
                <p class="card-sub">{formatExtremesDate(hMin[0].time)}</p>
            {:else}
                <p class="card-value">—</p>
            {/if}
        </div>
    </div>

    <div class="card-row">
        <CloudRain class="card-icon" />
        <div class="card-content">
            <p class="card-label">{getRainLabel()}</p>
            <p class="card-value">{rainValue ?? "—"} mm</p>
        </div>
    </div>

    <div class="card-row">
        <Wind class="card-icon" />
        <div class="card-content">
            <p class="card-label">Raffica Max</p>
            {#if windGustMax?.[0]}
                <p class="card-value">{windGustMax[0].wind_gust} m/s</p>
                <p class="card-sub">{formatExtremesDate(windGustMax[0].time)}</p>
            {:else}
                <p class="card-value">—</p>
            {/if}
        </div>
    </div>

    <div class="card-row">
        <Gauge class="card-icon" />
        <div class="card-content">
            <p class="card-label">Radiazione Max</p>
            {#if lightMax?.[0]}
                <p class="card-value">{lightMax[0].light_klx} klx</p>
                <p class="card-sub">{formatExtremesDate(lightMax[0].time)}</p>
            {:else}
                <p class="card-value">—</p>
            {/if}
        </div>
    </div>
</div>

<style>
    .card {
        background: #111;
        border-radius: 14px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        text-align: center;
        /* Rimosso cursor: pointer; e transition: background-color 0.2s; */
    }

    /* Rimosso .card:hover */
  
    .card-row {
        display: flex;
        align-items: center;
        justify-content: center; 
        gap: 8px;
    }
  
    .card-icon {
        width: 28px;
        height: 28px;
        color: #4fc3f7;
    }
  
    .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .card-label {
        font-size: 0.80rem;
        color: #aaa;
    }
  
    .card-value {
        font-size: 0.95rem;
        font-weight: 600;
        color: #fff;
    }
  
    .card-sub {
        font-size: 0.70rem;
        color: #aaa;
        margin-top: -4px;
    }
  
    .card-footer {
        margin-top: 8px;
        font-size: 0.70rem;
        color: #777;
        text-align: center;
    }
</style>