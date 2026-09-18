const {
  getWeatherData,
  getRoadStatus
} = require('../utils/weatherRoadStatus');

const weatherController = {
  async getWeatherByCoordinates(
    req,
    res
  ) {
    try {
      const {
        lat,
        lon
      } = req.query;

      if (
        lat === undefined ||
        lon === undefined
      ) {
        return res.status(400).json({
          status: 'error',
          message:
            'Latitude and longitude are required.'
        });
      }

      const latitude =
        Number(lat);

      const longitude =
        Number(lon);

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        )
      ) {
        return res.status(400).json({
          status: 'error',
          message:
            'Invalid latitude or longitude.'
        });
      }

      const weather =
        await getWeatherData(
          latitude,
          longitude
        );

      const roadStatus =
        getRoadStatus(
          weather.description
        );

      return res.status(200).json({
        status: 'success',

        data: {
          weather,
          roadStatus
        }
      });
    } catch (error) {
      console.error(
        'Weather controller error:',
        error
      );

      return res.status(503).json({
        status: 'error',
        message:
          error.message ||
          'Unable to retrieve live weather data.'
      });
    }
  }
};

module.exports =
  weatherController;