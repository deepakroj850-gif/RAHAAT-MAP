const DEFAULT_CENTER = [20.5937, 78.9629];
const DEMO_TEXT = 'DEMO DATA — NOT FOR REAL-WORLD SAFETY DECISIONS.';

const appState = {
  demoMode: true,
  map: null,
  routeLayers: [],
  selectedRouteId: null,
  currentLocation: null,
  recommendationMode: 'safest',
  routeResults: [],
  reportItems: loadSavedReports(),
  layerToggles: {
    airQuality: true,
    rainfall: false,
    flood: false,
    community: true,
  }
};

const dangerStyles = {
  green: 'green',
  yellow: 'yellow',
  orange: 'orange',
  red: 'red',
};

function initApp() {
  initializeMap();
  registerEventHandlers();
  renderReportList();
  updateApiStatus();
  updateDemoBanner();
  setStatus('Searching for a route is ready. Start by entering your journey details.', 'info');
  loadSampleDashboard();
}

function initializeMap() {
  const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    preferCanvas: true,
  }).setView(DEFAULT_CENTER, 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  appState.map = map;
}

function registerEventHandlers() {
  document.getElementById('route-form').addEventListener('submit', handleRouteSubmit);
  document.getElementById('demo-toggle').addEventListener('click', toggleDemoMode);
  document.getElementById('use-my-location-start').addEventListener('click', getCurrentLocationForStart);

  document.querySelectorAll('[data-layer]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      appState.layerToggles[checkbox.dataset.layer] = checkbox.checked;
      refreshLayerVisibility();
    });
  });

  document.getElementById('hazard-form').addEventListener('submit', submitHazardReport);
}

function toggleDemoMode() {
  appState.demoMode = !appState.demoMode;
  updateDemoBanner();
  setStatus(
    appState.demoMode
      ? 'Demo mode enabled. Real APIs are optional; sample environmental values are displayed with labels.'
      : 'Demo mode disabled. Live provider data is preferred when available.',
    'info'
  );
}

function updateDemoBanner() {
  const banner = document.getElementById('demo-banner');
  banner.style.display = appState.demoMode ? 'block' : 'none';
  document.getElementById('demo-toggle').textContent = `Demo Mode: ${appState.demoMode ? 'ON' : 'OFF'}`;
}

function setStatus(message, tone = 'info') {
  const apiStatus = document.getElementById('api-status');
  apiStatus.innerHTML = `<strong>Status:</strong><br>${message}`;
  apiStatus.style.borderColor = tone === 'error' ? '#f3b3a9' : tone === 'success' ? '#afdacc' : '#dfe9e4';
  apiStatus.style.background = tone === 'error' ? '#fff5f5' : tone === 'success' ? '#edf9f2' : '#f9fbfa';
}

function handleRouteSubmit(event) {
  event.preventDefault();

  const start = document.getElementById('start-input').value.trim();
  const destination = document.getElementById('destination-input').value.trim();
  const mode = document.getElementById('route-mode').value;
  appState.recommendationMode = mode;

  if (!start || !destination) {
    setStatus('Please enter both a start and a destination before searching.', 'error');
    return;
  }

  findRoutes(start, destination, mode);
}

function buildDemoRoutes(startQuery, destinationQuery, mode) {
  const startBase = parseLocationSeed(startQuery, 12.9716, 77.5946);
  const destBase = parseLocationSeed(destinationQuery, 13.0672, 77.6500);

  const routes = [
    {
      id: 'route-1',
      name: 'Safest route',
      category: 'Safest',
      start: { lat: startBase.lat, lon: startBase.lon, displayName: startQuery },
      destination: { lat: destBase.lat, lon: destBase.lon, displayName: destinationQuery },
      distanceKm: 18.4,
      durationMinutes: 32,
      geometry: {
        type: 'LineString',
        coordinates: [
          [startBase.lon, startBase.lat],
          [startBase.lon + 0.02, startBase.lat + 0.04],
          [destBase.lon - 0.04, destBase.lat - 0.03],
          [destBase.lon, destBase.lat],
        ],
      },
      riskScore: 32,
      pollutionScore: 42,
      trafficScore: 62,
      arrivalRain: 1,
      arrivalRainProbability: 15,
      arrivalForecastSource: 'Simulated forecast',
      exposureIndex: Number((42 * 32 / 60).toFixed(1)),
      carbonKg: 4.62,
      riskLevel: 'green',
      pollution: '42 AQI',
      aqi: 42,
      pm25: 24,
      pm10: 42,
      weatherStats: { temp: 29, humidity: 68, wind: 12, rain: 4 },
      flood: 'Flood history unavailable (demo)',
      traffic: 'Moderate (sampled)',
      weather: '4 mm rain',
      routeMode: mode,
      coverage: 'Partial demo coverage',
      source: 'Demo route model',
      dataTimestamp: new Date().toISOString(),
      explanation: 'This demo route is generated deterministically for local testing and does not represent a real-time route. Only the map geometry is illustrative.',
      selected: false,
      verifiedClosure: false,
      note: 'This is a simulated estimate and not a real-world safety verdict.',
    },
    {
      id: 'route-2',
      name: 'Lowest pollution',
      category: 'Low pollution',
      start: { lat: startBase.lat, lon: startBase.lon, displayName: startQuery },
      destination: { lat: destBase.lat, lon: destBase.lon, displayName: destinationQuery },
      distanceKm: 19.1,
      durationMinutes: 36,
      geometry: {
        type: 'LineString',
        coordinates: [
          [startBase.lon, startBase.lat],
          [startBase.lon + 0.1, startBase.lat + 0.06],
          [destBase.lon + 0.03, destBase.lat - 0.02],
          [destBase.lon, destBase.lat],
        ],
      },
      riskScore: 48,
      pollutionScore: 58,
      trafficScore: 38,
      arrivalRain: 4,
      arrivalRainProbability: 45,
      arrivalForecastSource: 'Simulated forecast',
      exposureIndex: Number((58 * 36 / 60).toFixed(1)),
      carbonKg: 4.79,
      riskLevel: 'yellow',
      pollution: '58 AQI',
      aqi: 58,
      pm25: 33,
      pm10: 55,
      weatherStats: { temp: 29, humidity: 68, wind: 12, rain: 7 },
      flood: 'Flood history unavailable (demo)',
      traffic: 'Light (sampled)',
      weather: '7 mm rain',
      routeMode: mode,
      coverage: 'Partial demo coverage',
      source: 'Demo route model',
      dataTimestamp: new Date().toISOString(),
      explanation: 'This route keeps a moderate environmental profile in demo mode and is intended to illustrate route scoring only.',
      selected: false,
      verifiedClosure: false,
      note: 'This is a simulated estimate and not a real-world safety verdict.',
    },
    {
      id: 'route-3',
      name: 'Lowest traffic',
      category: 'Low traffic',
      start: { lat: startBase.lat, lon: startBase.lon, displayName: startQuery },
      destination: { lat: destBase.lat, lon: destBase.lon, displayName: destinationQuery },
      distanceKm: 22.8,
      durationMinutes: 41,
      geometry: {
        type: 'LineString',
        coordinates: [
          [startBase.lon, startBase.lat],
          [startBase.lon - 0.06, startBase.lat + 0.09],
          [destBase.lon + 0.11, destBase.lat + 0.02],
          [destBase.lon, destBase.lat],
        ],
      },
      riskScore: 62,
      pollutionScore: 74,
      trafficScore: 18,
      arrivalRain: 9,
      arrivalRainProbability: 75,
      arrivalForecastSource: 'Simulated forecast',
      exposureIndex: Number((74 * 41 / 60).toFixed(1)),
      carbonKg: 5.72,
      riskLevel: 'orange',
      pollution: '74 AQI',
      aqi: 74,
      pm25: 45,
      pm10: 72,
      weatherStats: { temp: 29, humidity: 68, wind: 12, rain: 10 },
      flood: 'Flood history unavailable (demo)',
      traffic: 'Lowest (sampled)',
      weather: '10 mm rain',
      routeMode: mode,
      coverage: 'Partial demo coverage',
      source: 'Demo route model',
      dataTimestamp: new Date().toISOString(),
      explanation: 'This route takes longer and shows a higher environmental exposure profile in the demo dataset; it is not a real-world recommendation.',
      selected: false,
      verifiedClosure: false,
      note: 'This is a simulated estimate and not a real-world safety verdict.',
    }
  ];

  return routes;
}

