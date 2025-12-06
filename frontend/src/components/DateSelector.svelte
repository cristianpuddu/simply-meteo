<script>
    export let value; // select date
    export let type = 'date'; // 'date', 'month', o 'datetime-local'
    export let label = 'Seleziona data';
</script>

<div class="selector-container">
    <label for="date-input" class="selector-label">{label}</label>
    <input 
        id="date-input"
        {type} 
        bind:value 
        class="selector-input"
    />
</div>

<style>
    .selector-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #1a1a1a;
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid #333;
    }

    .selector-label {
        font-size: 0.8rem;
        color: #aaa;
        white-space: nowrap;
    }

    .selector-input {
        background: transparent;
        border: none;
        color: #fff;
        font-size: 0.9rem;
        font-family: inherit;
        outline: none;
        cursor: pointer;
    }


    .selector-input[type="date"],
    .selector-input[type="month"],
    .selector-input[type="datetime-local"] {
       
        color: #fff; 
    }

 
    .selector-input::-webkit-calendar-picker-indicator {
        filter: invert(1);
        opacity: 0.8; 
        cursor: pointer;
    }
</style>