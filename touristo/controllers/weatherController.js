const axios = require('axios');
const { getWeatherData, getRoadStatus } = require('../utils/weatherRoadStatus');

const weatherController = {
  // Get weather data for coordinates
  async getWeatherByCoordinates(req, res) {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({
          status: 'fail',
          message: 'Latitude and longitude are required',
        });
      }
      
      // Validate that lat and lon are numbers
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      
      if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid latitude or longitude',
        });
      }
      
      // Get weather data using utility function
      const weatherData = await getWeatherData(latitude, longitude);
      
      // Determine road status based on weather
      const roadStatus = getRoadStatus(weatherData.description);
      
      res.status(200).json({
        status: 'success',
        data: {
          weather: weatherData,
          roadStatus
        },
      });
    } catch (err) {
      console.error('Error in getWeatherByCoordinates:', err);
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  },
};

module.exports = weatherController;