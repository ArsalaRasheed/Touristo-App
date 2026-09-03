const emergencyContacts = require('./emergencyContacts.json');

/**
 * Get emergency contacts for a specific location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {object} Emergency contacts for the nearest region
 */
function getEmergencyContacts(lat, lng) {
  // This is a simplified approach - in a real app, you'd use reverse geocoding
  // For now, we'll match coordinates to regions based on known coordinates
  
  // Known coordinates for major cities in Pakistan
  const regions = {
    "Islamabad": { lat: 33.6844, lng: 73.0479 },
    "Lahore": { lat: 31.5546, lng: 74.3572 },
    "Karachi": { lat: 24.8607, lng: 67.0011 },
    "Peshawar": { lat: 34.0151, lng: 71.5249 },
    "Quetta": { lat: 30.1798, lng: 66.9750 },
    "Gilgit": { lat: 35.9224, lng: 74.3134 },
    "Skardu": { lat: 35.3333, lng: 75.5667 }
  };
  
  // Find the closest region
  let closestRegion = "default";
  let minDistance = Infinity;
  
  for (const [regionName, coords] of Object.entries(regions)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = regionName;
    }
  }
  
  // Return contacts for the closest region, or default if not found
  return emergencyContacts.regions[closestRegion] || emergencyContacts.regions.default;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
  getEmergencyContacts
};