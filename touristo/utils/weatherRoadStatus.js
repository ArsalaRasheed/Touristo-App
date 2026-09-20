const axios = require('axios');

/**
 * Get live weather data from OpenWeather.
 *
 * @param {number} lat
 * @param {number} lon
 * @returns {object}
 */
async function getWeatherData(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error(
      'Invalid weather coordinates.'
    );
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      'Weather coordinates are outside valid geographic ranges.'
    );
  }

  const apiKey =
    process.env.OPENWEATHER_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      'OpenWeather API key is not configured on the server.'
    );
  }

  try {
    const currentWeatherResponse =
      await axios.get(
        'https://api.openweathermap.org/data/2.5/weather',
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: apiKey,
            units: 'metric'
          },
          timeout: 10000
        }
      );

    const current =
      currentWeatherResponse.data;

    if (
      !current ||
      !current.main ||
      !current.weather ||
      !current.weather[0]
    ) {
      throw new Error(
        'OpenWeather returned an invalid current-weather response.'
      );
    }

    let dailyForecasts = [];

    try {
      const forecastResponse =
        await axios.get(
          'https://api.openweathermap.org/data/2.5/forecast',
          {
            params: {
              lat: latitude,
              lon: longitude,
              appid: apiKey,
              units: 'metric'
            },
            timeout: 10000
          }
        );

      if (
        forecastResponse.data &&
        Array.isArray(
          forecastResponse.data.list
        )
      ) {
        dailyForecasts =
          processForecastData(
            forecastResponse.data.list
          );
      }
    } catch (forecastError) {
      /*
       * Current weather is still valid even if
       * the forecast request fails.
       */
      console.error(
        'OpenWeather forecast request failed:',
        {
          status:
            forecastError.response?.status,
          message:
            forecastError.response?.data?.message ||
            forecastError.message
        }
      );
    }

    return {
      temperature: Math.round(
        current.main.temp
      ),

      description:
        current.weather[0].description,

      icon:
        current.weather[0].icon,

      humidity:
        current.main.humidity,

      windSpeed:
        current.wind?.speed ?? 0,

      feelsLike: Math.round(
        current.main.feels_like
      ),

      forecast: dailyForecasts,

      /*
       * Actual OpenWeather observation timestamp.
       * This lets the frontend know when the data
       * was actually observed by the API.
       */
      observedAt:
        current.dt
          ? new Date(
              current.dt * 1000
            ).toISOString()
          : null,

      timezoneOffset:
        current.timezone ?? 0,

      locationName:
        current.name || null
    };
  } catch (error) {
    const status =
      error.response?.status;

    const apiMessage =
      error.response?.data?.message;

    console.error(
      'OpenWeather current-weather request failed:',
      {
        status,
        message:
          apiMessage || error.message,
        latitude,
        longitude
      }
    );

    if (status === 401) {
      throw new Error(
        'OpenWeather rejected the API key. Check the OPENWEATHER_API_KEY value in Vercel.'
      );
    }

    if (status === 404) {
      throw new Error(
        'OpenWeather could not find weather data for these coordinates.'
      );
    }

    if (status === 429) {
      throw new Error(
        'OpenWeather rate limit reached. Please try again shortly.'
      );
    }

    if (status >= 500) {
      throw new Error(
        'OpenWeather service is temporarily unavailable.'
      );
    }

    if (
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    ) {
      throw new Error(
        'OpenWeather request timed out.'
      );
    }

    throw new Error(
      apiMessage ||
      error.message ||
      'Unable to retrieve live weather data.'
    );
  }
}

/**
 * Convert OpenWeather 3-hour forecast data
 * into daily high/low summaries.
 */
function processForecastData(
  forecastList
) {
  if (
    !Array.isArray(forecastList) ||
    forecastList.length === 0
  ) {
    return [];
  }

  const groupedByDate = {};

  forecastList.forEach(item => {
    if (
      !item ||
      !item.dt ||
      !item.main
    ) {
      return;
    }

    const date =
      new Date(
        item.dt * 1000
      )
        .toISOString()
        .split('T')[0];

    if (!groupedByDate[date]) {
      groupedByDate[date] = {
        temps: [],
        conditions: [],
        icons: [],
        date
      };
    }

    if (
      Number.isFinite(
        Number(item.main.temp_max)
      )
    ) {
      groupedByDate[
        date
      ].temps.push(
        Number(item.main.temp_max)
      );
    }

    if (
      Number.isFinite(
        Number(item.main.temp_min)
      )
    ) {
      groupedByDate[
        date
      ].temps.push(
        Number(item.main.temp_min)
      );
    }

    if (
      item.weather &&
      item.weather[0]
    ) {
      groupedByDate[
        date
      ].conditions.push(
        item.weather[0].main
      );

      groupedByDate[
        date
      ].icons.push(
        item.weather[0].icon
      );
    }
  });

  const dailyData =
    Object.values(
      groupedByDate
    ).slice(0, 5);

  return dailyData.map(
    dayData => {
      const date =
        new Date(
          `${dayData.date}T00:00:00`
        );

      const dayNames = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
      ];

      const temps =
        dayData.temps;

      const maxTemp =
        temps.length
          ? Math.max(...temps)
          : null;

      const minTemp =
        temps.length
          ? Math.min(...temps)
          : null;

      const conditionCounts = {};

      dayData.conditions.forEach(
        condition => {
          conditionCounts[
            condition
          ] =
            (conditionCounts[
              condition
            ] || 0) + 1;
        }
      );

      let dominantCondition =
        dayData.conditions[0] ||
        'Unknown';

      let maxCount = 0;

      for (
        const [
          condition,
          count
        ] of Object.entries(
          conditionCounts
        )
      ) {
        if (
          count > maxCount
        ) {
          maxCount = count;
          dominantCondition =
            condition;
        }
      }

      return {
        day:
          dayNames[
            date.getDay()
          ],

        condition:
          dominantCondition.toLowerCase(),

        high:
          maxTemp !== null
            ? Math.round(maxTemp)
            : null,

        low:
          minTemp !== null
            ? Math.round(minTemp)
            : null,

        icon:
          dayData.icons[0] ||
          null
      };
    }
  );
}

/**
 * Determine road status from weather.
 */
function getRoadStatus(
  weatherDescription
) {
  if (!weatherDescription) {
    return 'Unknown';
  }

  const desc =
    weatherDescription.toLowerCase();

  if (
    desc.includes('rain') ||
    desc.includes('storm') ||
    desc.includes('thunder')
  ) {
    return 'Caution';
  }

  if (
    desc.includes('snow') ||
    desc.includes('ice') ||
    desc.includes('sleet')
  ) {
    return 'Caution';
  }

  if (
    desc.includes('fog') ||
    desc.includes('mist')
  ) {
    return 'Caution';
  }

  return 'Clear';
}

module.exports = {
  getWeatherData,
  getRoadStatus
};