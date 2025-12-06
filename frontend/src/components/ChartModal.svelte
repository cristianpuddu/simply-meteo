<script>
    import { onMount } from 'svelte';
    import { fetchWeather } from '../lib/fetchWeather.js'; 
    import { getPerceivedTemp } from '../lib/utils.js'; 
    import Chart from './Chart.svelte'; 
    import { X } from '@lucide/svelte'; 

    export let mode;      
    export let date;      
    export let onClose;   

    // STATE
    let historicalData = [];
    let isLoading = true;
    let chartHeight = 0;
    let currentRange = { min: null, max: null }; 
    let currentView = 'meteo'; 
    let chartConfig = []; 
    let xUnit = 'hour';

    const SAMPLE_INTERVAL_MINUTES = 10; 
    const TEMP_THRESHOLD = -50; 
    const MAX_GAP_MS = 3 * SAMPLE_INTERVAL_MINUTES * 60 * 1000; 

    function updateChartHeight() {
        chartHeight = window.innerHeight * 0.70; 
    }
    
    const cleanValue = (value, field) => {
        if (value === null || typeof value === 'undefined') return null;
        if (field === 'temp_c' && value <= TEMP_THRESHOLD) return null;
        return value;
    }

    // --- CONFIG CHART ---
    function getChartConfig(currentMode, view) {
        const cTemp = '#ff6384'; const bgTemp = 'rgba(255, 99, 132, 0.5)';
        const cRain = '#4fc3f7'; const bgRain = 'rgba(79, 195, 247, 0.5)';
        const cWind = '#ffcd56'; const bgWind = 'rgba(255, 205, 86, 0.5)';
        const cGust = '#F5111C'; const bgGust = 'rgba(245, 17, 28, 0.5)';
        const cUV   = '#9966ff'; const bgUV   = 'rgba(153, 102, 255, 0.5)';
        const cLight= '#ffcd56';
        const cHum  = '#36a2eb'; const bgHum  = 'rgba(54, 162, 235, 0.5)';
        const cPerc = '#ff6384'; 

        const isMA = (currentMode === 'M' || currentMode === 'A');

        if (view === 'meteo') {
            if (!isMA) { 
                return [
                    { label: 'Temperatura', key: 'temp_c', type: 'line', borderColor: cTemp, backgroundColor: 'rgba(255,99,132,0.2)', yAxisID: 'yLeft', unit: '°C' },
                    { label: 'Rain Rate', key: 'rain_d_rate', type: 'line', borderColor: cRain, backgroundColor: 'rgba(79,195,247,0.2)', yAxisID: 'yRight', unit: 'mm/h' }
                ];
            } else { 
                return [
                    { label: 'Temp Min/Max', isFloatingBar: true, minKey: 'temp_min', maxKey: 'temp_max', type: 'bar', borderColor: cTemp, backgroundColor: bgTemp, yAxisID: 'yLeft', unit: '°C' },
                    { label: 'Pioggia Totale', key: 'rain_accumulated', type: 'bar', borderColor: cRain, backgroundColor: bgRain, yAxisID: 'yRight', unit: 'mm' }
                ];
            }
        }
        if (view === 'vento') {
            if (!isMA) {
                return [
                    { label: 'Vento Medio', key: 'wind_avg', type: 'line', borderColor: cWind, backgroundColor: bgWind, yAxisID: 'yLeft', unit: 'm/s' },
                    { label: 'Raffica', key: 'wind_gust', type: 'line', borderColor: cGust, backgroundColor: 'rgba(255,159,64,0.1)', yAxisID: 'yLeft', unit: 'm/s' }
                ];
            } else {
                return [
                    { label: 'Vento Medio Max', key: 'wind_avg_max', type: 'bar', borderColor: cWind, backgroundColor: bgWind, yAxisID: 'yLeft', unit: 'm/s' },
                    { label: 'Raffica Max', key: 'wind_gust_max', type: 'bar', borderColor: cGust, backgroundColor: bgGust, yAxisID: 'yLeft', unit: 'm/s' }
                ];
            }
        }
        if (view === 'ambiente') {
            if (!isMA) {
                return [
                    { label: 'Indice UV', key: 'uv', type: 'line', borderColor: cUV, backgroundColor: bgUV, yAxisID: 'yLeft', unit: '' },
                    { label: 'Luce', key: 'light_klx', type: 'line', borderColor: cLight, backgroundColor: 'rgba(255,205,86,0.1)', yAxisID: 'yRight', unit: 'klx' }
                ];
            } else {
                return [
                    { label: 'UV Max', key: 'uv_max', type: 'bar', borderColor: cUV, backgroundColor: bgUV, yAxisID: 'yLeft', unit: '' },
                    { label: 'Luce Max', key: 'light_max', type: 'bar', borderColor: cLight, backgroundColor: 'rgba(255,205,86,0.5)', yAxisID: 'yRight', unit: 'klx' }
                ];
            }
        }
        if (view === 'avanzato') {
            if (!isMA) {
                 return [
                    { label: 'Temp. Percepita', key: 'feels_like', type: 'line', borderColor: cPerc, backgroundColor: 'rgba(255,99,132,0.1)', yAxisID: 'yLeft', unit: '°C' },
                    { label: 'Umidità', key: 'humidity', type: 'line', borderColor: cHum, backgroundColor: bgHum, yAxisID: 'yRight', unit: '%' }
                ];
            } else {
                return [
                    { label: 'Percepita Min/Max', isFloatingBar: true, minKey: 'feels_like_min', maxKey: 'feels_like_max', type: 'bar', borderColor: cPerc, backgroundColor: bgTemp, yAxisID: 'yLeft', unit: '°C' },
                    { label: 'Umidità Min/Max', isFloatingBar: true, minKey: 'hum_min', maxKey: 'hum_max', type: 'bar', borderColor: cHum, backgroundColor: bgHum, yAxisID: 'yRight', unit: '%' }
                ];
            }
        }
        return [];
    }

    // --- FETCH FIELDS HELPER ---
    function getFieldsToFetch(view) {
        let base = 'time';
        switch(view) {
            case 'meteo': return `${base},temp_c,rain_d,rain_m`;
            case 'vento': return `${base},wind_avg,wind_gust`;
            case 'ambiente': return `${base},uv,light_klx`;
            case 'avanzato': return `${base},temp_c,humidity,wind_avg`; 
            default: return `${base},temp_c,rain_d,rain_m`;
        }
    }

    // --- DATE HANDLING---
    function getDateRange() {
        let refDate = new Date();
        if (mode !== 'L') {
            if (date instanceof Date) refDate = date;
            else if (typeof date === 'string') {
                let safeDateStr = date;
                if (date.length === 4) safeDateStr = `${date}-01-01`; 
                else if (date.length === 7) safeDateStr = `${date}-01`; 
                refDate = new Date(safeDateStr);
            }
        }
        const y = refDate.getFullYear();
        const m = refDate.getMonth();
        const d = refDate.getDate();
        let start, end;
        if (mode === 'L') {
            const now = new Date();
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        } else if (mode === 'D') {
            start = new Date(Date.UTC(y, m, d, 0, 0, 0));
            end = new Date(Date.UTC(y, m, d, 23, 59, 59));
        } else if (mode === 'M') {
            start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
            end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59));
        } else if (mode === 'A') {
            start = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
            end = new Date(Date.UTC(y, 11, 31, 23, 59, 59));
        } else { start = new Date(); end = new Date(); }
        
        const startTime = start.toISOString();
        const endTime = end.toISOString();
        currentRange = { min: startTime, max: endTime };
        return { startTime, endTime };
    }

   // --- DATA FILL HELPERS ---
    function fillMissingMonths(data, year) {
        const fullYearData = [];
        const dataMap = new Map(data.map(d => [new Date(d.time).getUTCMonth(), d]));
        for (let m = 0; m < 12; m++) {
            if (dataMap.has(m)) fullYearData.push(dataMap.get(m));
            else fullYearData.push({
                time: new Date(Date.UTC(year, m, 1)).toISOString(),
                temp_min: null, temp_max: null, rain_accumulated: 0,
                wind_avg_max: null, wind_gust_max: null,
                uv_max: null, light_max: null,
                feels_like_min: null, feels_like_max: null, hum_min: null, hum_max: null
            });
        }
        return fullYearData;
    }

    function padStartAndEndDays(data, mode) {
        if (mode !== 'M' || data.length === 0) return data;
        const { min, max } = currentRange;
        const startDate = new Date(min);
        const endDate = new Date(max);
        let paddedData = [...data];
        
        const emptyPoint = (isoTime) => ({
            time: isoTime,
            temp_min: null, temp_max: null, rain_accumulated: null,
            wind_avg_max: null, wind_gust_max: null,
            uv_max: null, light_max: null,
            feels_like_min: null, feels_like_max: null, hum_min: null, hum_max: null
        });

        const firstDataTime = new Date(data[0].time);
        if (firstDataTime.getUTCDate() !== startDate.getUTCDate() || firstDataTime.getUTCMonth() !== startDate.getUTCMonth()) {
            paddedData.unshift(emptyPoint(startDate.toISOString()));
        }
        const lastDataTime = new Date(data[data.length - 1].time);
        if (lastDataTime.getUTCDate() !== endDate.getUTCDate() || lastDataTime.getUTCMonth() !== endDate.getUTCMonth()) {
             const paddingEndPoint = emptyPoint(new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 0, 0, 0)).toISOString());
             if (paddedData[paddedData.length-1].time !== paddingEndPoint.time) paddedData.push(paddingEndPoint);
        }
        return paddedData;
    }

    // --- AGGREGATION (M/A) ---
    function aggregateData(rawData, aggregationMode) {
        if (!rawData || rawData.length === 0) return [];
        let aggregatedMap = new Map();
        
        const getKey = (point) => {
            const date = new Date(point.time);
            if (aggregationMode === 'L' || aggregationMode === 'D') return point.time; 
            if (aggregationMode === 'M') return date.toISOString().split('T')[0]; 
            if (aggregationMode === 'A') return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0');
            return point.time;
        };
        
        rawData.forEach(point => {
            const key = getKey(point);
            let entry = aggregatedMap.get(key);
            
            if (!entry) {
                entry = {
                    time: key,
                    temp_min: Infinity, temp_max: -Infinity,
                    rain_accumulated: 0, rain_m_latest: point.rain_m || 0, rain_d_latest: point.rain_d || 0,
                    wind_avg_max: -Infinity, wind_gust_max: -Infinity,
                    uv_max: -Infinity, light_max: -Infinity,
                    hum_min: Infinity, hum_max: -Infinity,
                    feels_like_min: Infinity, feels_like_max: -Infinity,
                    ...point
                };
            }

            if (aggregationMode === 'M' || aggregationMode === 'A') {
                const temp = cleanValue(point.temp_c, 'temp_c');
                if (temp !== null) {
                    entry.temp_min = Math.min(entry.temp_min, temp);
                    entry.temp_max = Math.max(entry.temp_max, temp);
                }
                if (point.rain_m !== null) entry.rain_m_latest = point.rain_m;
                if (point.rain_d !== null) entry.rain_d_latest = point.rain_d;

                if (point.wind_avg !== undefined) entry.wind_avg_max = Math.max(entry.wind_avg_max, point.wind_avg);
                if (point.wind_gust !== undefined) entry.wind_gust_max = Math.max(entry.wind_gust_max, point.wind_gust);

                if (point.uv !== undefined) entry.uv_max = Math.max(entry.uv_max, point.uv);
                if (point.light_klx !== undefined) entry.light_max = Math.max(entry.light_max, point.light_klx);

                if (point.humidity !== undefined && point.humidity !== null) {
                    entry.hum_min = Math.min(entry.hum_min, point.humidity);
                    entry.hum_max = Math.max(entry.hum_max, point.humidity);
                }
                
                
                const hi = getPerceivedTemp(temp, point.humidity, point.wind_avg);
                
                if (hi !== null) {
                    entry.feels_like_min = Math.min(entry.feels_like_min, hi);
                    entry.feels_like_max = Math.max(entry.feels_like_max, hi);
                }
            }
            aggregatedMap.set(key, entry);
        });

        if (aggregationMode === 'A' || aggregationMode === 'M') {
            let finalData = Array.from(aggregatedMap.values()).map(entry => {
                const cleanMax = (val) => val === -Infinity ? null : val;
                const cleanMin = (val) => val === Infinity ? null : val;
                let rain_acc = (aggregationMode === 'M') ? entry.rain_d_latest : entry.rain_m_latest;
                let dateKey = entry.time.split('-');
                let finalTime;
                if (aggregationMode === 'A') finalTime = new Date(Date.UTC(parseInt(dateKey[0]), parseInt(dateKey[1]) - 1, 1)).toISOString();
                else if (aggregationMode === 'M') finalTime = new Date(Date.UTC(parseInt(dateKey[0]), parseInt(dateKey[1]) - 1, parseInt(dateKey[2]))).toISOString();
                
                return {
                    time: finalTime,
                    temp_min: cleanMin(entry.temp_min), temp_max: cleanMax(entry.temp_max),
                    rain_accumulated: rain_acc,
                    wind_avg_max: cleanMax(entry.wind_avg_max), wind_gust_max: cleanMax(entry.wind_gust_max),
                    uv_max: cleanMax(entry.uv_max), light_max: cleanMax(entry.light_max),
                    hum_min: cleanMin(entry.hum_min), hum_max: cleanMax(entry.hum_max),
                    feels_like_min: cleanMin(entry.feels_like_min), feels_like_max: cleanMax(entry.feels_like_max)
                };
            }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            if (aggregationMode === 'M') finalData = padStartAndEndDays(finalData, 'M');
            if (aggregationMode === 'A') {
                const { startTime } = getDateRange();
                return fillMissingMonths(finalData, new Date(startTime).getUTCFullYear());
            }
            return finalData;
        } else {
            return processLiveData(Array.from(aggregatedMap.values()));
        }
    }

    // --- LIVE DATA (L/D) ---
    function processLiveData(rawData) {
        const filtered = [];
        let lastTime = 0;
        let lastRainD = null; 
        
        rawData.forEach(point => {
            const pointTime = new Date(point.time).getTime();
            if (lastTime > 0 && (pointTime - lastTime) > MAX_GAP_MS) {
                filtered.push({ 
                    time: new Date(lastTime + SAMPLE_INTERVAL_MINUTES * 60 * 1000).toISOString(), 
                    temp_c: null, rain_d_rate: null, wind_avg: null, wind_gust: null, uv: null, light_klx: null, feels_like: null, humidity: null 
                });
                lastRainD = null; 
            }

            if (pointTime - lastTime >= SAMPLE_INTERVAL_MINUTES * 60 * 1000 || lastTime === 0) {
                const currentRainD = cleanValue(point.rain_d, 'rain_d');
                let rainRate = null;
                const timeIntervalMinutes = (pointTime - lastTime) / 1000 / 60; 
                if (currentRainD !== null && lastRainD !== null && timeIntervalMinutes > 0) {
                    const rainIncrement = Math.max(0, currentRainD - lastRainD); 
                    if (rainIncrement > 0) rainRate = (rainIncrement / timeIntervalMinutes) * 60;
                    else rainRate = 0;
                } else if (currentRainD !== null && lastTime === 0) rainRate = null; 
                if (currentRainD !== null) lastRainD = currentRainD;

                //  Heat Index / Wind Chill Live
                const feelsLike = getPerceivedTemp(cleanValue(point.temp_c, 'temp_c'), point.humidity, point.wind_avg);

                filtered.push({
                    time: point.time,
                    temp_c: cleanValue(point.temp_c, 'temp_c'),
                    rain_d_rate: rainRate,
                    wind_avg: point.wind_avg,
                    wind_gust: point.wind_gust,
                    uv: point.uv,
                    light_klx: point.light_klx,
                    humidity: point.humidity,
                    feels_like: feelsLike
                });
                lastTime = pointTime;
            }
        });
        return filtered;
    }

    async function loadChartData() {
        isLoading = true;
        const { startTime, endTime } = getDateRange(); 
        const selectFields = getFieldsToFetch(currentView);
        const rawData = await fetchWeather(
            `?select=${selectFields}&time=gte.${startTime}&time=lte.${endTime}&order=time.asc`
        );
        historicalData = aggregateData(rawData, mode); 
        chartConfig = getChartConfig(mode, currentView);
        if (mode === 'L' || mode === 'D') xUnit = 'hour';
        else if (mode === 'M') xUnit = 'day';
        else if (mode === 'A') xUnit = 'month';
        isLoading = false;
    }

    const handleViewChange = (newView) => {
        if (currentView === newView) return;
        currentView = newView;
        loadChartData(); 
    }

    onMount(() => {
        loadChartData();
        updateChartHeight(); 
        window.addEventListener('resize', updateChartHeight); 
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
             window.removeEventListener('resize', updateChartHeight); 
             window.removeEventListener('keydown', handleKeyDown);
        };
    });

    $: if (mode || date) {
        historicalData = [];
        loadChartData();
    }
    
    $: titleStr = date instanceof Date ? date.toLocaleDateString() : new Date(date).toLocaleDateString();
    $: modalTitle = (mode === 'L') ? 'Grafico Live (Oggi)' : `Grafico (${mode}) - ${titleStr}`;