function parseLocationSeed(query, fallbackLat, fallbackLon) {
  const normalized = (query || '').trim();
  const match = normalized.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);

  if (match) {
    return {
      lat: parseFloat(match[1]),
      lon: parseFloat(match[2]),
    };
  }

  const hash = Array.from(normalized).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 17) - 8) / 100;
  const lonOffset = (((hash * 13) % 19) - 9) / 100;

  return {
    lat: fallbackLat + latOffset,
    lon: fallbackLon + lonOffset,
  };
}

async function findRoutes(startQuery, destinationQuery, mode) {
  const searchButton = document.querySelector('#route-form button[type="submit"]');
  searchButton.classList.add('is-loading');
  searchButton.disabled = true;
  searchButton.dataset.originalLabel = searchButton.textContent;
  searchButton.textContent = 'Finding routes';
  setStatus('Geocoding start and destination…', 'info');

  try {
    const [start, destination] = await Promise.all([
      geocodeLocation(startQuery),
      geocodeLocation(destinationQuery),
    ]);

    if (!start || !destination) {
      throw new Error('One or both locations could not be resolved. Please try a more specific place name.');
    }

    const routePromise = fetchDrivingRoutes(start, destination);
    const envPromise = Promise.all([
      fetchEnvironmentForPoint(start.lat, start.lon),
      fetchEnvironmentForPoint(destination.lat, destination.lon)
    ]);

    const routeResponse = await routePromise;
    const environmentData = await envPromise;

    const routeOptions = buildRouteOptions(routeResponse.routes, start, destination, mode, environmentData);
    renderRoutes(routeOptions, mode);

    const recommendation = generateRecommendation(routeOptions, mode);
    renderRecommendation(recommendation);
    setStatus(`Calculated ${routeOptions.length} alternative routes with route scoring and environmental context.`, 'success');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Route calculation failed. Please try again or enable demo mode.', 'error');
    if (appState.demoMode) {
      const demoRoutes = buildDemoRoutes(startQuery, destinationQuery, mode);
      renderRoutes(demoRoutes, mode);
      const recommendation = generateRecommendation(demoRoutes, mode);
      renderRecommendation(recommendation);
      setStatus('Route provider failed; demo route preview was used instead.', 'info');
    }
  } finally {
    searchButton.classList.remove('is-loading');
    searchButton.disabled = false;
    searchButton.textContent = searchButton.dataset.originalLabel || 'Find Routes';
  }
}

async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Geocoding request failed.');
  }

  const results = await response.json();
  if (!results.length) {
    return null;
  }

  const item = results[0];
  return {
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    displayName: item.display_name,
    query,
  };
}

async function fetchDrivingRoutes(start, destination) {
  const coords = `${start.lon},${start.lat};${destination.lon},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?alternatives=true&geometries=geojson&steps=false&overview=full&annotations=false`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Routing provider is unavailable right now.');
  }

  const data = await response.json();
  if (!data.routes || !data.routes.length) {
    throw new Error('No valid routes were returned for the selected journey.');
  }

  return data;
}

