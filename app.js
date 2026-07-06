const weatherLocation = document.getElementById("weather-location");
const weatherTemp = document.getElementById("weather-temp");
const weatherCondition = document.getElementById("weather-condition");
const weatherIcon = document.getElementById("weather-icon");
const weatherPrecip = document.getElementById("weather-precip");
const weatherForm = document.getElementById("weather-form");
const weatherInput = document.getElementById("weather-input");

const weatherEmoji = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌦️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "🌨️",
  77: "🌨️",
  85: "🌨️",
  86: "🌨️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️"
};

const weatherLabel = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm"
};

function showFallback(message) {
  weatherLocation.textContent = message;
  weatherTemp.textContent = "--°F";
  weatherCondition.textContent = "Try another location";
  weatherIcon.textContent = "🌦️";
  weatherPrecip.textContent = "Precip: --%";
}

function saveLocation(location) {
  localStorage.setItem("weatherLocation", location);
}

function loadLocation() {
  return localStorage.getItem("weatherLocation") || "";
}

function fetchWeatherByCity(city) {
  weatherLocation.textContent = "Finding weather…";
  weatherCondition.textContent = "Looking up forecast…";
  weatherTemp.textContent = "--°F";
  weatherPrecip.textContent = "Precip: --%";

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
    .then((response) => response.json())
    .then((geoData) => {
      const place = geoData.results?.[0];
      if (!place) {
        showFallback("Location not found");
        return;
      }

      const placeName = `${place.name}${place.admin1 ? `, ${place.admin1}` : ""}`;
      weatherLocation.textContent = placeName;
      saveLocation(placeName);

      return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&daily=precipitation_probability_mean&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=1&timezone=auto`);
    })
    .then((response) => response.json())
    .then((data) => {
      const current = data.current;
      const code = current?.weather_code;
      const precipitation = data.daily?.precipitation_probability_mean?.[0] ?? 0;
      weatherTemp.textContent = `${Math.round(current?.temperature_2m ?? 0)}°F`;
      weatherCondition.textContent = weatherLabel[code] || "Current conditions";
      weatherIcon.textContent = weatherEmoji[code] || "🌦️";
      weatherPrecip.textContent = `Precip: ${Math.round(precipitation)}%`;
    })
    .catch(() => {
      showFallback("Weather unavailable");
    });
}

weatherForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = weatherInput.value.trim();
  if (!value) {
    showFallback("Enter a location");
    return;
  }
  fetchWeatherByCity(value);
});

const savedLocation = loadLocation();
if (savedLocation) {
  weatherInput.value = savedLocation;
  fetchWeatherByCity(savedLocation);
}
