import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DestinationsScreen = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------------------------------------
  // Destination image library
  // Backend image will always have priority.
  // These are fallback images for destinations that don't
  // have an image saved in the database.
  // ---------------------------------------------------------
  const destinationImages = {
    'swat valley':
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',

    'hunza valley':
      'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=85',

    'neelum valley':
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85',

    'skardu':
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85',

    'fairy meadows':
      'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=85',

    'naran':
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',

    'babusar top':
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85',

    'lahore':
      'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1200&q=85',

    'mohenjo-daro':
      'https://images.unsplash.com/photo-1597149875290-0a6b8e6c4d7f?auto=format&fit=crop&w=1200&q=85',

    'gwadar':
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85'
  };

  // Generic fallback image
  const fallbackImage =
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85';

  // ---------------------------------------------------------
  // Seeded destination data
  // ---------------------------------------------------------
  const seededDestinations = [
    {
      id: 1,
      name: 'Swat Valley',
      tagline: 'The Switzerland of Pakistan',
      category: 'mountains',
      description:
        'Scenic valley known for its natural beauty and historical sites.',
      coordinates: {
        lat: 35.8526,
        lng: 72.1877
      }
    },

    {
      id: 2,
      name: 'Hunza Valley',
      tagline: 'Land of the Living Gods',
      category: 'valley',
      description:
        'A mountainous region offering stunning views and ancient culture.',
      coordinates: {
        lat: 36.3114,
        lng: 74.5192
      }
    },

    {
      id: 3,
      name: 'Neelum Valley',
      tagline: 'Valley of Flowers',
      category: 'river',
      description:
        'A beautiful valley along the Neelum River with lush greenery.',
      coordinates: {
        lat: 34.8167,
        lng: 73.7667
      }
    },

    {
      id: 4,
      name: 'Skardu',
      tagline: 'Gateway to High Mountains',
      category: 'city',
      description:
        'Access point for K2 and other peaks in the Karakoram range.',
      coordinates: {
        lat: 35.2997,
        lng: 75.6344
      }
    },

    {
      id: 5,
      name: 'Fairy Meadows',
      tagline: 'Closest View of Nanga Parbat',
      category: 'meadow',
      description:
        'A picturesque meadow located near the base of Nanga Parbat.',
      coordinates: {
        lat: 35.25,
        lng: 73.25
      }
    }
  ];

  // ---------------------------------------------------------
  // Get correct image for a destination
  // ---------------------------------------------------------
  const getDestinationImage = (destination) => {
    // 1. If backend already has an image, use it
    if (destination?.image) {
      return destination.image;
    }

    if (destination?.image_url) {
      return destination.image_url;
    }

    if (destination?.cover_image) {
      return destination.cover_image;
    }

    // 2. Otherwise use our destination image map
    const name = String(
      destination?.name || ''
    )
      .trim()
      .toLowerCase();

    return destinationImages[name] || fallbackImage;
  };

  // ---------------------------------------------------------
  // Fetch destinations from backend
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          '/api/destinations'
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        const fetchedDestinations =
          data?.data?.destinations || [];

        // Use fetched destinations if available
        // Otherwise use seeded destinations
        setDestinations(
          Array.isArray(fetchedDestinations) &&
            fetchedDestinations.length > 0
            ? fetchedDestinations
            : seededDestinations
        );

      } catch (err) {
        console.error(
          'Error fetching destinations:',
          err
        );

        // Use seeded data if API fails
        setDestinations(seededDestinations);

        setError(null);

      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // ---------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 pb-24 flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>

          <p className="mt-4 text-[color:var(--text-secondary)]">
            Loading destinations...
          </p>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------
  // Error State
  // ---------------------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 pb-24 flex items-center justify-center">

        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">

          <h2 className="text-xl font-bold mb-2 text-red-500">
            Error Loading Destinations
          </h2>

          <p className="text-[color:var(--text-secondary)] mb-4">
            Failed to load destinations: {error}
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

  // ---------------------------------------------------------
  // Main Screen
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 pb-24">

      <div className="max-w-5xl mx-auto">

        {/* ---------------------------------------------------
            Header
        ---------------------------------------------------- */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold mb-2 text-[color:var(--text-primary)]">
            Discover Pakistan
          </h1>

          <p className="text-[color:var(--text-secondary)]">
            Explore the diverse landscapes and rich heritage of Pakistan
          </p>

        </div>

        {/* ---------------------------------------------------
            Empty State
        ---------------------------------------------------- */}
        {destinations.length === 0 ? (

          <div className="text-center py-12">

            <div className="text-5xl mb-4">
              🌍
            </div>

            <h3 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">
              No destinations available
            </h3>

            <p className="text-[color:var(--text-secondary)] mb-6">
              Check back later for new destination listings.
            </p>

          </div>

        ) : (

          /* -------------------------------------------------
             Destination Grid
          -------------------------------------------------- */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {destinations.map((destination) => {

              const image =
                getDestinationImage(
                  destination
                );

              const destinationName =
                destination?.name ||
                'Destination';

              const destinationSlug =
                destinationName
                  .trim()
                  .replace(/\s+/g, '-')
                  .toLowerCase();

              return (

                <Link
                  to={`/destination/${destinationSlug}`}
                  key={destination?.id}
                  className="block group"
                >

                  <div className="bg-[color:var(--surface-primary)] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[color:var(--border-primary)] group-hover:border-[color:var(--accent-primary)]">

                    {/* =====================================
                        Destination Image
                    ====================================== */}
                    <div className="relative h-52 overflow-hidden bg-[color:var(--surface-secondary)]">

                      <img
                        src={image}
                        alt={destinationName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(event) => {
                          // Prevent infinite image error loop
                          if (
                            event.currentTarget.src !==
                            fallbackImage
                          ) {
                            event.currentTarget.src =
                              fallbackImage;
                          }
                        }}
                      />

                      {/* Dark gradient for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">

                        <span className="bg-black/50 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full capitalize">
                          {destination?.category ||
                            'destination'}
                        </span>

                      </div>

                      {/* Destination name on image */}
                      <div className="absolute bottom-4 left-4 right-4">

                        <h3 className="text-xl font-bold text-white drop-shadow-md">
                          {destinationName}
                        </h3>

                      </div>

                    </div>

                    {/* =====================================
                        Destination Details
                    ====================================== */}
                    <div className="p-5">

                      {/* Tagline */}
                      <p className="text-[color:var(--text-secondary)] text-sm mb-3">
                        {destination?.tagline ||
                          'Beautiful destination'}
                      </p>

                      {/* Description if available */}
                      {destination?.description && (
                        <p className="text-[color:var(--text-secondary)] text-xs line-clamp-2 mb-4">
                          {destination.description}
                        </p>
                      )}

                      {/* Explore */}
                      <div className="flex items-center justify-between">

                        <span className="text-sm font-semibold text-[color:var(--accent-primary)]">
                          Explore
                        </span>

                        <span className="text-lg text-[color:var(--accent-primary)] transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>

                      </div>

                    </div>

                  </div>

                </Link>

              );
            })}

          </div>

        )}

      </div>

    </div>
  );
};

export default DestinationsScreen;
