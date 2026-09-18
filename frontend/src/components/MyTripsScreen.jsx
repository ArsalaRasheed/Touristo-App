import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MyTripsScreen = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itineraries, setItineraries] = useState({});
  const [weatherData, setWeatherData] = useState({});
  const [weatherLoading, setWeatherLoading] = useState({});
  const [location, setLocation] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState(null);

  const { user, getAuthHeader } = useAuth();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          setLocation(pos);
          getEmergencyContactsForLocation(
            pos.lat,
            pos.lng
          );
        },
        (error) => {
          console.error(
            'Error getting location:',
            error
          );

          const defaultPos = {
            lat: 33.6844,
            lng: 73.0479
          };

          setLocation(defaultPos);

          getEmergencyContactsForLocation(
            defaultPos.lat,
            defaultPos.lng
          );
        }
      );
    } else {
      const defaultPos = {
        lat: 33.6844,
        lng: 73.0479
      };

      setLocation(defaultPos);

      getEmergencyContactsForLocation(
        defaultPos.lat,
        defaultPos.lng
      );
    }
  }, []);

  const getEmergencyContactsForLocation = async (
    lat,
    lng
  ) => {
    const mockContacts = {
      hospital: {
        name: 'Pakistan Institute of Medical Sciences',
        phone: '+92 51 9284444',
        distance: '0.5 km'
      },
      police: {
        name: 'Police Station G-10',
        phone: '+92 51 9264444',
        distance: '0.8 km'
      },
      fire: {
        name: 'Fire Department G-10',
        phone: '+92 51 9274444',
        distance: '1.2 km'
      }
    };

    setEmergencyContacts(mockContacts);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userId = user?.id;

        if (!userId) {
          return;
        }

        const response = await fetch(
          `/api/bookings/user/${userId}`,
          {
            headers: {
              ...getAuthHeader()
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(
            errorData.message ||
            `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        setTrips(
          data?.data?.bookings || []
        );
      } catch (err) {
        console.error(
          'Error fetching bookings:',
          err
        );

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user, getAuthHeader]);

  const getItinerary = async (tripId) => {
    if (itineraries[tripId]) {
      return;
    }

    try {
      const response = await fetch(
        `/api/itineraries/trip/${tripId}`,
        {
          headers: {
            ...getAuthHeader()
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const data = await response.json();

      setItineraries(prev => ({
        ...prev,
        [tripId]:
          data?.data?.itinerary || []
      }));
    } catch (err) {
      console.error(
        'Error fetching itinerary:',
        err
      );
    }
  };

  /**
   * Fetch live weather using the coordinates
   * already stored for the booked package's destination.
   *
   * NO Nominatim geocoding is used here.
   */
  const getWeather = async (trip) => {
    if (!trip) {
      return null;
    }

    const tripKey = trip.id;

    if (weatherData[tripKey]) {
      return weatherData[tripKey];
    }

    const latitude = Number(trip.latitude);
    const longitude = Number(trip.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      console.error(
        'Destination coordinates are missing for trip:',
        trip
      );

      setWeatherData(prev => ({
        ...prev,
        [tripKey]: {
          error:
            'Weather coordinates are not available for this destination.'
        }
      }));

      return null;
    }

    setWeatherLoading(prev => ({
      ...prev,
      [tripKey]: true
    }));

    try {
      const response = await fetch(
        `/api/weather/coordinates?lat=${encodeURIComponent(
          latitude
        )}&lon=${encodeURIComponent(
          longitude
        )}&t=${Date.now()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          'Unable to load live weather'
        );
      }

      const weather = {
        ...(data?.data?.weather || {}),
        roadStatus:
          data?.data?.roadStatus || 'Unknown'
      };

      setWeatherData(prev => ({
        ...prev,
        [tripKey]: weather
      }));

      return weather;
    } catch (err) {
      console.error(
        'Error fetching live weather:',
        err
      );

      setWeatherData(prev => ({
        ...prev,
        [tripKey]: {
          error:
            err.message ||
            'Live weather is temporarily unavailable'
        }
      }));

      return null;
    } finally {
      setWeatherLoading(prev => ({
        ...prev,
        [tripKey]: false
      }));
    }
  };

  const activateSOS = () => {
    setSosActive(true);

    setTimeout(() => {
      setSosActive(false);
    }, 10000);
  };

  const getTripStatus = (startDate) => {
    if (!startDate) {
      return 'upcoming';
    }

    const today = new Date();
    const tripDate = new Date(startDate);

    if (tripDate < today) {
      return 'completed';
    }

    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto" />

          <p className="mt-4 text-[color:var(--text-secondary)]">
            Loading trips...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">
            Error Loading Trips
          </h2>

          <p className="text-[color:var(--text-secondary)] mb-4">
            Failed to load trips: {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] p-3 sm:p-4 pb-24">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-[color:var(--text-primary)]">
            My Trips
          </h1>

          {trips.some(
            trip =>
              getTripStatus(trip.start_date) ===
              'upcoming'
          ) && (
            <button
              onClick={activateSOS}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold transition ${
                sosActive
                  ? 'bg-red-600 animate-pulse text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {sosActive
                ? 'SOS ACTIVATED!'
                : 'SOS'}
            </button>
          )}
        </div>

        {/* Emergency Contacts */}
        {sosActive && emergencyContacts && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl">
            <h3 className="font-bold text-red-800 mb-2">
              Emergency Contacts Nearby:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg">
                <h4 className="font-bold text-red-700">
                  Hospital
                </h4>
                <p className="text-sm">
                  {emergencyContacts.hospital.name}
                </p>
                <p className="text-sm font-semibold">
                  {emergencyContacts.hospital.phone}
                </p>
                <p className="text-xs text-gray-500">
                  {emergencyContacts.hospital.distance}{' '}
                  away
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <h4 className="font-bold text-red-700">
                  Police
                </h4>
                <p className="text-sm">
                  {emergencyContacts.police.name}
                </p>
                <p className="text-sm font-semibold">
                  {emergencyContacts.police.phone}
                </p>
                <p className="text-xs text-gray-500">
                  {emergencyContacts.police.distance}{' '}
                  away
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <h4 className="font-bold text-red-700">
                  Fire
                </h4>
                <p className="text-sm">
                  {emergencyContacts.fire.name}
                </p>
                <p className="text-sm font-semibold">
                  {emergencyContacts.fire.phone}
                </p>
                <p className="text-xs text-gray-500">
                  {emergencyContacts.fire.distance}{' '}
                  away
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trips */}
        {trips.length === 0 ? (
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-8 text-center border border-[color:var(--border-primary)]">
            <div className="text-5xl mb-4">
              ✈️
            </div>

            <h2 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">
              No Trips Yet
            </h2>

            <p className="text-[color:var(--text-secondary)] mb-4">
              You haven't booked any trips yet.
              Start exploring and book your first
              adventure!
            </p>

            <Link
              to="/destinations"
              className="inline-block bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-6 rounded-lg font-medium"
            >
              Explore Destinations
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {trips.map(trip => {
              const weather =
                weatherData[trip.id];

              return (
                <div
                  key={trip.id}
                  className="bg-[color:var(--surface-primary)] rounded-2xl p-4 sm:p-6 border border-[color:var(--border-primary)] shadow-sm"
                >
                  {/* Trip heading */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-[color:var(--text-primary)] break-words">
                        {trip.package_title ||
                          'Trip Package'}
                      </h3>

                      <p className="text-[color:var(--text-secondary)] break-words">
                        {trip.destination ||
                          'Destination'}
                      </p>
                    </div>

                    <div className="mt-2 md:mt-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          getTripStatus(
                            trip.start_date
                          ) === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {getTripStatus(
                          trip.start_date
                        ) === 'upcoming'
                          ? 'Upcoming'
                          : 'Completed'}
                      </span>
                    </div>
                  </div>

                  {/* Trip details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-[color:var(--surface-secondary)] p-3.5 sm:p-4 rounded-xl min-w-0">
                      <p className="text-sm text-[color:var(--text-secondary)]">
                        Travel Dates
                      </p>

                      <p className="font-bold break-words">
                        {trip.start_date
                          ? new Date(
                              trip.start_date
                            ).toLocaleDateString()
                          : 'N/A'}{' '}
                        -{' '}
                        {trip.end_date
                          ? new Date(
                              trip.end_date
                            ).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-[color:var(--surface-secondary)] p-3.5 sm:p-4 rounded-xl">
                      <p className="text-sm text-[color:var(--text-secondary)]">
                        Travelers
                      </p>

                      <p className="font-bold">
                        {trip.travelers || 1}
                      </p>
                    </div>

                    <div className="bg-[color:var(--surface-secondary)] p-3.5 sm:p-4 rounded-xl">
                      <p className="text-sm text-[color:var(--text-secondary)]">
                        Total Cost
                      </p>

                      <p className="font-bold text-[color:var(--accent-primary)]">
                        PKR{' '}
                        {parseFloat(
                          trip.total_price || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Weather */}
                  <div className="mb-6">
                    <h4 className="font-bold mb-2 text-[color:var(--text-primary)]">
                      Live Weather
                    </h4>

                    <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl">

                      {!weather && !weatherLoading[trip.id] && (
                        <div className="flex justify-center items-center min-h-16">
                          <button
                            onClick={() =>
                              getWeather(trip)
                            }
                            className="text-[color:var(--accent-primary)] hover:text-[color:var(--accent-primary-hover)] font-medium"
                          >
                            Load Live Weather
                          </button>
                        </div>
                      )}

                      {weatherLoading[trip.id] && (
                        <div className="flex justify-center items-center min-h-16">
                          <div className="flex items-center gap-3 text-[color:var(--text-secondary)]">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[color:var(--accent-primary)]" />
                            Loading live weather...
                          </div>
                        </div>
                      )}

                      {weather?.error && (
                        <div className="text-center py-2">
                          <p className="text-sm text-red-600 mb-2">
                            {weather.error}
                          </p>

                          <button
                            onClick={() => {
                              setWeatherData(
                                prev => {
                                  const next = {
                                    ...prev
                                  };

                                  delete next[
                                    trip.id
                                  ];

                                  return next;
                                }
                              );

                              getWeather(trip);
                            }}
                            className="text-sm font-semibold text-[color:var(--accent-primary)]"
                          >
                            Try Again
                          </button>
                        </div>
                      )}

                      {weather &&
                        !weather.error && (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center">
                              <img
                                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                                alt={
                                  weather.description
                                }
                                className="w-16 h-16 mr-4"
                              />

                              <div>
                                <p className="text-2xl font-bold">
                                  {Math.round(
                                    weather.temperature
                                  )}
                                  °C
                                </p>

                                <p className="text-[color:var(--text-secondary)] capitalize">
                                  {
                                    weather.description
                                  }
                                </p>

                                {weather.updatedAt && (
                                  <p className="text-xs text-[color:var(--text-secondary)] mt-1">
                                    Live data
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <p>
                                H:{' '}
                                {weather.forecast?.[0]?.high ??
                                  weather.temperature}
                                °C
                              </p>

                              <p>
                                L:{' '}
                                {weather.forecast?.[0]?.low ??
                                  weather.temperature}
                                °C
                              </p>

                              <p
                                className={
                                  weather.roadStatus ===
                                  'Clear'
                                    ? 'text-green-600'
                                    : 'text-amber-600'
                                }
                              >
                                Roads:{' '}
                                {weather.roadStatus ||
                                  'Unknown'}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Itinerary */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2 gap-3">
                      <h4 className="font-bold text-[color:var(--text-primary)]">
                        Itinerary
                      </h4>

                      <button
                        onClick={() =>
                          getItinerary(trip.id)
                        }
                        className="text-[color:var(--accent-primary)] hover:text-[color:var(--accent-primary-hover)] text-sm font-medium"
                      >
                        {itineraries[trip.id]
                          ? 'Hide'
                          : 'Show'}{' '}
                        Itinerary
                      </button>
                    </div>

                    {itineraries[trip.id] && (
                      <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl">
                        <div className="prose max-w-none">
                          {itineraries[
                            trip.id
                          ].map((day, index) => (
                            <div
                              key={index}
                              className="mb-4 last:mb-0"
                            >
                              <h5 className="font-bold text-[color:var(--text-primary)]">
                                Day {index + 1}:{' '}
                                {day.title}
                              </h5>

                              <p className="text-[color:var(--text-secondary)]">
                                {day.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                      to={`/package/${trip.package_id}`}
                      className="w-full text-center bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] text-[color:var(--text-primary)] py-3 rounded-lg font-medium"
                    >
                      View Package
                    </Link>

                    <Link
                      to={`/trip-planner?tripId=${trip.id}`}
                      className="w-full text-center bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-3 rounded-lg font-medium"
                    >
                      Plan Activities
                    </Link>

                    <button
                      className="w-full text-center bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] text-[color:var(--text-primary)] py-3 rounded-lg font-medium"
                      onClick={() =>
                        navigator.share
                          ? navigator.share({
                              title:
                                'My Trip Details',
                              text: `Check out my trip: ${trip.package_title} to ${trip.destination}`,
                              url:
                                window.location
                                  .href
                            })
                          : alert(
                              'Web Share API not supported in your browser'
                            )
                      }
                    >
                      Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTripsScreen;