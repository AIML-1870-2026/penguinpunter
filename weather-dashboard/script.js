/* =========================================================
   Weather Dashboard — script.js
   ========================================================= */

const API_KEY = 'adfa9e3333daa4d2c429bd35ae56949b';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// --- DOM refs ---
const cityInput     = document.getElementById('city-input');
const searchBtn     = document.getElementById('search-btn');
const recentEl      = document.getElementById('recent-searches');
const errorBanner   = document.getElementById('error-banner');
const skeletonWrap  = document.getElementById('skeleton-wrapper');
const mainContent   = document.getElementById('main-content');
const unitC         = document.getElementById('unit-c');
const unitF         = document.getElementById('unit-f');

// Current weather display
const weatherCard   = document.getElementById('weather-card');
const cityNameEl    = document.getElementById('city-name');
const countryEl     = document.getElementById('country-code');
const weatherIconEl = document.getElementById('weather-icon');
const tempEl        = document.getElementById('temperature');
const condDescEl    = document.getElementById('condition-desc');
const humidityEl    = document.getElementById('humidity');
const windEl        = document.getElementById('wind-speed');
const updatedEl     = document.getElementById('last-updated');

// AQI
const aqiPanel      = document.getElementById('aqi-panel');
const aqiScore      = document.getElementById('aqi-score');
const aqiLabel      = document.getElementById('aqi-label');
const aqiBar        = document.getElementById('aqi-bar');
const aqiPollutants = document.getElementById('aqi-pollutants');

// Hourly
const hourlySection = document.getElementById('hourly-section');
const hourlyStrip   = document.getElementById('hourly-strip');

// Forecast
const forecastSection = document.getElementById('forecast-section');
const forecastGrid    = document.getElementById('forecast-grid');

// --- State ---
let currentData   = null;   // raw current weather response
let currentUnit   = 'C';    // 'C' or 'F'
let recentCities  = [];

// =========================================================
// Init
// =========================================================
function init() {
  // Restore unit preference
  const savedUnit = localStorage.getItem('weatherUnit') || 'C';
  currentUnit = savedUnit;
  (savedUnit === 'F' ? unitF : unitC).checked = true;

  // Restore recent searches
  const saved = localStorage.getItem('recentCities');
  recentCities = saved ? JSON.parse(saved) : [];
  renderRecentChips();

  // Event listeners
  searchBtn.addEventListener('click', handleSearch);
  cityInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });
  unitC.addEventListener('change', () => setUnit('C'));
  unitF.addEventListener('change', () => setUnit('F'));

  // Load Omaha weather on startup
  fetchWeather('Omaha');
}

// =========================================================
// Unit toggle
// =========================================================
function setUnit(unit) {
  currentUnit = unit;
  localStorage.setItem('weatherUnit', unit);
  if (currentData) renderCurrentWeather(currentData);
  // Also re-render forecast/hourly (temperatures)
  if (window._forecastDays) renderForecastGrid(window._forecastDays);
  if (window._hourlySlots) renderHourlyStrip(window._hourlySlots);
}

function toDisplay(tempC) {
  if (currentUnit === 'F') return Math.round(tempC * 9 / 5 + 32) + '°F';
  return Math.round(tempC) + '°C';
}

// =========================================================
// Search handler
// =========================================================
async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) { cityInput.value = ''; return; }
  await fetchWeather(city);
}

// =========================================================
// Fetch & orchestrate
// =========================================================
async function fetchWeather(city) {
  showError(null);
  showSkeleton(true);
  hideMain();

  try {
    const [currentRes, forecastRes] = await Promise.all([
      apiFetch(`/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`),
      apiFetch(`/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`)
    ]);

    currentData = currentRes;

    // Save to recent
    addRecentCity(city);
    cityInput.value = '';

    // Render current
    renderCurrentWeather(currentRes);

    // Forecast & hourly
    const { days, hourly } = processForecast(forecastRes, currentRes);
    window._forecastDays  = days;
    window._hourlySlots   = hourly;
    renderForecastGrid(days);
    renderHourlyStrip(hourly);

    // AQI (uses lat/lon from current response)
    const { coord } = currentRes;
    fetchAQI(coord.lat, coord.lon);

    showSkeleton(false);
    showMain();

  } catch (err) {
    showSkeleton(false);
    const msg = err.message.includes('404')
      ? 'City not found. Check the spelling and try again.'
      : 'Network error. Please check your connection and retry.';
    showError(msg);
  }
}

