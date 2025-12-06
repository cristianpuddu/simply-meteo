<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { 
        Chart, 
        LineController, 
        BarController, 
        LineElement, 
        BarElement, 
        PointElement, 
        LinearScale, 
        TimeScale, 
        Legend, 
        Tooltip 
    } from 'chart.js';
    import 'chartjs-adapter-date-fns';
    import { it } from 'date-fns/locale'; // Per le date in italiano

    Chart.register(LineController, BarController, LineElement, BarElement, PointElement, LinearScale, TimeScale, Legend, Tooltip);

    //  // --- GENERIC PROPS ---
    export let data = [];      
    export let height = 220;
    
    // X-axis configuration: 'hour', 'day', 'month'
    export let xUnit = 'hour'; 
    export let dateRange = { min: null, max: null };

    // Dataset configuration: Array of objects describing how to draw the data
    export let datasetsConfig = []; 

    let canvasEl;
    let chart;

    // Helper to format values in tooltips
    const formatValue = (val, unit) => {
        if (val === null || val === undefined) return 'N/D';
        return `${val.toFixed(1)} ${unit || ''}`;
    };

    function buildChart() {
        if (!canvasEl || !data || !datasetsConfig.length) return;
        
        if (chart) chart.destroy();

        // 1. Build Chart.js datasets based on received config
        const chartDatasets = datasetsConfig.map(cfg => {
            return {
                label: cfg.label,
                type: cfg.type, // 'line' o 'bar'
                yAxisID: cfg.yAxisID || 'y',
                order: cfg.order || 0,
                
                // GENERIC DATA MAPPING
                data: data.map(d => {
                    // If it's a Floating Bar (Min/Max), we expect an array [min, max]
                    if (cfg.isFloatingBar) {
                        return { x: d.time, y: [d[cfg.minKey], d[cfg.maxKey]] };
                    }
                    // Otherwise single value
                    return { x: d.time, y: d[cfg.key] };
                }),

                // Stile
                borderColor: cfg.borderColor,
                backgroundColor: cfg.backgroundColor,
                borderWidth: cfg.borderWidth || 2,
                tension: 0.3,
                pointRadius: 0,
                spanGaps: false, // Useful for L/D data with gaps
                
                // Bar-specific options
                borderRadius: cfg.type === 'bar' ? 4 : 0,
                categoryPercentage: cfg.categoryPercentage,
                barPercentage: cfg.barPercentage,
                grouped: true,

                // Save unit in dataset to use in tooltip
                unit: cfg.unit 
            };
        });

        // 2. X-axis configuration
        const xScales = {
            type: 'time',
            time: {
                unit: xUnit,
                tooltipFormat: xUnit === 'hour' ? 'HH:mm' : (xUnit === 'month' ? 'MMM yyyy' : 'dd/MM'),
                displayFormats: {
                    hour: 'HH:mm',
                    day: 'dd/MM',
                    month: 'MMM yyyy'
                }
            },
            min: dateRange.min,
            max: dateRange.max,
            adapters: { date: { locale: it } },
            ticks: { color: '#aaa', autoSkip: true, maxRotation: 0 },
            grid: { color: '#333333', lineWidth: 0.5 }
        };

         // 3. Y-axis configuration (Dynamic based on axes required by config)
        // Create a base scales object with X
        let scales = { x: xScales };
        
        // Add Y axes defined in config (e.g., yLeft, yRight)
        // For simplicity, modal passes full axis config if needed,
        // but here we keep standard Left/Right structure if IDs detected.
        
          // Left Axis (Standard)
        scales['yLeft'] = {
            type: 'linear',
            position: 'left',
            grid: { color: '#333333', lineWidth: 0.5 },
            ticks: { color: '#aaa' } // Colore default, verra sovrascritto se serve
        };

         // Right Axis (Optional, only if used by any dataset)
        const hasRightAxis = datasetsConfig.some(d => d.yAxisID === 'yRight');
        if (hasRightAxis) {
            scales['yRight'] = {
                type: 'linear',
                position: 'right',
                grid: { drawOnChartArea: false }, // Niente griglia per il secondo asse
                ticks: { color: '#aaa' },
                beginAtZero: true
            };
        }

           // 4. Build Chart
        chart = new Chart(canvasEl, {
            data: { datasets: chartDatasets },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                
                // Layout padding to avoid label clipping
                layout: {
                    padding: {
                        left: 10,
                        right: 25, 
                        top: 10,
                        bottom: 10
                    }
                },

                interaction: { mode: 'index', intersect: false },
                scales: scales,
                plugins: {
                    legend: {
                        labels: { color: '#eee', boxWidth: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                const unit = context.dataset.unit || '';

                                // Floating Bar handling [min, max]
                                if (Array.isArray(context.raw.y)) {
                                    const [min, max] = context.raw.y;
                                    return `${label} Min: ${formatValue(min, unit)} / Max: ${formatValue(max, unit)}`;
                                }
                                
                                // Single value
                                return `${label} ${formatValue(context.parsed.y, unit)}`;
                            }
                        }
                    }
                }
            }
        });

               // Apply axis colors (Optional: takes first dataset color associated with axis)
        datasetsConfig.forEach(d => {
            if (d.yAxisID && chart.options.scales[d.yAxisID]) {
                chart.options.scales[d.yAxisID].ticks.color = d.borderColor;
                
            }
        });
        chart.update();
    }

    onMount(() => { buildChart(); });
    onDestroy(() => { if (chart) chart.destroy(); });

    // Reattività
    $: if (data && datasetsConfig) { buildChart(); }
</script>

<div class="chart-container" style="height: {height}px;">
    <canvas bind:this={canvasEl}></canvas>
</div>

<style>
    .chart-container {
        position: relative;
        width: 100%;
        margin: 0 auto;
    }
</style>