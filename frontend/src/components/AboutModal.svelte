<script>
    import { X } from '@lucide/svelte'; 

    
    export let onClose; 

    const modalTitle = 'About Simply Meteo';

    // listener for close by key ESC
    import { onMount } from 'svelte';
    onMount(() => {
        const handleKeyDown = (e) => { 
            if (e.key === 'Escape') onClose(); 
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
             window.removeEventListener('keydown', handleKeyDown);
        };
    });
</script>

<style>
    /* Style Overlay (paste from ChartModal) */
    .modal-overlay { 
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100vh; 
        background: rgba(0, 0, 0, 0.95); 
        z-index: 1000; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        padding: 1rem;
        
        justify-content: center;
    }
    
    /* Style specific for about */
    .modal-content {
        width: 100%;
        max-width: 600px; 
        background: #222; 
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        color: #fff;
    }

    /* Style header (pasted from chartModal)) */
    .modal-header { 
        width: 100%; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding-bottom: 0.5rem; 
        border-bottom: 1px solid #333; 
        margin-bottom: 1.5rem; 
    }
    .modal-title { 
        font-size: 1.5rem; 
        font-weight: 600; 
        color: #fff; 
    }

   
    .close-btn { 
        cursor: pointer; 
        padding: 5px 10px; 
        border: 1px solid transparent; 
        border-radius: 5px; 
        display: flex; 
        align-items: center; 
        gap: 8px; 
        background: none; 
        color: #ccc; 
    }
    .close-btn:hover { 
        background-color: #333; 
        color: #fff; 
    }
    .close-icon { 
        width: 28px; 
        height: 28px; 
    }
    .close-text { 
        font-size: 0.9rem; 
        font-weight: 500; 
        display: none; 
    }
    
    @media (min-width: 600px) { 
        .close-text { display: inline; } 
    }

   
    .modal-body p { margin-bottom: 15px; line-height: 1.6; }
    .modal-body ul { list-style: disc; margin-left: 20px; }
    .modal-body strong { color: #4fc3f7; }

</style>

<div class="modal-overlay" on:click={onClose}>
    <div class="modal-content" on:click|stopPropagation> 
        
        <div class="modal-header">
            <span class="modal-title">{modalTitle}</span>
            <button class="close-btn" on:click={onClose}>
                <span class="close-text">Chiudi</span>
                <X class="close-icon" />
            </button>
        </div>

        <div class="modal-body">
            <p>Web application with real-time weather data for the Municipality of Musei</p>
        <p>Demonstration of radio reception of data from a low-cost Bresser 7-1 weather station</p>

        <p>Source code and details available on <a href="https://github.com/cristianpuddu/simply-meteo">Github</a></p>


        </div>

           
</div></div>