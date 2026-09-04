import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DestinationsScreen = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================
  // DESTINATION IMAGES
  // =========================================================
  // If backend provides an image, backend image will be used.
  // If not, the destination name will be used to select
  // one of these fallback images.
  // =========================================================

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
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85',

    'gwadar':
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
  };

  // Generic fallback in case a destination has no
  // matching image.
  const fallbackImage =
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85';

  // =========================================================
  // SEEDED DESTINATION DATA
  // =========================================================

  const seededDestinations = [
    {
      id: 1,
      name: 'Swat Valley',
      tagline: 'The Switzerland of Pakistan',
      category: 'mountains',
      description:
        'Scenic valley known for its natural beauty and historical sites.',
      coordinates: { lat: 35.8526, lng: 72.1877 },
    },

    {
      id: 2,
      name: 'Hunza Valley',
      tagline: 'Land of the Living Gods',
      category: 'valley',
      description:
        'A mountainous region offering stunning views and ancient culture.',
      coordinates: { lat: 36.3114, lng: 74.5192 },
    },

    {
      id: 3,
      name: 'Neelum Valley',
      tagline: 'Valley of Flowers',
      category: 'river',
      description:
        'A beautiful valley along the Neelum River with lush greenery.',
      coordinates: { lat: 34.8167, lng: 73.7667 },
    },

    {
      id: 4,
      name: 'Skardu',
      tagline: 'Gateway to High Mountains',
      category: 'city',
      description:
        'Access point for K2 and other peaks in the Karakoram range.',
      coordinates: { lat: 35.2997, lng: 75.6344 },
    },

    {
      id: 5,
      name: 'Fairy Meadows',
      tagline: 'Closest View of Nanga Parbat',
      category: 'meadow',
      description:
        'A picturesque meadow located near the base of Nanga Parbat.',
      coordinates: { lat: 35.25, lng: 73.25 },
    },
  ];

  // =========================================================
  // GET DESTINATION IMAGE
  // =========================================================

  const getDestinationImage = (destination) => {
    // 1. Use image coming from backend first
    if (destination?.image) {
      return destination.image;
    }

    // 2. Support image_url if backend uses that field
    if (destination?.image_url) {
      return destination.image_url;
    }

    // 3. Support cover_image if present
    if (destination?.cover_image) {
      return destination.cover_image;
    }

    // 4. Match destination name with fallback image library
    const name = String(destination?.name || '')
      .trim()
      .toLowerCase();

    return destinationImages[name] || fallbackImage;
  };

  // =========================================================
  // FETCH DESTINATIONS FROM BACKEND
  // =========================================================

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations');

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        const fetchedDestinations =
          data?.data?.destinations || [];

        // Use backend destinations if available.
        // Otherwise use seeded destinations.
        setDestinations(
          fetchedDestinations.length > 0
            ? fetchedDestinations
            : seededDestinations
        );
      } catch (err) {
        console.error(
          'Error fetching destinations:',
          err
        );

        // Keep original fallback behaviour
        setDestinations(seededDestinations);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // =========================================================
  // LOADING SCREEN
  // =========================================================

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

  // =========================================================
  // ERROR SCREEN
  // =========================================================

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
            onClick={() => window.location.reload()}
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN SCREEN
  // =========================================================

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 pb-24">

      <div className="max-w-6xl mx-auto">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[color:var(--text-primary)]">
            Discover Pakistan
          </h1>

          <p className="text-[color:var(--text-secondary)]">
            Explore the diverse landscapes and rich heritage of Pakistan
          </p>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

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

          /* =================================================
             DESTINATION GRID
          ================================================= */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {destinations.map((destination) => {

              const image =
                getDestinationImage(destination);

              const destinationName =
                destination?.name || 'Destination';

              const destinationSlug =
                destinationName
                  .replace(/\s+/g, '-')
                  .toLowerCase();

              return (
                <Link
                  to={`/destination/${destinationSlug}`}
                  key={destination.id}
                  className="block group"
                >

                  {/* =========================================
                      DESTINATION CARD
                  ========================================== */}

                  <div className="bg-[color:var(--surface-primary)] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[color:var(--border-primary)] group-hover:border-[color:var(--accent-primary)]">

                    {/* =======================================
                        IMAGE AREA
                    ======================================== */}

                    <div className="relative h-52 overflow-hidden bg-[color:var(--surface-secondary)]">

                      <img
                        src={image}
                        alt={destinationName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(event) => {
                          if (
                            event.currentTarget.src !==
                            fallbackImage
                          ) {
                            event.currentTarget.src =
                              fallbackImage;
                          }
                        }}
                      />

                      {/* Dark gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

                      {/* Destination name over image */}
                      <div className="absolute bottom-4 left-4 right-4">

                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                          {destinationName}
                        </h3>

                      </div>

                    </div>

                    {/* =======================================
                        CARD CONTENT
                    ======================================== */}

                    <div className="p-6">

                      {/* Tagline */}
                      <p className="text-[color:var(--text-secondary)] text-sm">
                        {destination?.tagline ||
                          'Beautiful destination'}
                      </p>

                      {/* Category */}
                      <div className="mt-4">

                        <span className="inline-block bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] text-xs px-3 py-1.5 rounded-full capitalize">
                          {destination?.category ||
                            'location'}
                        </span>

                      </div>

                      {/* Explore */}
                      <div className="mt-5 flex items-center justify-between">

                        <span className="text-[color:var(--accent-primary)] font-semibold">
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
