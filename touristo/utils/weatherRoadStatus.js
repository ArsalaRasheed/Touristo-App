const axios = require('axios');

const OPENWEATHER_BASE_URL =
  'https://api.openweathermap.org/data/2.5';

const WEATHER_TIMEOUT = 10000;

function validateCoordinates(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error(
      'Invalid destination coordinates'
    );
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      'Destination coordinates are outside valid range'
    );
  }

  return {
    latitude,
    longitude
  };
}

function getOpenWeatherError(error) {
  const status = error?.response?.status;
  const apiMessage =
    error?.response?.data?.message;

  if (status === 401) {
    return new Error(
      'OpenWeather API key is invalid or not activated.'
    );
  }

  if (status === 404) {
    return new Error(
      'OpenWeather could not find weather data for these coordinates.'
    );
  }

  if (status === 429) {
    return new Error(
      'OpenWeather API rate limit has been reached.'
    );
  }

  if (status >= 500) {
    return new Error(
      'OpenWeather weather service is temporarily unavailable.'
    );
  }

  if (apiMessage) {
    return new Error(apiMessage);
  }

  if (error.code === 'ECONNABORTED') {
    return new Error(
      'OpenWeather request timed out.'
    );
  }

  if (
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNREFUSED'
  ) {
    return new Error(
      'Server could not connect to OpenWeather.'
    );
  }

  return new Error(
    error.message ||
    'Unable to connect to OpenWeather.'
  );
}

async function requestOpenWeather(
  endpoint,
  params
) {
  if (!process.env.OPENWEATHER_API_KEY) {
    throw new Error(
      'OPENWEATHER_API_KEY is missing from server environment variables.'
    );
  }

  try {
    const response = await axios.get(
      `${OPENWEATHER_BASE_URL}/${endpoint}`,
      {
        params: {
          ...params,
          appid:
            process.env.OPENWEATHER_API_KEY,
          units: 'metric'
        },
        timeout: WEATHER_TIMEOUT
      }
    );

    if (!response.data) {
      throw new Error(
        'OpenWeather returned an empty response.'
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      'OpenWeather request failed:',
      {
        endpoint,
        status: error?.response?.status,
        response:
          error?.response?.data,
        message: error?.message
      }
    );

    throw getOpenWeatherError(error);
  }
}

async function getWeatherData(lat, lon) {
  const {
    latitude,
    longitude
  } = validateCoordinates(lat, lon);

  const [current, forecast] =
    await Promise.all([
      requestOpenWeather(
        'weather',
        {
          lat: latitude,
          lon: longitude
        }
      ),

      requestOpenWeather(
        'forecast',
        {
          lat: latitude,
          lon: longitude
        }
      )
    ]);

  if (
    !current.main ||
    typeof current.main.temp !== 'number'
  ) {
    throw new Error(
      'OpenWeather returned invalid current temperature data.'
    );
  }

  return {
    location: {
      name: current.name || null,
      latitude,
      longitude
    },

    temperature: Math.round(
      current.main.temp
    ),

    feelsLike: Math.round(
      current.main.feels_like
    ),

    humidity:
      current.main.humidity,

    pressure:
      current.main.pressure,

    windSpeed:
      typeof current.wind?.speed === 'number'
        ? Math.round(
            current.wind.speed * 3.6
          )
        : null,

    description:
      current.weather?.[0]?.description ||
      'Unknown',

    condition:
      current.weather?.[0]?.main ||
      'Unknown',

    icon:
      current.weather?.[0]?.icon ||
      '01d',

    observedAt:
      current.dt
        ? new Date(
            current.dt * 1000
          ).toISOString()
        : new Date().toISOString(),

    timezoneOffset:
      current.timezone || 0,

    forecast:
      processForecastData(
        forecast.list || []
      )
  };
}

function processForecastData(
  forecastList
) {
  const grouped = {};

  for (const item of forecastList) {
    if (
      !item ||
      !item.dt ||
      !item.main
    ) {
      continue;
    }

    /*
     * OpenWeather provides dt_txt in the
     * location's forecast time context.
     *
     * Keep this value instead of converting
     * it through the server's timezone.
     */
    const date =
      typeof item.dt_txt === 'string'
        ? item.dt_txt.substring(0, 10)
        : new Date(
            item.dt * 1000
          ).toISOString().substring(0, 10);

    if (!grouped[date]) {
      grouped[date] = {
        date,
        temperatures: [],
        conditions: [],
        icons: []
      };
    }

    if (
      typeof item.main.temp ===
      'number'
    ) {
      grouped[
        date
      ].temperatures.push(
        item.main.temp
      );
    }

    if (
      item.weather?.[0]?.main
    ) {
      grouped[
        date
      ].conditions.push(
        item.weather[0].main
      );
    }

    if (
      item.weather?.[0]?.icon
    ) {
      grouped[
        date
      ].icons.push(
        item.weather[0].icon
      );
    }
  }

  return Object.values(grouped)
    .slice(0, 5)
    .map(day => {
      const temps =
        day.temperatures;

      const high =
        temps.length
          ? Math.round(
              Math.max(...temps)
            )
          : null;

      const low =
        temps.length
          ? Math.round(
              Math.min(...temps)
            )
          : null;

      const conditionCounts = {};

      day.conditions.forEach(
        condition => {
          conditionCounts[
            condition
          ] =
            (conditionCounts[
              condition
            ] || 0) + 1;
        }
      );

      let condition =
        day.conditions[0] ||
        'Unknown';

      let highestCount = 0;

      Object.entries(
        conditionCounts
      ).forEach(
        ([name, count]) => {
          if (
            count >
            highestCount
          ) {
            highestCount =
              count;

            condition =
              name;
          }
        }
      );

      return {
        date: day.date,
        high,
        low,
        condition:
          condition.toLowerCase(),
        icon:
          day.icons[0] ||
          '01d'
      };
    });
}

function getRoadStatus(
  weatherDescription
) {
  if (!weatherDescription) {
    return 'Unknown';
  }

  const description =
    weatherDescription.toLowerCase();

  if (
    description.includes(
      'thunder'
    ) ||
    description.includes(
      'storm'
    ) ||
    description.includes(
      'heavy rain'
    ) ||
    description.includes(
      'snow'
    ) ||
    description.includes(
      'sleet'
    ) ||
    description.includes(
      'ice'
    )
  ) {
    return 'Caution';
  }

  if (
    description.includes(
      'fog'
    ) ||
    description.includes(
      'mist'
    )
  ) {
    return 'Caution';
  }

  return 'Clear';
}

module.exports = {
  getWeatherData,
  getRoadStatus
};