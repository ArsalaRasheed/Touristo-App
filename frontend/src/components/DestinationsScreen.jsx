import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DestinationsScreen = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Seeded destination data
  const seededDestinations = [
    {
      id: 1,
      name: "Swat Valley",
      tagline: "The Switzerland of Pakistan",
      category: "mountains",
      description: "Scenic valley known for its natural beauty and historical sites.",
      coordinates: { lat: 35.8526, lng: 72.1877 }
    },
    {
      id: 2,
      name: "Hunza Valley",
      tagline: "Land of the Living Gods",
      category: "valley",
      description: "A mountainous region offering stunning views and ancient culture.",
      coordinates: { lat: 36.3114, lng: 74.5192 }
    },
    {
      id: 3,
      name: "Neelum Valley",
      tagline: "Valley of Flowers",
      category: "river",
      description: "A beautiful valley along the Neelum River with lush greenery.",
      coordinates: { lat: 34.8167, lng: 73.7667 }
    },
    {
      id: 4,
      name: "Skardu",
      tagline: "Gateway to High Mountains",
      category: "city",
      description: "Access point for K2 and other peaks in the Karakoram range.",
      coordinates: { lat: 35.2997, lng: 75.6344 }
    },
    {
      id: 5,
      name: "Fairy Meadows",
      tagline: "Closest View of Nanga Parbat",
      category: "meadow",
      description: "A picturesque meadow located near the base of Nanga Parbat.",
      coordinates: { lat: 35.25, lng: 73.25 }
    }
  ];

  // Fetch destinations from the backend
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/destinations');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const fetchedDestinations = data.data.destinations || [];
        // Use fetched data if available, otherwise use seeded data
        setDestinations(fetchedDestinations.length > 0 ? fetchedDestinations : seededDestinations);
      } catch (err) {
        console.error('Error fetching destinations:', err);
        // Fallback to seeded data on error
        setDestinations(seededDestinations);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--text-secondary)]">Loading destinations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Destinations</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">Failed to load destinations: {error}</p>
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
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[color:var(--text-primary)]">Discover Pakistan</h1>
        <p className="text-[color:var(--text-secondary)] mb-8">Explore the diverse landscapes and rich heritage of Pakistan</p>
        
        {destinations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">No destinations available</h3>
            <p className="text-[color:var(--text-secondary)] mb-6">Check back later for new destination listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(destination => (
              <Link 
                to={`/destination/${destination.name?.replace(/\s+/g, '-').toLowerCase() || 'destination'}`} 
                key={destination.id}
                className="block group"
              >
                <div className="bg-[color:var(--surface-primary)] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-[color:var(--border-primary)] group-hover:border-[color:var(--accent-primary)]">
                  <div className="h-48 bg-gradient-to-r from-[color:var(--accent-primary)] to-[color:var(--accent-primary-hover)] flex items-center justify-center">
                    <div className="text-white text-5xl">
                      {destination.name?.split(' ').map(word => word[0]).join('') || 'D'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1 text-[color:var(--text-primary)]">{destination.name || 'Destination'}</h3>
                    <p className="text-[color:var(--text-secondary)] text-sm">{destination.tagline || 'Beautiful destination'}</p>
                    <div className="mt-3">
                      <span className="inline-block bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] text-xs px-2 py-1 rounded-full">
                        {destination.category || 'location'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationsScreen;