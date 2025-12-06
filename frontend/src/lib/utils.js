// lib/utils.js

// 1. Wind direction from degrees to text
export function windDirText(degrees = 0) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const deg = (typeof degrees === 'number' && !isNaN(degrees)) ? degrees : 0;
  const index = Math.round((deg % 360) / 22.5) % 16;
  return dirs[index];
}

// 2. Dew point (Magnus formula)
export function dewPoint(tempC = 0, humidity = 0) {
  const a = 17.27;
  const b = 237.7;
  const rh = Math.max(0.0001, Math.min(100, humidity)); 
  const alpha = (a * tempC) / (b + tempC) + Math.log(rh / 100);
  const dp = (b * alpha) / (a - alpha);
  return Math.round(dp * 10) / 10;
}



// --- FORMULAS FOR ADVANCED CHART ---

/**
* Calculate Wind Chill (valid for T <= 10°C and Wind > 4.8 km/h)
*/
function calculateWindChill(tempC, windKmh) {
  if (windKmh < 4.8) return tempC;
  // standard NOAA / Jagti
  const wc = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * tempC * Math.pow(windKmh, 0.16);
  return wc;
}

/**
* Calculate Heat Index (valid for T >= 27°C and RH >= 40%)
*/
function calculateHeatIndex(tempC, humidity) {
  const T = tempC;
  const R = humidity;
  // Formula regressione NOAA
  let HI = -8.78469475556 + 1.61139411 * T + 2.33854883889 * R + -0.14611605 * T * R + -0.012308094 * T * T + -0.0164248277778 * R * R + 0.002211732 * T * T * R + 0.00072546 * T * R * R + -0.000003582 * T * T * R * R;
  return HI;
}

/**
 * General Steadman formula (Apparent Temp) - NOT exported
 * Great for intermediate ranges.
 */

function calculateSteadman(tempC, windMps, humidity) {
  const T = Number(tempC) || 0;
  const v = Number(windMps) || 0;
  const RH = Math.max(0, Math.min(100, Number(humidity) || 0));

  // vapor pressure e (hPa)
  const e = (RH / 100) * 6.105 * Math.exp((17.27 * T) / (237.7 + T));

  // Apparent temperature formula
  const at = T + 0.33 * e - 0.70 * v - 4.0;

  
  return at; 
}

/**
* 4. NEW "SMART" FUNCTION FOR THE CHART
* Uses Wind Chill for cold, Heat Index for hot, and Steadman (old) for intermediate.
*/
export function getPerceivedTemp(tempC, humidity, windMps) {
  if (tempC === null || typeof tempC === 'undefined') return null;
  
  const t = Number(tempC);
  const h = Number(humidity) || 0;
  const w_ms = Number(windMps) || 0;
  const w_kmh = w_ms * 3.6; 

  let perceived;

 // A. COLD: Wind Chill (T <= 10°C and significant wind)
  if (t <= 10 && w_kmh >= 4.8) {
      perceived = calculateWindChill(t, w_kmh);
  } 
// B. HOT: Heat Index (T >= 27°C and high humidity)
  else if (t >= 27 && h >= 40) {
      perceived = calculateHeatIndex(t, h);
  } 
// C. NEUTRAL: Use the old Steadman formula
  else {
    perceived = calculateSteadman(t, w_ms, h);
  }

  return Math.round(perceived * 10) / 10;
}