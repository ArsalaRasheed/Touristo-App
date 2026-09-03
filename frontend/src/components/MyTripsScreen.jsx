import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import auth context

const MyTripsScreen = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itineraries, setItineraries] = useState({}); // Store itinerary details by trip ID
  const [weatherData, setWeatherData] = useState({}); // Store weather data by trip ID
  const [location, setLocation] = useState(null); // User's current location
  const [sosActive, setSosActive] = useState(false); // SOS activation state
  const [emergencyContacts, setEmergencyContacts] = useState(null); // Emergency contacts for current location

  const { user, getAuthHeader } = useAuth(); // Get user info and auth header function

  // Fetch user's current location using Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(pos);
          
          // Get emergency contacts for this location
          getEmergencyContactsForLocation(pos.lat, pos.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Use a default location if geolocation fails
          const defaultPos = { lat: 33.6844, lng: 73.0479 }; // Islamabad coordinates
          setLocation(defaultPos);
          getEmergencyContactsForLocation(defaultPos.lat, defaultPos.lng);
        }
      );
    } else {
      // Browser doesn't support geolocation
      const defaultPos = { lat: 33.6844, lng: 73.0479 }; // Islamabad coordinates
      setLocation(defaultPos);
      getEmergencyContactsForLocation(defaultPos.lat, defaultPos.lng);
    }
  }, []);

  // Function to get emergency contacts for a location
  const getEmergencyContactsForLocation = async (lat, lng) => {
    // In a real app, we would call the backend to get emergency contacts
    // For now, we'll use a mock implementation
    const mockContacts = {
      hospital: {
        name: "Pakistan Institute of Medical Sciences",
        phone: "+92 51 9284444",
        distance: "0.5 km"
      },
      police: {
        name: "Police Station G-10",
        phone: "+92 51 9264444",
        distance: "0.8 km"
      },
      fire: {
        name: "Fire Department G-10",
        phone: "+92 51 9274444",
        distance: "1.2 km"
      }
    };
    setEmergencyContacts(mockContacts);
  };

  // Fetch user's bookings (trips)
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // In a real app, user_id would come from authentication context
        // Using the logged-in user's ID to fetch bookings
        const userId = user?.id || 1;
        const response = await fetch(`/api/bookings/user/${userId}`, {
          headers: {
            ...getAuthHeader() // Include the authorization header
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setTrips(data.data.bookings || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Only fetch if user is authenticated
      fetchBookings();
    }
  }, [user, getAuthHeader]); // Add user and getAuthHeader to dependency array

  // Function to get itinerary for a specific trip
  const getItinerary = async (tripId) => {
    if (itineraries[tripId]) return; // Already fetched
    
    try {
      const response = await fetch(`/api/itineraries/trip/${tripId}`, {
        headers: {
          ...getAuthHeader() // Include the authorization header
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setItineraries(prev => ({
        ...prev,
        [tripId]: data.data.itinerary
      }));
    } catch (err) {
      console.error('Error fetching itinerary:', err);
    }
  };

  // Function to get coordinates for a location name
  const getCoordinates = async (locationName) => {
    try {
      // Using OpenStreetMap Nominatim API as a fallback, or ideally, your backend should have this proxy
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };

  // Function to get weather for a destination
  const getWeather = async (destination) => {
    // Avoid fetching weather for the same destination multiple times
    if (weatherData[destination]) return weatherData[destination];

    try {
      // First, get the coordinates for the destination name
      const coords = await getCoordinates(destination);
      if (!coords) {
        console.error('Could not find coordinates for location:', destination);
        return null;
      }

      // Use the correct API endpoint with coordinates
      const response = await fetch(`/api/weather/coordinates?lat=${coords.lat}&lon=${coords.lon}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const weather = {
        ...data.data.weather,
        roadStatus: data.data.roadStatus,
      };

      // Cache the weather data
      setWeatherData(prev => ({
        ...prev,
        [destination]: weather
      }));

      return weather;
    } catch (err) {
      console.error('Error fetching weather:', err);
      return null;
    }
  };

  // Function to handle SOS activation
  const activateSOS = () => {
    setSosActive(true);
    // In a real app, we would send an emergency alert to authorities
    setTimeout(() => {
      setSosActive(false);
    }, 10000); // Deactivate after 10 seconds
  };

  // Function to get trip status based on dates
  const getTripStatus = (startDate) => {
    const today = new Date();
    const tripDate = new Date(startDate);
    
    if (tripDate < today) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--text-secondary)]">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Trips</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">Failed to load trips: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">My Trips</h1>
        
        {/* SOS Button - Only show if user is on an active trip */}
        {trips.some(trip => getTripStatus(trip.start_date) === 'upcoming') && (
          <button
            onClick={activateSOS}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              sosActive 
                ? 'bg-red-600 animate-pulse text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {sosActive ? 'SOS ACTIVATED!' : 'SOS'}
          </button>
        )}
      </div>

      {/* Emergency Contacts Banner - Only show when SOS is active */}
      {sosActive && emergencyContacts && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl">
          <h3 className="font-bold text-red-800 mb-2">Emergency Contacts Nearby:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg">
              <h4 className="font-bold text-red-700">Hospital</h4>
              <p className="text-sm">{emergencyContacts.hospital.name}</p>
              <p className="text-sm font-semibold">{emergencyContacts.hospital.phone}</p>
              <p className="text-xs text-gray-500">{emergencyContacts.hospital.distance} away</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="font-bold text-red-700">Police</h4>
              <p className="text-sm">{emergencyContacts.police.name}</p>
              <p className="text-sm font-semibold">{emergencyContacts.police.phone}</p>
              <p className="text-xs text-gray-500">{emergencyContacts.police.distance} away</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="font-bold text-red-700">Fire</h4>
              <p className="text-sm">{emergencyContacts.fire.name}</p>
              <p className="text-sm font-semibold">{emergencyContacts.fire.phone}</p>
              <p className="text-xs text-gray-500">{emergencyContacts.fire.distance} away</p>
            </div>
          </div>
        </div>
      )}

      {/* Trips List */}
      {trips.length === 0 ? (
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-8 text-center border border-[color:var(--border-primary)]">
          <div className="text-5xl mb-4">✈️</div>
          <h2 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">No Trips Yet</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">You haven't booked any trips yet. Start exploring and book your first adventure!</p>
          <Link to="/destinations" className="inline-block bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-6 rounded-lg font-medium">
            Explore Destinations
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {trips.map(trip => (
            <div key={trip.id} className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[color:var(--text-primary)]">{trip.package_title || 'Trip Package'}</h3>
                  <p className="text-[color:var(--text-secondary)]">{trip.destination || 'Destination'}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getTripStatus(trip.start_date) === 'upcoming' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {getTripStatus(trip.start_date) === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl">
                  <p className="text-sm text-[color:var(--text-secondary)]">Travel Dates</p>
                  <p className="font-bold">{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                </div>
                <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl">
                  <p className="text-sm text-[color:var(--text-secondary)]">Travelers</p>
                  <p className="font-bold">{trip.travelers || 1}</p>
                </div>
                <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl">
                  <p className="text-sm text-[color:var(--text-secondary)]">Total Cost</p>
                  <p className="font-bold text-[color:var(--accent-primary)]">PKR {parseFloat(trip.total_price || 0).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Weather Widget */}
              <div className="mb-6">
                <h4 className="font-bold mb-2 text-[color:var(--text-primary)]">Weather Forecast</h4>
                <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl">
                  {weatherData[trip.destination] ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={`https://openweathermap.org/img/wn/${weatherData[trip.destination].icon}@2x.png`} 
                          alt={weatherData[trip.destination].description} 
                          className="w-16 h-16 mr-4"
                        />
                        <div>
                          <p className="text-2xl font-bold">{Math.round(weatherData[trip.destination].temperature)}°C</p>
                          <p className="text-[color:var(--text-secondary)]">{weatherData[trip.destination].description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>H: {Math.round(weatherData[trip.destination].forecast?.[0]?.high ?? weatherData[trip.destination].temperature)}°C</p>
                        <p>L: {Math.round(weatherData[trip.destination].forecast?.[0]?.low ?? weatherData[trip.destination].temperature)}°C</p>
                        <p className={weatherData[trip.destination].roadStatus === 'Clear' ? 'text-green-600' : 'text-amber-600'}>
                          Roads: {weatherData[trip.destination].roadStatus || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-16">
                      <button 
                        onClick={() => getWeather(trip.destination)}
                        className="text-[color:var(--accent-primary)] hover:text-[color:var(--accent-primary-hover)] font-medium"
                      >
                        Load Weather Forecast
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Itinerary Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-[color:var(--text-primary)]">Itinerary</h4>
                  <button 
                    onClick={() => getItinerary(trip.id)}
                    className="text-[color:var(--accent-primary)] hover:text-[color:var(--accent-primary-hover)] text-sm font-medium"
                  >
                    {itineraries[trip.id] ? 'Hide' : 'Show'} Itinerary
                  </button>
                </div>
                
                {itineraries[trip.id] && (
                  <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl">
                    <div className="prose max-w-none">
                      {itineraries[trip.id].map((day, index) => (
                        <div key={index} className="mb-4 last:mb-0">
                          <h5 className="font-bold text-[color:var(--text-primary)]">Day {index + 1}: {day.title}</h5>
                          <p className="text-[color:var(--text-secondary)]">{day.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link 
                  to={`/package/${trip.package_id}`} 
                  className="flex-1 min-w-[150px] text-center bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] text-[color:var(--text-primary)] py-2 rounded-lg font-medium"
                >
                  View Package
                </Link>
                <Link 
                  to={`/trip-planner?tripId=${trip.id}`} 
                  className="flex-1 min-w-[150px] text-center bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 rounded-lg font-medium"
                >
                  Plan Activities
                </Link>
                <button 
                  className="flex-1 min-w-[150px] text-center bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] text-[color:var(--text-primary)] py-2 rounded-lg font-medium"
                  onClick={() => navigator.share ? navigator.share({
                    title: 'My Trip Details',
                    text: `Check out my trip: ${trip.package_title} to ${trip.destination}`,
                    url: window.location.href
                  }) : alert('Web Share API not supported in your browser')}
                >
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTripsScreen;