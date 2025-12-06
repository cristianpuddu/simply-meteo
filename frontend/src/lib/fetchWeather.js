// lib/fetchWeather.js

// Use the URL defined in the .env file (Prod/Dev handling)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const API_RESOURCE = 'weather_data'; // // Define the resource here

if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL non è definito. Controllare i file .env.");
}

export async function fetchWeather(params = '') {
    try {
        // Concatenate the base URL with query parameters (e.g., "?select=...")
        const url = `${API_BASE_URL}/${API_RESOURCE}${params}`;
        
        // console.log('Fetching data from:', url); // Uncomment for debugging

        const res = await fetch(url);
        
        if (!res.ok) {
            console.error(`Fetch error: ${res.status} for URL: ${url}`);
            throw new Error(`Fetch error: ${res.status}`);
        }
        
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Errore fetch dati meteo:', err);
        return []; // Return empty array to avoid crashes in map/filter
    }
}