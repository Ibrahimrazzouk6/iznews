/**
 * WeatherService — fetches current weather using Open-Meteo (free, no key required).
 * Provides location-aware weather context in the dashboard header.
 */

const GEO_URL = 'https://ipapi.co/json/'; // IP geolocation
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const WMO_CODES = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Icy fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  61: { label: 'Slight rain', icon: '🌧️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Slight snow', icon: '🌨️' },
  80: { label: 'Showers', icon: '🌦️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
};

/**
 * @returns {Promise<{ city: string, temp: number, unit: string, icon: string, condition: string } | null>}
 */
export async function fetchWeather() {
  try {
    // 1. Get user location via IP
    const geoRes = await fetch(GEO_URL);
    if (!geoRes.ok) return null;
    const geo = await geoRes.json();

    const { latitude, longitude, city, country_name } = geo;
    if (!latitude || !longitude) return null;

    // 2. Fetch weather for that location
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'temperature_2m,weathercode',
      temperature_unit: 'celsius',
      timezone: 'auto',
    });

    const weatherRes = await fetch(`${WEATHER_URL}?${params.toString()}`);
    if (!weatherRes.ok) return null;

    const weather = await weatherRes.json();
    const current = weather?.current;
    if (!current) return null;

    const code = current.weathercode ?? 0;
    const meta = WMO_CODES[code] || { label: 'Unknown', icon: '🌡️' };

    return {
      city: city || country_name || 'Unknown',
      temp: Math.round(current.temperature_2m),
      unit: '°C',
      icon: meta.icon,
      condition: meta.label,
    };
  } catch {
    return null; // Weather is non-critical; fail silently
  }
}