function buildRouteOptions(routes, start, destination, mode, environmentData) {
  const baseRoutes = routes.map((route, index) => {
    const polyline = route.geometry && route.geometry.coordinates ? route.geometry : null;
    const distanceKm = (route.distance || 0) / 1000;
    const durationMinutes = (route.duration || 0) / 60;
    const environmental = assessRouteEnvironmental(route, environmentData, index);

    return {
      id: `route-${index + 1}`,
      name: `Route ${index + 1}`,
      pollutionScore: Number.parseInt(String(environmental.pollution).match(/\d+/)?.[0] || '999', 10),
      trafficScore: durationMinutes,
      exposureIndex: environmental.exposureIndex,
      carbonKg: environmental.carbonKg,
      baseRiskScore: environmental.riskScore,
      aqi: environmental.aqi,
      pm25: environmental.pm25,
      pm10: environmental.pm10,
      weatherStats: environmental.weatherStats,
      arrivalRain: environmental.arrivalRain,
      arrivalRainProbability: environmental.arrivalRainProbability,
      arrivalForecastSource: environmental.arrivalForecastSource,
      communityHazards: environmental.communityHazards,
      riskObservations: environmental.riskObservations,
      start,
      destination,
      geometry: polyline,
      distanceKm,
      durationMinutes,
      riskScore: environmental.riskScore,
      riskCoverage: environmental.riskCoverage,
      riskFactorCount: environmental.riskFactorCount,
      riskLevel: environmental.riskLevel,
      riskColor: environmental.riskColor,
      pollution: environmental.pollution,
      flood: environmental.flood,
      traffic: environmental.traffic,
      weather: environmental.weather,
      routeMode: mode,
      coverage: environmental.coverage,
      source: environmental.source,
      dataTimestamp: environmental.dataTimestamp,
      explanation: environmental.explanation,
      selected: false,
      verifiedClosure: environmental.verifiedClosure || false,
      note: environmental.note,
      markers: environmental.markers || [],
    };
  });

  // Give each available real alternative a distinct best-fit label. OSRM may
  // return fewer than three genuine paths, so we never invent live routes.
  const criteria = [
    { name: 'Safest route', category: 'Safest', score: (route) => route.riskScore },
    { name: 'Lowest pollution', category: 'Low pollution', score: (route) => route.exposureIndex ?? route.pollutionScore },
    { name: 'Lowest traffic', category: 'Low traffic', score: (route) => route.trafficScore },
  ];
  const available = new Set(baseRoutes);
  criteria.forEach((criterion) => {
    if (!available.size) return;
    const best = [...available].sort((a, b) => criterion.score(a) - criterion.score(b))[0];
    best.name = criterion.name;
    best.category = criterion.category;
    available.delete(best);
  });

  return baseRoutes;
}

function assessRouteEnvironmental(route, environmentData, index) {
  const distanceKm = ((route.distance || 0) / 1000).toFixed(1);
  const distanceValue = Number(distanceKm);
  const airQuality = getAverageAqiFromEnvironment(environmentData[0], environmentData[1]);
  const durationMinutes = (route.duration || 0) / 60;
  const weather = getAverageWeatherFromEnvironment(environmentData[0], environmentData[1]);
  const arrivalWeather = getArrivalWeather(environmentData[1], durationMinutes);
  const rainAtArrival = arrivalWeather?.precipitation ?? (appState.demoMode ? weather.rain : null);
  const probabilityAtArrival = arrivalWeather?.precipitationProbability ?? (appState.demoMode ? 25 + index * 20 : null);
  const nearbyReports = getRouteCommunityHazards(route);
  const floodRisk = nearbyReports.length
    ? Math.min(90, 55 + nearbyReports.length * 10)
    : appState.demoMode ? 26 + (index * 12) : null;
  const trafficRisk = 18 + (index * 8);
  const weatherRisk = rainAtArrival === null
    ? null
    : clamp((rainAtArrival * 5) + ((probabilityAtArrival || 0) * 0.25), 0, 100);
  const pollutionRisk = clamp(Math.max(0, airQuality - 30), 0, 100);

  const observations = {
    flood: {
      score: floodRisk,
      source: nearbyReports.length ? 'Nearby unverified community reports' : appState.demoMode ? 'Demo risk model' : 'Flood provider unavailable',
      verified: false,
      label: nearbyReports.length ? `${nearbyReports.length} unverified report(s) near route` : appState.demoMode ? 'Sampled estimate' : 'Insufficient data'
    },
    pollution: {
      score: pollutionRisk,
      source: 'Open-Meteo AQI estimate',
      verified: false,
      label: `${airQuality || 'N/A'} AQI projection`
    },
    traffic: {
      score: appState.demoMode ? trafficRisk : null,
      source: appState.demoMode ? 'Demo traffic model' : 'Traffic provider not configured',
      verified: false,
      label: appState.demoMode ? 'Sampled delay estimate' : 'Traffic unavailable'
    },
    weather: {
      score: weatherRisk,
      source: 'Weather forecast estimate',
      verified: false,
      label: rainAtArrival === null ? 'Arrival forecast unavailable' : `${rainAtArrival} mm rain near arrival`
    },
  };

  const risk = calculateRouteRiskScore(observations);

  return {
    riskScore: Number(risk.score.toFixed(0)),
    riskLevel: risk.level,
    riskCoverage: risk.coverage,
    riskFactorCount: risk.factors,
    riskObservations: observations,
    riskColor: dangerStyles[risk.level],
    pollution: airQuality ? `${airQuality} AQI` : 'Insufficient data',
    aqi: airQuality,
    pm25: getAverageMetric(environmentData, 'pm25'),
    pm10: getAverageMetric(environmentData, 'pm10'),
    weatherStats: weather,
    exposureIndex: Number((airQuality * durationMinutes / 60).toFixed(1)),
    carbonKg: Number((distanceValue * 0.251).toFixed(2)),
    arrivalRain: rainAtArrival,
    arrivalRainProbability: probabilityAtArrival,
    arrivalForecastSource: arrivalWeather ? 'Open-Meteo hourly forecast at destination' : appState.demoMode ? 'Simulated arrival forecast' : 'Arrival-time forecast unavailable',
    communityHazards: nearbyReports.length,
    flood: nearbyReports.length ? `${nearbyReports.length} nearby unverified report(s)` : 'Flood history unavailable',
    traffic: appState.demoMode ? ['Moderate (sampled)', 'Light (sampled)', 'Lowest (sampled)'][index % 3] : 'Traffic provider not configured',
    weather: rainAtArrival === null ? 'Arrival forecast unavailable' : `${rainAtArrival} mm rain at arrival`,
    coverage: appState.demoMode ? 'Partial demo coverage' : 'Limited live coverage',
    source: appState.demoMode ? 'Demo environmental model' : 'Live route geometry + estimate-only analysis',
    dataTimestamp: new Date().toISOString(),
    explanation: `Route ${index + 1} is approximately ${distanceKm} km long. Arrival-time rain is estimated from the destination forecast; flood history and live traffic are not connected. Nearby community reports are unverified.`,
    verifiedClosure: false,
    note: `${appState.demoMode ? 'Simulated demo estimate.' : 'Live route with estimated environmental data.'} Flood history and live traffic are unavailable; nearby community reports are unverified.`
  };
}

function calculateRouteRiskScore(observations) {
  const weights = { flood: 0.4, pollution: 0.3, traffic: 0.2, weather: 0.1 };
  let total = 0;
  let factors = 0;

  Object.entries(observations).forEach(([key, value]) => {
    if (!value || value.score === undefined || value.score === null) {
      return;
    }
    const weightedValue = Number(value.score) * weights[key];
    total += weightedValue;
    factors += weights[key];
  });

  const score = factors > 0 ? total / factors : 0;
  const level = score >= 70 ? 'red' : score >= 50 ? 'orange' : score >= 35 ? 'yellow' : 'green';

  return {
    score: clamp(score, 0, 100),
    level,
    factors: Object.values(observations).filter((item) => item?.score !== null && item?.score !== undefined).length,
    coverage: Number(factors.toFixed(2)),
  };
}

function renderRoutes(routeOptions, mode) {
  appState.routeResults = routeOptions;
  routeOptions.forEach(applyCommunityReportRisk);
  const recommendation = generateRecommendation(routeOptions, mode);
  appState.selectedRouteId = recommendation.routeId || routeOptions[0]?.id || null;

  const cardsContainer = document.getElementById('route-cards');
  cardsContainer.innerHTML = '';

  clearMapLayers();

  routeOptions.forEach((route, index) => {
    const card = document.createElement('article');
    const isRecommended = route.id === recommendation.routeId;
    card.className = `route-card ${route.id === appState.selectedRouteId ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}`;
    card.style.setProperty('--route-index', index);
    card.dataset.routeId = route.id;
    card.addEventListener('click', () => selectRoute(route.id));

    const riskLabel = (route.riskFactorCount ?? 4) < 3 ? 'Limited data' : route.riskLevel === 'green' ? 'Lower risk' : route.riskLevel === 'yellow' ? 'Moderate risk' : route.riskLevel === 'orange' ? 'Higher risk' : 'High risk';
    const exposureIndex = route.exposureIndex ?? Number(((route.aqi ?? route.pollutionScore ?? 0) * route.durationMinutes / 60).toFixed(1));
    const carbonKg = route.carbonKg ?? Number((route.distanceKm * 0.251).toFixed(2));

    card.innerHTML = `
      <div class="route-card-header">
        <h4>${route.name}</h4>
        <div class="route-badges">
          ${isRecommended ? '<span class="route-pill recommended-pill">Recommended</span>' : ''}
          ${route.category ? `<span class="route-pill">${route.category}</span>` : ''}
          <span class="route-pill risk-pill ${(route.riskFactorCount ?? 4) < 3 ? 'limited' : route.riskLevel}">${riskLabel}</span>
        </div>
      </div>
      <div class="route-meta">
        <div><span>Distance</span><strong>${route.distanceKm.toFixed(1)} km</strong></div>
        <div><span>Time</span><strong>${formatMinutes(route.durationMinutes)}</strong></div>
        <div title="Relative indicator: AQI multiplied by travel time, not a medical dose"><span>Exposure index</span><strong>${exposureIndex} AQI·h</strong></div>
        <div title="Generic passenger vehicle estimate; actual emissions depend on vehicle and occupancy"><span>CO₂ estimate</span><strong>${carbonKg} kg</strong></div>
      </div>
      <div class="route-tags">
        <span class="tag">Risk ${route.riskScore}</span>
        <span class="tag">AQI ${route.pollution}</span>
        <span class="tag">Traffic ${route.traffic}</span>
        <span class="tag">Rain near arrival ${route.arrivalRain === null || route.arrivalRain === undefined ? 'N/A' : `${route.arrivalRain} mm`}</span>
        <span class="tag">Flood ${route.flood}</span>
        <span class="tag">Nearby reports ${route.communityHazards || 0}</span>
        <span class="tag">Risk inputs ${route.riskFactorCount ?? 4}/4</span>
      </div>
      <button type="button" class="secondary">Select Route</button>
    `;

    cardsContainer.appendChild(card);

    const routeColor = route.id === appState.selectedRouteId ? '#0d5c45' : getRouteColor(index);
    const polyline = L.geoJSON(route.geometry, {
      style: {
        color: routeColor,
        weight: route.id === appState.selectedRouteId ? 7 : 5,
        opacity: 0.9,
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => selectRoute(route.id));
        layer.bindPopup(`<strong>${route.name}</strong><br>${route.distanceKm.toFixed(1)} km · ${formatMinutes(route.durationMinutes)}<br>Risk score: ${route.riskScore}`);
      }
    }).addTo(appState.map);

    route.lineLayer = polyline;
    appState.routeLayers.push(polyline);

    const startMarker = L.marker([route.start.lat, route.start.lon]).addTo(appState.map);
    const endMarker = L.marker([route.destination.lat, route.destination.lon]).addTo(appState.map);
    startMarker.bindPopup(`Start: ${route.start.displayName || route.start.query}`);
    endMarker.bindPopup(`Destination: ${route.destination.displayName || route.destination.query}`);
    route.startMarker = startMarker;
    route.endMarker = endMarker;
  });

  if (routeOptions.length) {
    const bounds = L.latLngBounds(routeOptions.flatMap((route) => [
      [route.start.lat, route.start.lon],
      [route.destination.lat, route.destination.lon],
    ]));
    appState.map.fitBounds(bounds.pad(0.25));
  }

  document.getElementById('route-summary').textContent = `${mode} · ${routeOptions.length} routes`;
  selectRoute(appState.selectedRouteId);
  refreshLayerVisibility();
}

