<script>
    import Home from './routes/Home.svelte';
    import DateSelector from './components/DateSelector.svelte'; 
    import ChartModal from './components/ChartModal.svelte'; 
    import AboutModal from './components/AboutModal.svelte';
   

    let mode = 'L';
    let lastUpdate = null;
    let menuOpen = false;
    let showAbout = false;

    
    // Initialize date for the current year
    let selectedDate = new Date().toISOString().split('T')[0];

    let chartOpen = false; 

    function toggleMenu() {
        menuOpen = !menuOpen;
    }

    function handleUpdate(time) {
        lastUpdate = time;
    }

    function openChart() {
        chartOpen = true;
    }
    function openAbout() {
         showAbout = true;
    }
    function closeAbout() {
         showAbout = false;
    }

    function setMode(newMode) {
        mode = newMode;
        const now = new Date();
        
        if (mode === 'M') {
            selectedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        } else if (mode === 'D') {
            selectedDate = now.toISOString().split('T')[0];
        } else if (mode === 'A') {
            selectedDate = String(now.getFullYear());
        } else {
             selectedDate = now.toISOString().split('T')[0];
        }
    }

    $: chartTargetDate = mode === 'L' ? new Date() : new Date(selectedDate);

    $: modeLabel =
        mode === 'L' ? 'Modalità LIVE — ultimo aggiornamento:' :
        mode === 'D' ? 'Riepilogo giornaliero (' + selectedDate + ') — ultimo aggiornamento:' : 
        mode === 'M' ? 'Riepilogo mensile (' + selectedDate + ') — ultimo aggiornamento:' :
        mode === 'A' ? 'Riepilogo annuale (' + selectedDate + ') — ultimo aggiornamento:' : 
        'Riepilogo — ultimo aggiornamento:';
</script>

