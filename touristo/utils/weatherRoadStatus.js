const axios = require('axios');

/**
 * Get weather data for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {object} Weather data
 */
async function getWeatherData(lat, lon) {
  if (!process.env.OPENWEATHER_API_KEY) {
    console.warn('OpenWeatherMap API key not configured. Returning mock data.');
    // Return mock data when API key is not configured
    return {
      temperature: 25,
      description: 'Partly cloudy',
      icon: '02d',
      humidity: 65,
      windSpeed: 10,
      feelsLike: 27,
      forecast: [
        { day: 'Mon', condition: 'sunny', high: 28, low: 18, icon: '01d' },
        { day: 'Tue', condition: 'cloudy', high: 26, low: 17, icon: '03d' },
        { day: 'Wed', condition: 'rainy', high: 24, low: 16, icon: '10d' },
        { day: 'Thu', condition: 'partly-cloudy', high: 27, low: 19, icon: '02d' },
        { day: 'Fri', condition: 'sunny', high: 29, low: 20, icon: '01d' }
      ]
    };
  }

  try {
    // Fetch current weather
    const currentWeatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    
    // Fetch 5-day forecast
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );
    
    // Process forecast data to get daily forecasts
    const dailyForecasts = processForecastData(forecastResponse.data.list);
    
    return {
      temperature: Math.round(currentWeatherResponse.data.main.temp),
      description: currentWeatherResponse.data.weather[0].description,
      icon: currentWeatherResponse.data.weather[0].icon,
      humidity: currentWeatherResponse.data.main.humidity,
      windSpeed: currentWeatherResponse.data.wind.speed,
      feelsLike: Math.round(currentWeatherResponse.data.main.feels_like),
      forecast: dailyForecasts
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return mock data when API call fails
    return {
      temperature: 25,
      description: 'Weather service temporarily unavailable',
      icon: '01d',
      humidity: 65,
      windSpeed: 10,
      feelsLike: 27,
      forecast: [
        { day: 'Mon', condition: 'sunny', high: 28, low: 18, icon: '01d' },
        { day: 'Tue', condition: 'cloudy', high: 26, low: 17, icon: '03d' },
        { day: 'Wed', condition: 'rainy', high: 24, low: 16, icon: '10d' },
        { day: 'Thu', condition: 'partly-cloudy', high: 27, low: 19, icon: '02d' },
        { day: 'Fri', condition: 'sunny', high: 29, low: 20, icon: '01d' }
      ]
    };
  }
}

/**
 * Process the 5-day forecast data to get daily summaries
 * @param {Array} forecastList - List of forecast data points
 * @returns {Array} Daily forecasts
 */
function processForecastData(forecastList) {
  // Group forecasts by date
  const groupedByDate = {};
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0]; // Get YYYY-MM-DD
    
    if (!groupedByDate[date]) {
      groupedByDate[date] = {
        temps: [],
        conditions: [],
        icons: [],
        date: date
      };
    }
    
    groupedByDate[date].temps.push(item.main.temp_max, item.main.temp_min);
    groupedByDate[date].conditions.push(item.weather[0].main);
    groupedByDate[date].icons.push(item.weather[0].icon);
  });
  
  // Convert to array and take only first 5 days
  const dailyData = Object.values(groupedByDate).slice(0, 5);
  
  // Format the data
  return dailyData.map(dayData => {
    const date = new Date(dayData.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = dayNames[date.getDay()];
    
    // Find max and min temperatures
    const temps = dayData.temps;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    
    // Get the most common condition
    const conditionCounts = {};
    dayData.conditions.forEach(condition => {
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });
    
    let dominantCondition = dayData.conditions[0];
    let maxCount = 0;
    for (const [condition, count] of Object.entries(conditionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantCondition = condition;
      }
    }
    
    // Use the first icon for simplicity
    const icon = dayData.icons[0];
    
    return {
      day,
      condition: dominantCondition.toLowerCase(),
      high: Math.round(maxTemp),
      low: Math.round(minTemp),
      icon
    };
  });
}

/**
 * Determine road status based on weather conditions
 * @param {string} weatherDescription - Weather description
 * @returns {string} Road status
 */
function getRoadStatus(weatherDescription) {
  if (!weatherDescription) {
    return 'Unknown';
  }
  
  const desc = weatherDescription.toLowerCase();
  
  if (desc.includes('rain') || desc.includes('storm') || desc.includes('thunder')) {
    return 'Caution';
  } else if (desc.includes('snow') || desc.includes('ice') || desc.includes('sleet')) {
    return 'Caution';
  } else if (desc.includes('fog') || desc.includes('mist')) {
    return 'Caution';
  } else {
    return 'Clear';
  }
}

module.exports = {
  getWeatherData,
  getRoadStatus
};