function applyCommunityReportRisk(route) {
  const nearby = getRouteCommunityHazards(route);
  route.communityHazards = nearby.length;
  if (!route.riskObservations && nearby.length) {
    route.riskObservations = {
      flood: { score: route.riskScore, source: 'Demo risk model', verified: false },
      pollution: { score: Math.max(0, (route.pollutionScore || 0) - 30), source: 'Demo estimate', verified: false },
      traffic: { score: route.trafficScore || route.durationMinutes, source: 'Demo traffic estimate', verified: false },
      weather: { score: (route.arrivalRain || 0) * 5, source: 'Demo rain estimate', verified: false },
    };
  }
  if (!route.riskObservations) return;
  const floodObservation = route.riskObservations.flood;
  if (nearby.length) {
    floodObservation.score = Math.min(95, 65 + nearby.length * 10);
    floodObservation.source = 'Nearby unverified community reports';
    floodObservation.label = `${nearby.length} unverified report(s) within 1.5 km`;
  } else if (!appState.demoMode) {
    floodObservation.score = null;
    floodObservation.source = 'Flood provider unavailable';
    floodObservation.label = 'Flood history unavailable';
  }
  const assessment = calculateRouteRiskScore(route.riskObservations);
  route.riskScore = Number(assessment.score.toFixed(0));
  route.riskLevel = assessment.level;
  route.riskColor = dangerStyles[assessment.level];
  route.riskCoverage = assessment.coverage;
  route.riskFactorCount = assessment.factors;
  route.flood = nearby.length ? `${nearby.length} nearby unverified report(s)` : appState.demoMode ? 'Simulated only' : 'Flood history unavailable';
}

function selectRoute(routeId) {
  if (!routeId) return;

  appState.selectedRouteId = routeId;
  appState.routeResults.forEach((route) => {
    route.selected = route.id === routeId;
    if (route.lineLayer) {
      const selected = route.id === routeId;
      route.lineLayer.setStyle({
        color: selected ? '#0d5c45' : getRouteColor(appState.routeResults.indexOf(route)),
        weight: selected ? 7 : 5,
      });
      if (selected) route.lineLayer.bringToFront();
    }
  });

  const selectedRoute = appState.routeResults.find((route) => route.id === routeId);
  if (!selectedRoute) return;

  document.querySelectorAll('.route-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.routeId === routeId);
  });

  updateEnvironmentalDashboard(selectedRoute);
  document.querySelectorAll('.dashboard-card').forEach((card) => {
    card.classList.remove('data-refresh');
    void card.offsetWidth;
    card.classList.add('data-refresh');
  });
}

function updateEnvironmentalDashboard(route) {
  const aqiValue = route.aqi ?? Number.parseInt(String(route.pollution).match(/\d+/)?.[0] || getAQIFromRisk(route.riskScore), 10);
  const weatherSample = {
    temp: 29,
    humidity: 68,
    wind: 12,
    rain: route.arrivalRain ?? 4,
  };
  Object.assign(weatherSample, route.weatherStats || {});

  document.getElementById('aqi-value').textContent = aqiValue || '—';
  document.getElementById('pm25-value').textContent = route.pollution.includes('AQI') ? `${Math.round(route.riskScore * 0.7)} µg/m³` : '—';
  document.getElementById('pm10-value').textContent = route.pollution.includes('AQI') ? `${Math.round(route.riskScore * 1.1)} µg/m³` : '—';
  document.getElementById('aqi-meta').textContent = route.source || 'Estimated AQI from available environmental data';
  document.getElementById('pm25-value').textContent = route.pm25 ?? 'N/A';
  document.getElementById('pm10-value').textContent = route.pm10 ?? 'N/A';

  document.getElementById('temp-value').textContent = `${weatherSample.temp}°C`;
  document.getElementById('humidity-value').textContent = `${weatherSample.humidity}%`;
  document.getElementById('wind-value').textContent = `${weatherSample.wind} km/h`;
  document.getElementById('rain-value').textContent = route.arrivalRain === null || route.arrivalRain === undefined ? 'N/A' : `${route.arrivalRain} mm`;
  document.getElementById('weather-meta').textContent = route.arrivalForecastSource || 'Arrival-time forecast unavailable.';

  document.getElementById('flood-status').textContent = route.communityHazards ? `${route.communityHazards} nearby report(s)` : 'Unknown';
  document.getElementById('hazard-meta').textContent = route.note || 'Live flood alerts are not configured. Flood risk cannot currently be verified.';
}

function refreshLayerVisibility() {
  const map = appState.map;
  if (!map) return;

  if (appState.layerToggles.airQuality) {
    showAirQualityMarkers();
  } else {
    clearLayerByKey('airQuality');
  }

  if (appState.layerToggles.rainfall) {
    showRainfallMarkers();
  } else {
    clearLayerByKey('rainfall');
  }

  if (appState.layerToggles.flood) {
    showFloodMarkers();
  } else {
    clearLayerByKey('flood');
  }

  if (appState.layerToggles.community) {
    showCommunityMarkers();
  } else {
    clearLayerByKey('community');
  }
}