<style>
    .app-header-wrapper { 
        background: #111; 
        border-bottom: 1px solid #222; 
        padding: 0.4rem 0.6rem; 
        display: flex; 
        flex-direction: column; 
        gap: 0.4rem; 
    }
    .header-top { 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        position: relative; 
    }
    .app-title { 
        font-size: 1rem; 
        font-weight: 600; 
        text-align: center; 
        color: #ffffff; 
    }

    .hamburger { 
        position: absolute; 
        left: 0; 
        top: 50%; 
        transform: translateY(-50%); 
        cursor: pointer; 
        width: 28px; 
        height: 28px; 
        padding: 4px; 
        opacity: 0.9; 
        color: #ffffff; 
        fill: none; 
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
    .app-modes { 
        display: flex; 
        justify-content: center; 
        gap: 0.5rem; 
        align-items: center; 
        flex-wrap: wrap; 
    }
    .mode-btn { 
        padding: 6px 14px; 
        border-radius: 8px; 
        background: #1a1a1a; 
        color: #ccc; 
        font-size: 0.82rem; 
        cursor: pointer; 
        border: 1px solid #333; 
        transition: all 0.2s;
    }
    .mode-btn.active { 
        background: #444; 
        color: #fff; 
        font-weight: 600; 
        border-color: #666; 
    }
    .side-menu { 
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 220px; 
        height: 100vh; 
        background: #0f0f0f; 
        border-right: 1px solid #333; 
        padding: 1rem; 
        transform: translateX(-100%); 
        transition: transform 0.25s ease-out; 
        z-index: 999; 
        color: #fff; 
    }
    .side-menu.open { 
        transform: translateX(0); 
    }
    .menu-title { 
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #333;
        font-size: 1rem; 
        margin-bottom: 1rem; 
        font-weight: 600; 
        color: #fff; 
    }
    .menu-item { 
        padding: 0.6rem 0; 
        font-size: 0.9rem; 
        color: #ddd; 
        border-bottom: 1px solid #333; 
        cursor: pointer; 
        display: flex; 
        align-items: center;
        gap: 10px;
        transition: background-color 0.1s;
    }
    .menu-item:hover {
        background-color: #222;
        padding-left: 5px;
    }
    .menu-icon {
        width: 18px;
        height: 18px;
        color: #4fc3f7;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
    .overlay { 
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(0,0,0,0.45); 
        backdrop-filter: blur(2px); 
        opacity: 0; 
        pointer-events: none; 
        transition: opacity 0.25s ease-out; 
        z-index: 998; 
    }
    .overlay.show { 
        opacity: 1; 
        pointer-events: auto; 
    }
    @media(max-width: 420px) { 
        .app-title { 
            font-size: 0.9rem; 
        } 
    }
    .app-footer { 
        background: #111; 
        padding: 0.6rem; 
        border-top: 1px solid #222; 
        text-align: center; 
        font-size: 0.75rem; 
        color: #aaa; 
    }
    .footer-row { 
        display: flex; 
        justify-content: center; 
        gap: 0.8rem; 
        align-items: center; 
    }
    .footer-icon { 
        width: 24px; 
        height: 24px; 
        cursor: pointer; 
        opacity: 0.75; 
        color: #4fc3f7;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: opacity 0.2s;
    }
    .footer-icon:hover {
        opacity: 1;
    }
</style>

<main class="bg-black min-h-screen text-white flex flex-col">

    <div class="side-menu {menuOpen ? 'open' : ''}">
        <div class="menu-title">
            Menu
            <button on:click={() => menuOpen = false} style="background:none; border:none; color:#fff; cursor:pointer;">
                 <svg class="menu-icon" style="color: #fff;" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                 </svg>
            </button>
        </div>
        
        <div class="menu-item" on:click={() => { openChart(); menuOpen = false; }}>
             <svg class="menu-icon" viewBox="0 0 24 24">
                <line x1="12" y1="20" x2="12" y2="10"></line>
                <line x1="18" y1="20" x2="18" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
            Mostra Grafico
        </div>
        
        <div class="menu-item" on:click={() => { openAbout(); menuOpen = false; }}>
            About
        </div>
    </div>

    <div class="overlay {menuOpen ? 'show' : ''}" on:click={() => menuOpen = false}></div>

    <header class="app-header-wrapper">
        <div class="header-top">
            <svg class="hamburger" on:click={toggleMenu} viewBox="0 0 24 24">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <div class="app-title">Meteo Musei</div>
        </div>

        <div class="app-modes">
            <button class="mode-btn {mode === 'L' ? 'active' : ''}" on:click={() => setMode('L')}>L</button>
            <button class="mode-btn {mode === 'D' ? 'active' : ''}" on:click={() => setMode('D')}>D</button>
            <button class="mode-btn {mode === 'M' ? 'active' : ''}" on:click={() => setMode('M')}>M</button>
            <button class="mode-btn {mode === 'A' ? 'active' : ''}" on:click={() => setMode('A')}>A</button>
        </div>

        {#if mode === 'D'}
            <div style="display: flex; justify-content: center; margin-top: 0.4rem;">
                <DateSelector type="date" label="Giorno:" bind:value={selectedDate} />
            </div>
        {:else if mode === 'M'}
            <div style="display: flex; justify-content: center; margin-top: 0.4rem;">
                <DateSelector type="month" label="Mese:" bind:value={selectedDate} />
            </div>
        {:else if mode === 'A'} 
            <div style="display: flex; justify-content: center; margin-top: 0.4rem;">
                <DateSelector type="text" label="Anno (YYYY):" bind:value={selectedDate} 
                              style="width: 100px; text-align: center;" placeholder="2024" />
            </div>
        {/if}
    </header>

    <section class="flex-1">
        <Home 
            {mode} 
            {selectedDate} 
            onUpdate={handleUpdate} 
            on:openChart={openChart} 
        />
    </section>

    {#if chartOpen}
        <ChartModal 
            mode={mode} 
            date={chartTargetDate} 
            onClose={() => chartOpen = false} 
        />
    {/if}

    {#if showAbout}
    <AboutModal 
        onClose={closeAbout} 
    />
    {/if}

    

    <footer class="app-footer">
        <div class="footer-row">
            <span>
                {modeLabel}
                {lastUpdate ? ' ' + new Date(lastUpdate).toLocaleString() : ' —'}
            </span>
            
            <svg class="footer-icon" viewBox="0 0 24 24" on:click={openChart}>
                 <line x1="12" y1="20" x2="12" y2="10"></line>
                 <line x1="18" y1="20" x2="18" y2="4"></line>
                 <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
        </div>
    </footer>
    
    
</main>