async function apiFetch(path) {
  const res = await fetch(BASE_URL + path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// =========================================================
// Render current weather
// =========================================================
function renderCurrentWeather(data) {
  const { name, sys, weather, main, wind, dt } = data;

  cityNameEl.textContent  = name;
  countryEl.textContent   = sys.country;
  condDescEl.textContent  = weather[0].description;
  humidityEl.textContent  = main.humidity + '%';
  windEl.textContent      = wind.speed.toFixed(1) + ' m/s';
  tempEl.textContent      = toDisplay(main.temp);

  // Icon
  const iconCode = weather[0].icon;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIconEl.alt = weather[0].description;

  // Timestamp
  const date = new Date(dt * 1000);
  updatedEl.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Animated background
  setWeatherBackground(weather[0].id, sys.sunrise, sys.sunset, dt);
}

// =========================================================
// Animated backgrounds
// =========================================================
function setWeatherBackground(conditionId, sunrise, sunset, dt) {
  const bgClasses = [
    'bg-clear-day','bg-clear-night','bg-rain','bg-thunderstorm',
    'bg-fog','bg-clouds','bg-snow'
  ];
  document.body.classList.remove(...bgClasses);

  let cls = null;
  if (conditionId >= 200 && conditionId < 300) {
    cls = 'bg-thunderstorm';
  } else if (conditionId >= 300 && conditionId < 600) {
    cls = 'bg-rain';
  } else if (conditionId >= 600 && conditionId < 700) {
    cls = 'bg-snow';
  } else if (conditionId >= 700 && conditionId < 800) {
    cls = 'bg-fog';
  } else if (conditionId === 800) {
    const isDay = dt > sunrise && dt < sunset;
    cls = isDay ? 'bg-clear-day' : 'bg-clear-night';
  } else if (conditionId > 800) {
    cls = 'bg-clouds';
  }

  if (cls) document.body.classList.add(cls);

  // Spawn or clear raindrops
  const isRainy = cls === 'bg-rain' || cls === 'bg-thunderstorm';
  isRainy ? spawnRain(cls === 'bg-thunderstorm') : clearRain();
}

// =========================================================
// Raindrop generator
// =========================================================
const rainContainer = document.getElementById('rain-container');

function spawnRain(heavy) {
  clearRain();
  const count = heavy ? 120 : 80;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';

    const height = 10 + Math.random() * 18;   // 10–28px tall
    const duration = heavy
      ? 0.4 + Math.random() * 0.4              // 0.4–0.8s (fast)
      : 0.6 + Math.random() * 0.6;             // 0.6–1.2s

    drop.style.left     = Math.random() * 100 + 'vw';
    drop.style.height   = height + 'px';
    drop.style.animationDuration  = duration + 's';
    drop.style.animationDelay     = -(Math.random() * duration) + 's';

    fragment.appendChild(drop);
  }
  rainContainer.appendChild(fragment);
}

function clearRain() {
  rainContainer.innerHTML = '';
}

// =========================================================
// Process forecast data
// =========================================================
function processForecast(data, currentData) {
  const now = Date.now() / 1000;
  const list = data.list;

  // Hourly: next 12 hours (first 4 slots = 12h of 3h intervals)
  const hourly = list.slice(0, 4).map(item => ({
    dt:   item.dt,
    temp: item.main.temp,
    icon: item.weather[0].icon,
    desc: item.weather[0].description
  }));

  // 5-day: group by day, take next 5 days after today
  const dayMap = {};
  const todayStr = new Date().toDateString();

  list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayStr = date.toDateString();
    if (dayStr === todayStr) return; // skip today
    if (!dayMap[dayStr]) {
      dayMap[dayStr] = {
        label: date.toLocaleDateString([], { weekday: 'short' }),
        temps: [],
        icons: []
      };
    }
    dayMap[dayStr].temps.push(item.main.temp);
    dayMap[dayStr].icons.push(item.weather[0].icon);
  });

  const days = Object.values(dayMap).slice(0, 5).map(d => {
    // Pick most common icon (mode)
    const iconMode = d.icons.sort((a, b) =>
      d.icons.filter(v => v === b).length - d.icons.filter(v => v === a).length
    )[0];
    return {
      label: d.label,
      hi: Math.max(...d.temps),
      lo: Math.min(...d.temps),
      icon: iconMode
    };
  });

  return { days, hourly };
}