function clearLayerByKey(key) {
  if (!appState.map) return;
  Object.values(appState.map._layers || {}).forEach((layer) => {
    if (layer?.options?.raahatLayerKey === key) {
      appState.map.removeLayer(layer);
    }
  });
}

function getSelectedRoute() {
  return appState.routeResults.find((route) => route.id === appState.selectedRouteId) || appState.routeResults[0] || null;
}

function showAirQualityMarkers() {
  const route = getSelectedRoute();
  if (!route) return;
  const aqi = route.aqi ?? Number.parseInt(String(route.pollution).match(/\d+/)?.[0] || '0', 10);
  if (!aqi) return;
  [route.start, route.destination].forEach((point) => {
    const coords = [point.lat, point.lon];
    const circle = L.circleMarker(coords, {
      radius: 10,
      color: getAqiColor(aqi),
      fillColor: getAqiColor(aqi),
      fillOpacity: 0.7,
      weight: 2,
      raahatLayerKey: 'airQuality',
    }).addTo(appState.map);

    circle.bindPopup(`AQI ${aqi} estimated from available start/end air-quality data; it is not a road-side measurement.`);
  });
}

function showRainfallMarkers() {
  const route = getSelectedRoute();
  if (!route) return;

  if (route.arrivalRain === null || route.arrivalRain === undefined) return;
  const marker = L.circleMarker([route.destination.lat, route.destination.lon], {
      radius: 12,
      color: '#4f9ed9',
      fillColor: '#94d7ff',
      fillOpacity: 0.7,
      weight: 1,
      raahatLayerKey: 'rainfall',
  }).addTo(appState.map);
  marker.bindPopup(`${route.arrivalRain} mm estimated rain near arrival time at destination. Forecast only; not a flood warning.`);
}

function showFloodMarkers() {
  appState.reportItems
    .filter((report) => report.coordsVerified && Number.isFinite(report.lat) && Number.isFinite(report.lon)
      && ['waterlogging', 'flooded-road'].includes(report.category))
    .forEach((report) => {
    const marker = L.circleMarker([report.lat, report.lon], {
      radius: 12,
      color: '#d84a3d',
      fillColor: '#d84a3d',
      fillOpacity: 0.65,
      weight: 2,
      raahatLayerKey: 'flood',
    }).addTo(appState.map);

    marker.bindPopup(`<strong>${report.category}</strong><br>${report.description}<br><small>Unverified community report; no flood-history provider is connected.</small>`);
  });
}

function showCommunityMarkers() {
  const reports = appState.reportItems;
  if (!reports.length) return;

  reports.forEach((report) => {
    if (!report.coordsVerified || !Number.isFinite(report.lat) || !Number.isFinite(report.lon)) return;
    const marker = L.circleMarker([report.lat, report.lon], {
      radius: 9,
      color: '#ffb347',
      fillColor: '#ffb347',
      fillOpacity: 0.8,
      weight: 1,
      raahatLayerKey: 'community',
    }).addTo(appState.map);

    marker.bindPopup(`<strong>${report.category}</strong><br>${report.description}<br><small>Unverified community report</small>`);
  });
}

function clearMapLayers() {
  if (!appState.map) return;

  appState.routeLayers.forEach((layer) => {
    appState.map.removeLayer(layer);
  });
  appState.routeLayers = [];

  Object.values(appState.map._layers || {}).forEach((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.GeoJSON) {
      if (layer.options && layer.options.raahatLayerKey) {
        appState.map.removeLayer(layer);
      }
    }
  });
}

function generateRecommendation(routes, chosenMode) {
  const valid = routes.filter((route) => !route.verifiedClosure);
  if (!valid.length) {
    return {
      routeId: null,
      title: 'No suitable route recommendation',
      summary: 'Verified closures or serious hazards prevent a suitable route recommendation in the current conditions.',
      scoreLabel: 'Closed',
      scoreClass: 'red',
    };
  }

  const preferred = [...valid].sort((a, b) => {
    if (chosenMode === 'pollution') return (a.exposureIndex ?? a.pollutionScore ?? 999) - (b.exposureIndex ?? b.pollutionScore ?? 999);
    if (chosenMode === 'traffic') return (a.trafficScore ?? a.durationMinutes) - (b.trafficScore ?? b.durationMinutes);
    if (chosenMode === 'balanced') {
      const ranges = ['riskScore', 'exposureIndex', 'carbonKg', 'durationMinutes'].map((key) => {
        const values = valid.map((route) => Number(route[key] ?? 0));
        return { min: Math.min(...values), max: Math.max(...values) };
      });
      const balancedScore = (route) => ['riskScore', 'exposureIndex', 'carbonKg', 'durationMinutes'].reduce((sum, key, index) => {
        const value = Number(route[key] ?? 0);
        const range = ranges[index];
        return sum + (range.max === range.min ? 0 : (value - range.min) / (range.max - range.min));
      }, 0);
      return balancedScore(a) - balancedScore(b);
    }
    return a.riskScore - b.riskScore;
  })[0];

  const routeDistance = preferred.distanceKm.toFixed(1);
  const routeTime = formatMinutes(preferred.durationMinutes);
  const modeLabel = chosenMode === 'pollution' ? 'lower exposure' : chosenMode === 'traffic' ? (appState.demoMode ? 'lower sampled traffic' : 'shorter estimated travel time (live traffic data unavailable)') : chosenMode === 'balanced' ? 'balanced time, risk, exposure, and emissions' : 'safest';
  const explanation = `${preferred.name} is recommended for the ${modeLabel} preference. It is approximately ${routeDistance} km and about ${routeTime}. ${preferred.explanation}`;

  return {
    routeId: preferred.id,
    title: preferred.name,
    summary: explanation,
    scoreLabel: `${preferred.riskScore} risk`,
    scoreClass: preferred.riskLevel,
  };
}