</script>

<style>
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0, 0, 0, 0.95); z-index: 1000; display: flex; flex-direction: column; align-items: center; padding: 1rem; }
    .modal-header { width: 100%; max-width: 1200px; display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px solid #333; margin-bottom: 0.5rem; }
    .modal-title { font-size: 1.2rem; font-weight: 600; color: #fff; }
    .view-selector { display: flex; gap: 10px; margin-bottom: 1rem; flex-wrap: wrap; justify-content: center; }
    .view-btn { background: #333; border: 1px solid #444; color: #aaa; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .view-btn:hover { background: #444; color: #fff; }
    .view-btn.active { background: #4fc3f7; color: #000; border-color: #4fc3f7; font-weight: 600; }
    .close-btn { cursor: pointer; padding: 5px 10px; border: 1px solid transparent; border-radius: 5px; display: flex; align-items: center; gap: 8px; background: none; color: #ccc; }
    .close-btn:hover { background-color: #333; color: #fff; }
    .close-icon { width: 28px; height: 28px; }
    .close-text { font-size: 0.9rem; font-weight: 500; display: none; }
    @media (min-width: 600px) { .close-text { display: inline; } }
    .chart-content { flex-grow: 1; width: 100%; max-width: 1200px; display: flex; flex-direction: column; justify-content: center; }
    .loading { font-size: 1.5rem; color: #4fc3f7; text-align: center; margin-top: 10vh; }
</style>

<div class="modal-overlay">
    <div class="modal-header">
        <span class="modal-title">{modalTitle}</span>
        <button class="close-btn" on:click={onClose}>
            <span class="close-text">Chiudi</span>
            <X class="close-icon" />
        </button>
    </div>

    <div class="view-selector">
        <button class="view-btn {currentView === 'meteo' ? 'active' : ''}" on:click={() => handleViewChange('meteo')}>Meteo</button>
        <button class="view-btn {currentView === 'vento' ? 'active' : ''}" on:click={() => handleViewChange('vento')}>Vento</button>
        <button class="view-btn {currentView === 'ambiente' ? 'active' : ''}" on:click={() => handleViewChange('ambiente')}>Ambiente</button>
        <button class="view-btn {currentView === 'avanzato' ? 'active' : ''}" on:click={() => handleViewChange('avanzato')}>Avanzato</button>
    </div>

    <div class="chart-content">
        {#if isLoading}
            <p class="loading">Caricamento dati in corso...</p>
        {:else if historicalData.length === 0}
            <p class="loading">Nessun dato disponibile per il periodo selezionato.</p>
        {:else}
            <Chart 
                data={historicalData} 
                datasetsConfig={chartConfig} 
                height={chartHeight} 
                xUnit={xUnit} 
                dateRange={currentRange} 
            />
        {/if}
    </div>
</div>