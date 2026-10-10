import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  saveTripVault,
  removeTripVault,
  listTripVaults,
  getTripVault
} from '../utils/offlineTrips';
import {
  startTracking,
  stopTracking,
  getTrackMeta,
  getRoutePoints,
  getRouteDistanceKm,
  isTrackingLocally,
  clearRoute
} from '../utils/tripTracker';
import {
  saveWeatherSnapshot,
  getWeatherSnapshot,
  isSnapshotStale
} from '../utils/weatherCache';

const MyTripsScreen = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itineraries, setItineraries] = useState({});
  const [weatherData, setWeatherData] = useState({});
  const [weatherLoading, setWeatherLoading] = useState({});
  const [, setLocation] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState(null);

  const [online, setOnline] = useState(
    typeof navigator !== ''
      ? navigator.onLine !== false
      : true
  );
  const [usingOfflineData, setUsingOfflineData] = useState(false);
  const [vaults, setVaults] = useState({});
  const [vaultUpdating, setVaultUpdating] = useState({});
  const [trackMeta, setTrackMeta] = useState({});
  const [trackInfo, setTrackInfo] = useState({});
  const [trackError, setTrackError] = useState({});
  const [vaultLoaded, setVaultLoaded] = useState(false);

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

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadVaults = async () => {
      try {
        const records = await listTripVaults();
        const map = {};

        records.forEach(record => {
          map[record.tripId] = record;
        });

        if (!cancelled) {
          setVaults(map);
        }
      } catch {
        // Offline cache unavailable - trips still load online.
      }

      if (!cancelled) {
        setVaultLoaded(true);
      }
    };

    loadVaults();

    return () => {
      cancelled = true;
    };
  }, []);

  const getEmergencyContactsForLocation = async () => {
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

        setUsingOfflineData(false);
        setError(null);
      } catch (err) {
        console.error(
          'Error fetching bookings:',
          err
        );

        const isOffline =
          typeof navigator !== '' &&
          navigator.onLine === false;

        if (isOffline) {
          try {
            const records = await listTripVaults();

            if (records.length > 0) {
              setTrips(
                records
                  .map(record => record.booking)
                  .filter(Boolean)
              );
              setUsingOfflineData(true);
              setError(null);
              return;
            }
          } catch {
            // Fall through to the error below.
          }
        }

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

      const fetchedAt =
        data?.data?.fetchedAt ||
        new Date().toISOString();

      const roadStatus =
        data?.data?.roadStatus || 'Unknown';

      const weather = {
        ...(data?.data?.weather || {}),
        roadStatus,
        fetchedAt,
        cached: false
      };

      setWeatherData(prev => ({
        ...prev,
        [tripKey]: weather
      }));

      saveWeatherSnapshot(trip.id, {
        weather,
        roadStatus,
        fetchedAt
      });

      return weather;
    } catch (err) {
      console.error(
        'Error fetching live weather:',
        err
      );

      const snapshot =
        await getWeatherSnapshot(trip.id);

      if (snapshot?.weather) {
        setWeatherData(prev => ({
          ...prev,
          [tripKey]: {
            ...snapshot.weather,
            fetchedAt: snapshot.fetchedAt,
            cached: true
          }
        }));

        return snapshot.weather;
      }

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

  const refreshTrack = async (tripId) => {
    try {
      const meta = await getTrackMeta(tripId);
      const points = await getRoutePoints(tripId);
      const distanceKm = await getRouteDistanceKm(tripId);

      if (meta) {
        setTrackMeta(prev => ({
          ...prev,
          [tripId]: meta
        }));
      }

      setTrackInfo(prev => ({
        ...prev,
        [tripId]: {
          points: points.length,
          distanceKm
        }
      }));

      setTrackError(prev => {
        const next = { ...prev };
        delete next[tripId];
        return next;
      });
    } catch {
      // Tracking UI is best-effort.
    }
  };

  useEffect(() => {
    if (!trips.length) {
      return;
    }

    const activeIds = trips
      .filter(trip => trackMeta[trip.id]?.status === 'tracking')
      .map(trip => trip.id);

    if (activeIds.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      activeIds.forEach(id => refreshTrack(id));
    }, 5000);

    return () => clearInterval(timer);
  }, [trips, trackMeta]);

  const handleStartTracking = async (tripId) => {
    setTrackError(prev => {
      const next = { ...prev };
      delete next[tripId];
      return next;
    });

    try {
      await startTracking(tripId);
      await refreshTrack(tripId);
    } catch (err) {
      setTrackError(prev => ({
        ...prev,
        [tripId]:
          err?.message || 'Unable to start tracking.'
      }));
    }
  };

  const handleStopTracking = async (tripId) => {
    try {
      await stopTracking(tripId);
      await refreshTrack(tripId);
    } catch {
      // Ignore.
    }
  };

  const handleClearRoute = async (tripId) => {
    try {
      await clearRoute(tripId);
      await refreshTrack(tripId);
    } catch {
      // Ignore.
    }
  };

  const handleDownloadTrip = async (trip) => {
    setVaultUpdating(prev => ({
      ...prev,
      [trip.id]: true
    }));

    try {
      let itinerary = itineraries[trip.id] || [];

      if (itinerary.length === 0) {
        try {
          const response = await fetch(
            `/api/itineraries/trip/${trip.id}`,
            {
              headers: {
                ...getAuthHeader()
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            itinerary = data?.data?.itinerary || [];
          }
        } catch {
          // Keep the itinerary empty when it cannot be fetched.
        }
      }

      setItineraries(prev => ({
        ...prev,
        [trip.id]: itinerary
      }));

      const weather = await getWeather(trip);

      const record = await saveTripVault({
        tripId: trip.id,
        booking: trip,
        itinerary,
        weather: weather
          ? {
              weather,
              roadStatus: weather.roadStatus,
              fetchedAt: weather.fetchedAt
            }
          : null
      });

      setVaults(prev => ({
        ...prev,
        [trip.id]: record
      }));
    } catch (err) {
      console.error('Error saving trip offline:', err);
    } finally {
      setVaultUpdating(prev => {
        const next = { ...prev };
        delete next[trip.id];
        return next;
      });
    }
  };

  const handleRemoveVault = async (tripId) => {
    await removeTripVault(tripId);

    setVaults(prev => {
      const next = { ...prev };
      delete next[tripId];
      return next;
    });
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

  const formatAge = (iso) => {
    const then = new Date(iso).getTime();

    if (Number.isNaN(then)) {
      return '';
    }

    const diffMin = Math.max(
      0,
      Math.round((Date.now() - then) / 60000)
    );

    if (diffMin < 1) {
      return 'just now';
    }

    if (diffMin < 60) {
      return `${diffMin} min ago`;
    }

    return `${Math.round(diffMin / 60)} hr ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--brand-primary)] mx-auto" />

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
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-light)] max-w-md">
          <h2 className="text-xl mb-2 text-[color:var(--danger)]">
            Error Loading Trips
          </h2>

          <p className="text-[color:var(--text-secondary)] mb-4">
            Failed to load trips: {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-[color:var(--text-inverse)] py-2 px-4 rounded-lg"
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
          <h1 className="text-3xl tracking-[-0.03em] text-[color:var(--text-primary)]">
            My Trips
          </h1>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/sos"
              className="px-4 py-2 rounded-lg font-bold text-center transition bg-[color:var(--bg-secondary)] border border-[color:var(--border-primary)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-primary)]"
            >
              Safety &amp; SOS
            </Link>

            {trips.some(
              trip =>
                getTripStatus(trip.start_date) ===
                'upcoming'
            ) && (
              <button
                onClick={activateSOS}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold transition ${
                  sosActive
                    ? 'bg-[color:var(--danger)] animate-pulse text-white'
                    : 'bg-[color:var(--danger)] hover:bg-[color:var(--danger)]/85 text-white'
                }`}
              >
                {sosActive
                  ? 'SOS ACTIVATED!'
                  : 'SOS'}
              </button>
            )}
          </div>
        </div>

        {/* Emergency Contacts */}
        {sosActive && emergencyContacts && (
          <div className="mb-6 p-4 bg-[color:var(--danger-soft)] border border-[color:var(--danger)]/35 rounded-xl">
            <h3 className="text-[color:var(--danger)] mb-2">
              Emergency Contacts Nearby:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg">
                <h4 className="text-[color:var(--danger)]">
                  Hospital
                </h4>
                <p className="text-sm">
                  {emergencyContacts.hospital.name}
                </p>
                <p className="text-sm font-semibold">
                  {emergencyContacts.hospital.phone}
                </p>
                <p className="text-xs text-[color:var(--text-secondary)]">
                  {emergencyContacts.hospital.distance}{' '}
                  away
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <h4 className="text-[color:var(--danger)]">
                  Police
                </h4>
                <p className="text-sm">
                  {emergencyContacts.police.name}
                </p>
                <p className="text-sm font-semibold">
                  {emergencyContacts.police.phone}
                </p>
                <p className="text-xs text-[color:var(--text-secondary)]">
                  {emergencyContacts.police.distance}{' '}
                  away
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <h4 className="text-[color:var(--danger)]">
                  Fire
                </h4>
                <p className="text-sm">
                  {emergencyContacts.fire.name}
                </p>
                <p className="text-sm font-semibold">
                  {emergencyContacts.fire.phone}
                </p>
                <p className="text-xs text-[color:var(--text-secondary)]">
                  {emergencyContacts.fire.distance}{' '}
                  away
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Offline banner */}
        {!online && (
          <div className="mb-6 p-4 bg-[color:var(--warning-soft)] border border-[color:var(--warning)]/40 rounded-xl">
            <p className="font-semibold text-[color:var(--warning)]">
              You're offline
            </p>

            <p className="text-sm text-[color:var(--text-secondary)] mt-1">
              Showing saved Trip Vault contents. GPS tracking keeps
              recording locally, and emergency alerts are queued until
              you reconnect.
            </p>
          </div>
        )}

        {usingOfflineData && (
          <div className="mb-6 p-4 bg-[color:var(--surface-secondary)] border border-[color:var(--border-light)] rounded-xl">
            <p className="text-sm text-[color:var(--text-secondary)]">
              Trips below were loaded from your offline vault.{' '}
              <span className="font-semibold text-[color:var(--text-primary)]">
                Reconnect
              </span>{' '}
              to sync the latest bookings.
            </p>
          </div>
        )}

        {/* Trips */}
        {trips.length === 0 ? (
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-8 text-center border border-[color:var(--border-light)]">
            <div className="text-5xl mb-4">
              ✈️
            </div>

            <h2 className="text-xl mb-2 text-[color:var(--text-primary)]">
              No Trips Yet
            </h2>

            <p className="text-[color:var(--text-secondary)] mb-4">
              You haven't booked any trips yet.
              Start exploring and book your first
              adventure!
            </p>

            <Link
              to="/destinations"
              className="inline-block bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-[color:var(--text-inverse)] py-2 px-6 rounded-lg font-medium"
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
                  className="bg-[color:var(--surface-primary)] rounded-2xl p-4 sm:p-6 border border-[color:var(--border-light)] shadow-[var(--shadow-sm)]"
                >
                  {/* Trip heading */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="min-w-0">
                      <h3 className="text-xl text-[color:var(--text-primary)] break-words">
                        {trip.package_title ||
                          'Trip Package'}
                      </h3>

                      <p className="text-[color:var(--text-secondary)] break-words">
                        {trip.destination ||
                          'Destination'}
                      </p>
                    </div>

                    <div className="mt-2 md:mt-0 flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          getTripStatus(
                            trip.start_date
                          ) === 'upcoming'
                            ? 'bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]'
                            : 'bg-[color:var(--success-soft)] text-[color:var(--success)]'
                        }`}
                      >
                        {getTripStatus(
                          trip.start_date
                        ) === 'upcoming'
                          ? 'Upcoming'
                          : 'Completed'}
                      </span>

                      {vaults[trip.id] && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[color:var(--surface-secondary)] border border-[color:var(--border-primary)] text-[color:var(--text-primary)]">
                          ✓ Offline
                        </span>
                      )}
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

                      <p className="font-bold text-[color:var(--brand-primary)]">
                        PKR{' '}
                        {parseFloat(
                          trip.total_price || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Weather */}
                  <div className="mb-6">
                    <h4 className="mb-2 text-[color:var(--text-primary)]">
                      Live Weather
                    </h4>

                    <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl">

                      {!weather && !weatherLoading[trip.id] && (
                        <div className="flex justify-center items-center min-h-16">
                          <button
                            onClick={() =>
                              getWeather(trip)
                            }
                            className="text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-hover)] font-medium"
                          >
                            Load Live Weather
                          </button>
                        </div>
                      )}

                      {weatherLoading[trip.id] && (
                        <div className="flex justify-center items-center min-h-16">
                          <div className="flex items-center gap-3 text-[color:var(--text-secondary)]">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[color:var(--brand-primary)]" />
                            Loading live weather...
                          </div>
                        </div>
                      )}

                      {weather?.error && (
                        <div className="text-center py-2">
                          <p className="text-sm text-[color:var(--danger)] mb-2">
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
                            className="text-sm font-semibold text-[color:var(--brand-primary)]"
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

                                {(weather.fetchedAt || weather.updatedAt) && (
                                  <p className="text-xs text-[color:var(--text-secondary)] mt-1">
                                    {weather.cached ? 'Cached data' : 'Live data'}
                                    {(weather.fetchedAt || weather.updatedAt) && (
                                      <span className="ml-1 opacity-80">
                                        • {formatAge(weather.fetchedAt || weather.updatedAt)}
                                      </span>
                                    )}
                                    {weather.cached && (
                                      <span className="ml-2 inline-flex px-2 py-0.5 rounded-full bg-[color:var(--warning-soft)] text-[color:var(--warning)]">
                                        {isSnapshotStale(
                                          weather.fetchedAt
                                            ? new Date(weather.fetchedAt).getTime()
                                            : weather.savedAt
                                        )
                                          ? 'Outdated - reconnect to refresh'
                                          : 'Offline copy'}
                                      </span>
                                    )}
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
                                    ? 'text-[color:var(--success)]'
                                    : 'text-[color:var(--warning)]'
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

                  {/* Offline Trip Vault */}
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h4 className="text-[color:var(--text-primary)]">
                        Offline Trip Vault
                      </h4>

                      <div className="flex flex-wrap gap-2 text-sm font-medium">
                        <button
                          onClick={() => handleDownloadTrip(trip)}
                          disabled={vaultUpdating[trip.id]}
                          className="px-3 py-1.5 rounded-lg bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-white disabled:opacity-60"
                        >
                          {vaultUpdating[trip.id]
                            ? 'Updating...'
                            : vaults[trip.id]
                              ? 'Update Vault'
                              : 'Download for Offline'}
                        </button>

                        {vaults[trip.id] && (
                          <button
                            onClick={() => handleRemoveVault(trip.id)}
                            className="px-3 py-1.5 rounded-lg bg-[color:var(--surface-secondary)] border border-[color:var(--border-primary)] hover:bg-[color:var(--border-light)] text-[color:var(--text-primary)]"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl space-y-2">
                      <p className="text-sm text-[color:var(--text-secondary)]">
                        Save booking details, itinerary and a weather
                        snapshot on this device. Emergency contacts and
                        basic tips are included.
                      </p>

                      {vaults[trip.id] && (
                        <div className="text-xs text-[color:var(--text-secondary)]">
                          <p>
                            Last updated: {formatAge(vaults[trip.id].updatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Offline GPS Tracking */}
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h4 className="text-[color:var(--text-primary)]">
                        Offline GPS &amp; Trip Tracking
                      </h4>

                      <div className="flex flex-wrap gap-2 text-sm font-medium">
                        {isTrackingLocally(trip.id) ? (
                          <>
                            <button
                              onClick={() => handleStopTracking(trip.id)}
                              className="px-3 py-1.5 rounded-lg bg-[color:var(--warning)] hover:bg-[color:var(--warning)]/90 text-white"
                            >
                              Stop Tracking
                            </button>

                            <button
                              onClick={() => handleClearRoute(trip.id)}
                              className="px-3 py-1.5 rounded-lg bg-[color:var(--surface-secondary)] border border-[color:var(--border-primary)] hover:bg-[color:var(--border-light)] text-[color:var(--text-primary)]"
                            >
                              Clear Route
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleStartTracking(trip.id)}
                            className="px-3 py-1.5 rounded-lg bg-[color:var(--success)] hover:bg-[color:var(--success)]/90 text-white"
                          >
                            Start Tracking Offline
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-[color:var(--surface-secondary)] p-4 rounded-xl space-y-2">
                      {trackError[trip.id] && (
                        <p className="text-sm text-[color:var(--danger)]">
                          {trackError[trip.id]}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-[color:var(--text-secondary)]">
                            Status
                          </p>

                          <p className="font-semibold">
                            {trackMeta[trip.id]?.status === 'tracking'
                              ? 'Recording locally'
                              : trackMeta[trip.id]?.status === 'stopped'
                                ? 'Stopped'
                                : 'Not started'}
                          </p>
                        </div>

                        <div>
                          <p className="text-[color:var(--text-secondary)]">
                            Points recorded
                          </p>

                          <p className="font-semibold">
                            {trackInfo[trip.id]?.points ??
                              trackMeta[trip.id]?.points ??
                              0}
                          </p>
                        </div>

                        <div>
                          <p className="text-[color:var(--text-secondary)]">
                            Distance approx.
                          </p>

                          <p className="font-semibold">
                            {(
                              trackInfo[trip.id]?.distanceKm ??
                              0
                            ).toFixed(2)}{' '}
                            km
                          </p>
                        </div>
                      </div>

                      {trackMeta[trip.id]?.lastPoint && (
                        <p className="text-xs text-[color:var(--text-secondary)]">
                          Last known: {trackMeta[trip.id].lastPoint.lat.toFixed(5)},{' '}
                          {trackMeta[trip.id].lastPoint.lng.toFixed(5)}
                        </p>
                      )}

                      <p className="text-xs text-[color:var(--text-secondary)]">
                        GPS only captures coordinates - it never
                        transmits. Emergency alerts will still queue and
                        send only when triggered in Emergency Mode.
                      </p>
                    </div>
                  </div>

                  {/* Itinerary */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2 gap-3">
                      <h4 className="text-[color:var(--text-primary)]">
                        Itinerary
                      </h4>

                      <button
                        onClick={() =>
                          getItinerary(trip.id)
                        }
                        className="text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-hover)] text-sm font-medium"
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
                              <h5 className="text-[color:var(--text-primary)]">
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
                      className="w-full text-center bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-light)] text-[color:var(--text-primary)] py-3 rounded-lg font-medium"
                    >
                      View Package
                    </Link>

                    <Link
                      to={`/trip-planner?tripId=${trip.id}`}
                      className="w-full text-center bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-[color:var(--text-inverse)] py-3 rounded-lg font-medium"
                    >
                      Plan Activities
                    </Link>

                    <button
                      className="w-full text-center bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-light)] text-[color:var(--text-primary)] py-3 rounded-lg font-medium"
                      onClick={() => {
                        if (!navigator.share) {
                          alert(
                            'Web Share API not supported in your browser'
                          );
                          return;
                        }

                        try {
                          Promise.resolve(
                            navigator.share({
                              title: 'My Trip Details',
                              text: `Check out my trip: ${trip.package_title} to ${trip.destination}`,
                              url: window.location.href
                            })
                          ).catch(shareError => {
                            console.error('Share failed:', shareError);
                          });
                        } catch (shareError) {
                          console.error('Share failed:', shareError);
                          alert('Could not share this trip right now.');
                        }
                      }}
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