function renderRecommendation(recommendation) {
  const panel = document.getElementById('recommendation-panel');
  panel.classList.remove('empty');
  panel.innerHTML = `
    <div class="recommendation-head">
      <strong>${recommendation.title}</strong>
      <span class="recommendation-score ${recommendation.scoreClass}">${recommendation.scoreLabel}</span>
    </div>
    <div>${recommendation.summary}</div>
  `;
  panel.classList.remove('recommendation-update');
  void panel.offsetWidth;
  panel.classList.add('recommendation-update');
}

async function fetchEnvironmentForPoint(lat, lon) {
  if (appState.demoMode) {
    return {
      airQuality: {
        usAqi: 52,
        pm10: 42,
        pm25: 24,
        label: 'Moderate',
        source: 'Demo AQI estimate',
        timestamp: new Date().toISOString(),
      },
      weather: {
        temperature: 29,
        humidity: 68,
        windSpeed: 12,
        precipitation: 4,
        source: 'Demo forecast estimate',
        timestamp: new Date().toISOString(),
      },
      flood: {
        message: 'Live flood alerts are not configured. Flood risk cannot currently be verified.',
        source: 'Demo placeholder',
        status: 'unknown',
      },
    };
  }

  try {
    const [air, weather] = await Promise.all([
      fetchAirQuality(lat, lon),
      fetchWeather(lat, lon),
    ]);

    return { airQuality: air, weather: weather, flood: { message: 'Live flood alerts are not configured. Flood risk cannot currently be verified.', source: 'Not configured', status: 'unknown' } };
  } catch (error) {
    console.warn('External environment call failed, falling back to demo.', error);
    return {
      airQuality: { usAqi: 52, pm10: 42, pm25: 24, label: 'Moderate', source: 'Demo fallback', timestamp: new Date().toISOString() },
      weather: { temperature: 29, humidity: 68, windSpeed: 12, precipitation: 4, source: 'Demo fallback', timestamp: new Date().toISOString() },
      flood: { message: 'Live flood alerts are not configured. Flood risk cannot currently be verified.', source: 'Demo fallback', status: 'unknown' },
    };
  }
}

async function fetchAirQuality(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('AQI provider failed.');
  }
  const data = await response.json();
  const current = data.current || {};
  return {
    usAqi: current.us_aqi ?? null,
    pm10: current.pm10 ?? null,
    pm25: current.pm2_5 ?? null,
    label: getAqiCategory(current.us_aqi ?? 0),
    source: 'Open-Meteo Air Quality API',
    timestamp: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
  };
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&hourly=precipitation,precipitation_probability&forecast_hours=48&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Weather provider failed.');
  }
  const data = await response.json();
  const current = data.current || {};
  return {
    temperature: current.temperature_2m ?? null,
    humidity: current.relative_humidity_2m ?? null,
    windSpeed: current.wind_speed_10m ?? null,
    precipitation: current.precipitation ?? null,
    currentTime: current.time ?? null,
    hourly: data.hourly || null,
    source: 'Open-Meteo Forecast API',
    timestamp: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
  };
}

function getArrivalWeather(environment, durationMinutes) {
  const weather = environment?.weather;
  const hourly = weather?.hourly;
  if (!hourly?.time?.length || !weather.currentTime) return null;

  const departureMs = Date.parse(weather.currentTime);
  if (!Number.isFinite(departureMs)) return null;
  const arrivalMs = departureMs + Math.max(0, durationMinutes) * 60_000;
  let closestIndex = -1;
  let closestDistance = Infinity;

  hourly.time.forEach((time, index) => {
    const forecastMs = Date.parse(time);
    const distance = Math.abs(forecastMs - arrivalMs);
    if (Number.isFinite(forecastMs) && distance < closestDistance) {
      closestIndex = index;
      closestDistance = distance;
    }
  });

  if (closestIndex < 0) return null;
  return {
    precipitation: hourly.precipitation?.[closestIndex] ?? null,
    precipitationProbability: hourly.precipitation_probability?.[closestIndex] ?? null,
    forecastTime: hourly.time[closestIndex],
  };
}

function getRouteCommunityHazards(route) {
  const coordinates = route.geometry?.coordinates || [];
  if (coordinates.length < 2) return [];
  return appState.reportItems.filter((report) => {
    if (!report.coordsVerified || !Number.isFinite(report.lat) || !Number.isFinite(report.lon)) return false;
    const distanceKm = distanceToRouteKm(report.lat, report.lon, coordinates);
    return distanceKm <= 1.5;
  });
}

