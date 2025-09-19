
import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";

// Weathercode → Text + Emoji mapping
const getWeatherCondition = (code) => {
  const conditions = {
    0: "☀ Clear sky",
    1: "🌤 Mainly clear",
    2: "⛅ Partly cloudy",
    3: "☁ Overcast",
    45: "🌫 Fog",
    48: "🌫 Rime fog",
    51: "🌦 Light drizzle",
    53: "🌧 Moderate drizzle",
    55: "🌧 Heavy drizzle",
    61: "🌦 Light rain",
    63: "🌧 Moderate rain",
    65: "🌧 Heavy rain",
    71: "🌨 Light snow",
    73: "❄ Moderate snow",
    75: "❄ Heavy snow",
    80: "🌦 Rain showers (light)",
    81: "🌧 Rain showers (moderate)",
    82: "🌧 Rain showers (heavy)",
    95: "⛈ Thunderstorm",
    96: "⛈ Thunderstorm with hail",
    99: "⛈ Thunderstorm + hail (heavy)",
  };
  return conditions[code] || "🌍 Unknown";
};

function App() {
  const [city, setCity] = useState("Hyderabad"); // Default city
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [error, setError] = useState("");
  const [dateTime, setDateTime] = useState(new Date());

  // Update live time
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather data
  const fetchWeather = async (cityName = city) => {
    try {
      setError("");
      setWeather(null);
      setHourly([]);
      setDaily([]);

      // Get coordinates (fix for small towns)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found");
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Get current + hourly + daily weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );
      const weatherData = await weatherRes.json();

      // Current weather
      setWeather({
        city: name,
        country: country,
        temp: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
        condition: weatherData.current_weather.weathercode,
      });

      // Hourly forecast (next 5 hours)
      setHourly(
        weatherData.hourly.time.slice(0, 5).map((t, i) => ({
          time: t,
          temp: weatherData.hourly.temperature_2m[i],
          condition: weatherData.hourly.weathercode[i],
        }))
      );

      // Daily forecast (next 5 days)
      setDaily(
        weatherData.daily.time.slice(0, 5).map((d, i) => ({
          date: d,
          min: weatherData.daily.temperature_2m_min[i],
          max: weatherData.daily.temperature_2m_max[i],
          condition: weatherData.daily.weathercode[i],
        }))
      );
    } catch (err) {
      setError("Error fetching weather");
    }
  };

  // Load default city
  useEffect(() => {
    fetchWeather("Hyderabad");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 to-black text-white flex flex-col items-center p-6">
      <div className="w-full max-w-6xl bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-white">
        
        {/* Date & Time */}
        <p className="text-center text-base sm:text-lg mb-4 font-medium">
          {dateTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          |{" "}
          {dateTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 flex items-center justify-center gap-2">
          ⛅ Weather Dashboard
        </h1>

        {/* Search */}
        <div className="flex gap-3 mb-8 justify-center">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city..."
            className="flex-1 max-w-md p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-gray-200 focus:outline-none"
          />
          <button
            onClick={() => fetchWeather(city)}
            className="px-5 py-3 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {/* Error */}
        {error && <p className="text-red-300 text-center">{error}</p>}

        {/* Current Weather */}
        {weather && (
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              {weather.city}, {weather.country}
            </h2>
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mt-4">
              {weather.temp}°C
            </p>
            <p className="mt-2 text-sm sm:text-base md:text-lg">
              {getWeatherCondition(weather.condition)}
            </p>
            <p className="text-xs sm:text-sm mt-1 opacity-80">
              💨 Wind: {weather.wind} km/h
            </p>
          </div>
        )}

        {/* Forecasts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Hourly Forecast */}
          {hourly.length > 0 && (
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">
                🌙 Next Hours
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {hourly.map((h, i) => (
                  <div
                    key={i}
                    className="bg-white/20 p-4 rounded-xl text-center backdrop-blur-sm"
                  >
                    <p className="text-xs sm:text-sm">
                      {new Date(h.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-base sm:text-lg font-bold">{h.temp}°C</p>
                    <p className="text-xs sm:text-sm">{getWeatherCondition(h.condition)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Forecast */}
          {daily.length > 0 && (
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">
                📅 Next Days
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {daily.map((d, i) => (
                  <div
                    key={i}
                    className="bg-white/20 p-4 rounded-xl text-center backdrop-blur-sm"
                  >
                    <p className="text-xs sm:text-sm font-medium">
                      {new Date(d.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <p className="text-base sm:text-lg font-bold">
                      {d.min}° / {d.max}°
                    </p>
                    <p className="text-xs sm:text-sm">{getWeatherCondition(d.condition)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;