// =========================================================
// Render 5-day forecast
// =========================================================
function renderForecastGrid(days) {
  forecastGrid.innerHTML = '';
  days.forEach(day => {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <span class="forecast-day">${day.label}</span>
      <img class="forecast-icon"
           src="https://openweathermap.org/img/wn/${day.icon}@2x.png"
           alt="weather icon" />
      <span class="forecast-hi">${toDisplay(day.hi)}</span>
      <span class="forecast-lo">${toDisplay(day.lo)}</span>
    `;
    forecastGrid.appendChild(card);
  });
  forecastSection.hidden = false;
}

// =========================================================
// Render hourly strip
// =========================================================
function renderHourlyStrip(slots) {
  hourlyStrip.innerHTML = '';
  const nowHour = new Date().getHours();

  slots.forEach((slot, i) => {
    const date  = new Date(slot.dt * 1000);
    const hour  = date.getHours();
    const isNow = i === 0;
    const label = isNow ? 'Now' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const div = document.createElement('div');
    div.className = 'hourly-slot' + (isNow ? ' is-now' : '');
    div.innerHTML = `
      <span class="hourly-time">${label}</span>
      <img class="hourly-icon"
           src="https://openweathermap.org/img/wn/${slot.icon}@2x.png"
           alt="${slot.desc}" />
      <span class="hourly-temp">${toDisplay(slot.temp)}</span>
    `;
    hourlyStrip.appendChild(div);
  });

  hourlySection.hidden = false;
}

// =========================================================
// AQI
// =========================================================
const AQI_LABELS = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

async function fetchAQI(lat, lon) {
  try {
    const data = await apiFetch(
      `/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    if (!data.list || data.list.length === 0) return;
    renderAQI(data.list[0]);
    aqiPanel.hidden = false;
  } catch {
    aqiPanel.hidden = true;
  }
}

function renderAQI(entry) {
  const aqi = entry.main.aqi;
  const comp = entry.components;

  // Clear previous level classes
  aqiPanel.classList.remove('aqi-1','aqi-2','aqi-3','aqi-4','aqi-5');
  aqiPanel.classList.add(`aqi-${aqi}`);

  aqiScore.textContent = aqi;
  aqiLabel.textContent = AQI_LABELS[aqi];

  // Position the dot on the bar (aqi 1-5 → 10%, 30%, 50%, 70%, 90%)
  const pct = ((aqi - 1) / 4) * 80 + 10;
  aqiBar.style.left = pct + '%';

  // Pollutants
  const pollutants = [
    { name: 'PM2.5', value: comp.pm2_5.toFixed(1) },
    { name: 'PM10',  value: comp.pm10.toFixed(1) },
    { name: 'O₃',    value: comp.o3.toFixed(1) },
    { name: 'NO₂',   value: comp.no2.toFixed(1) }
  ];

  aqiPollutants.innerHTML = pollutants.map(p => `
    <div class="pollutant-item">
      <span class="pollutant-name">${p.name}</span>
      <span class="pollutant-value">${p.value} μg/m³</span>
    </div>
  `).join('');
}

// =========================================================
// Recent searches
// =========================================================
function addRecentCity(city) {
  const normalized = city.trim();
  recentCities = [normalized, ...recentCities.filter(c => c.toLowerCase() !== normalized.toLowerCase())].slice(0, 6);
  localStorage.setItem('recentCities', JSON.stringify(recentCities));
  renderRecentChips();
}

function renderRecentChips() {
  recentEl.innerHTML = '';
  recentCities.forEach(city => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = city;
    chip.setAttribute('aria-label', `Search for ${city}`);
    chip.addEventListener('click', () => fetchWeather(city));
    recentEl.appendChild(chip);
  });
}

// =========================================================
// UI helpers
// =========================================================
function showError(msg) {
  if (msg) {
    errorBanner.textContent = msg;
    errorBanner.hidden = false;
  } else {
    errorBanner.hidden = true;
    errorBanner.textContent = '';
  }
}

function showSkeleton(show) {
  skeletonWrap.hidden = !show;
}

function showMain() {
  mainContent.hidden = false;
}

function hideMain() {
  mainContent.hidden = true;
  aqiPanel.hidden    = true;
  hourlySection.hidden    = true;
  forecastSection.hidden  = true;
}

// =========================================================
// Start
// =========================================================
init();