function distanceToRouteKm(pointLat, pointLon, coordinates) {
  let minimum = Infinity;
  const latitudeScale = 111.32;
  const longitudeScale = 111.32 * Math.cos(pointLat * Math.PI / 180);
  for (let index = 0; index < coordinates.length - 1; index += 1) {
    const [lonA, latA] = coordinates[index];
    const [lonB, latB] = coordinates[index + 1];
    const ax = (lonA - pointLon) * longitudeScale;
    const ay = (latA - pointLat) * latitudeScale;
    const bx = (lonB - pointLon) * longitudeScale;
    const by = (latB - pointLat) * latitudeScale;
    const dx = bx - ax;
    const dy = by - ay;
    const denominator = dx * dx + dy * dy;
    const t = denominator ? clamp(-(ax * dx + ay * dy) / denominator, 0, 1) : 0;
    minimum = Math.min(minimum, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return minimum;
}

function getAverageAqiFromEnvironment(startEnv, endEnv) {
  const left = startEnv?.airQuality?.usAqi ?? 52;
  const right = endEnv?.airQuality?.usAqi ?? 58;
  return Math.round((left + right) / 2);
}

function getAverageMetric(environmentData, metric) {
  const first = environmentData[0]?.airQuality?.[metric];
  const second = environmentData[1]?.airQuality?.[metric];
  const available = [first, second].filter((value) => Number.isFinite(value));
  return available.length ? Number((available.reduce((sum, value) => sum + value, 0) / available.length).toFixed(1)) : null;
}

function getAverageWeatherFromEnvironment(startEnv, endEnv) {
  const temp = ((startEnv?.weather?.temperature ?? 28) + (endEnv?.weather?.temperature ?? 31)) / 2;
  const humidity = ((startEnv?.weather?.humidity ?? 60) + (endEnv?.weather?.humidity ?? 72)) / 2;
  const rain = ((startEnv?.weather?.precipitation ?? 5) + (endEnv?.weather?.precipitation ?? 7)) / 2;
  const wind = ((startEnv?.weather?.windSpeed ?? 10) + (endEnv?.weather?.windSpeed ?? 14)) / 2;

  return {
    temp: Number(temp.toFixed(1)),
    humidity: Number(humidity.toFixed(0)),
    rain: Number(rain.toFixed(1)),
    wind: Number(wind.toFixed(1)),
  };
}

function getAqiCategory(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for sensitive groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very unhealthy';
  return 'Hazardous';
}

function getAqiColor(aqi) {
  if (aqi <= 50) return '#1ea36f';
  if (aqi <= 100) return '#f3b33d';
  if (aqi <= 150) return '#f28c28';
  return '#d84a3d';
}

function getRouteColor(index) {
  return ['#0d5c45', '#2a7d67', '#4ca77d'][index % 3];
}

function formatMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getAQIFromRisk(riskScore) {
  if (riskScore >= 70) return '170';
  if (riskScore >= 50) return '120';
  if (riskScore >= 35) return '85';
  return '42';
}

function getCurrentLocationForStart() {
  if (!navigator.geolocation) {
    setStatus('Geolocation is not supported in this browser.', 'error');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      appState.currentLocation = { lat, lon };
      document.getElementById('start-input').value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      setStatus('Current location captured successfully. You can now enter a destination and search.', 'success');
      const marker = L.marker([lat, lon]).addTo(appState.map);
      marker.bindPopup('Your current location');
      appState.map.setView([lat, lon], 12);
    },
    () => {
      setStatus('Location permission was denied. Please enter a manual starting point.', 'error');
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );
}

async function submitHazardReport(event) {
  event.preventDefault();

  const locationInput = document.getElementById('hazard-location');
  const categoryInput = document.getElementById('hazard-category');
  const descriptionInput = document.getElementById('hazard-description');

  if (!locationInput.value.trim() || !descriptionInput.value.trim()) {
    setStatus('Please add both a location and a description for the hazard report.', 'error');
    return;
  }

  let coordinates = null;
  try {
    coordinates = await geocodeLocation(locationInput.value.trim());
  } catch (error) {
    console.warn('Could not geocode community report location.', error);
  }

  const report = {
    id: `report-${Date.now()}`,
    location: locationInput.value.trim(),
    category: categoryInput.value,
    description: descriptionInput.value.trim(),
    submittedAt: new Date().toISOString(),
    verificationStatus: 'unverified',
    lat: coordinates?.lat ?? null,
    lon: coordinates?.lon ?? null,
    coordsVerified: Boolean(coordinates),
  };

  appState.reportItems.unshift(report);
  saveReports();
  renderReportList();
  locationInput.value = '';
  descriptionInput.value = '';
  if (appState.routeResults.length) {
    renderRoutes(appState.routeResults, appState.recommendationMode);
    renderRecommendation(generateRecommendation(appState.routeResults, appState.recommendationMode));
  }
  setStatus(
    coordinates
      ? 'Report saved locally. Its geocoded location is compared with routes; the report remains unverified.'
      : 'Report saved locally without a map pin because its location could not be resolved.',
    coordinates ? 'success' : 'info'
  );
}

function renderReportList() {
  const container = document.getElementById('report-list');
  if (!appState.reportItems.length) {
    container.innerHTML = '<div class="report-item"><strong>No community reports yet.</strong><br>Reports are stored locally in the browser only.</div>';
    return;
  }

  container.innerHTML = appState.reportItems.slice(0, 5).map((report) => `
    <div class="report-item">
      <strong>${report.location}</strong><br>
      <span>${report.category}</span><br>
      ${report.description}<br>
      <small>Submitted ${new Date(report.submittedAt).toLocaleString()} · ${report.verificationStatus}</small>
    </div>
  `).join('');
}

function saveReports() {
  localStorage.setItem('raahat-reports', JSON.stringify(appState.reportItems));
}

function loadSavedReports() {
  try {
    const raw = localStorage.getItem('raahat-reports');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function loadSampleDashboard() {
  document.getElementById('aqi-value').textContent = '42';
  document.getElementById('pm25-value').textContent = '24 µg/m³';
  document.getElementById('pm10-value').textContent = '42 µg/m³';
  document.getElementById('aqi-meta').textContent = 'Demo AQI estimate — not a live measurement.';
  document.getElementById('temp-value').textContent = '29°C';
  document.getElementById('humidity-value').textContent = '68%';
  document.getElementById('wind-value').textContent = '12 km/h';
  document.getElementById('rain-value').textContent = '4 mm';
  document.getElementById('weather-meta').textContent = 'Demo forecast estimate — not a live observation.';
  document.getElementById('flood-status').textContent = 'Low';
  document.getElementById('hazard-meta').textContent = 'Live flood alerts are not configured. Flood risk cannot currently be verified.';
}

function updateApiStatus() {
  const lines = [
    'Nominatim geocoding: public and browser-based when online',
    'OSRM routing: public route provider when online',
    'Open-Meteo AQI + forecast: public APIs when online',
    'Flood alerts: not configured in this frontend build',
    'Traffic provider: not configured in this frontend build',
    'Community reports: saved locally in browser storage',
  ];
  document.getElementById('api-status').innerHTML = `<strong>Provider status</strong><br>${lines.join('<br>')}`;
}

initApp();
