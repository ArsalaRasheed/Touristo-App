import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const DestinationExploreScreen = () => {
  const { destination } = useParams();
  const [destinationData, setDestinationData] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch destination data and related packages from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get destination details by name
        const response = await fetch(`/api/destinations/name/${destination}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setDestinationData(data.data.destination);
        setPackages(data.data.packages || []);
      } catch (err) {
        console.error('Error fetching destination data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [destination]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--text-secondary)]">Exploring {destination}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Destination</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">Failed to load destination: {error}</p>
          <Link 
            to="/destinations" 
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg inline-block"
          >
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  if (!destinationData) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">Destination Not Found</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">The destination "{destination}" does not exist.</p>
          <Link 
            to="/destinations" 
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg inline-block"
          >
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
      {/* Hero Section */}
      <div className="relative h-96">
        <img 
          src={destinationData.image} 
          alt={destinationData.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--text-primary)] to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-4xl font-bold">{destinationData.name}</h1>
          <p className="text-lg opacity-90">{destinationData.history.substring(0, 100)}...</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 -mt-16 relative z-10">
        {/* History & Background */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)]">
          <h2 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">History & Background</h2>
          <p className="text-[color:var(--text-secondary)]">{destinationData.history || 'Information not available'}</p>
        </div>

        {/* Culture & Traditions */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)]">
          <h2 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">Culture & Traditions</h2>
          <p className="text-[color:var(--text-secondary)]">{destinationData.culture || 'Information not available'}</p>
        </div>

        {/* Famous Spots */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)]">
          <h2 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">Famous Spots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinationData.famous_spots ? (
              destinationData.famous_spots.split(',').map((spot, index) => (
                <div key={index} className="bg-[color:var(--surface-secondary)] p-4 rounded-lg">
                  <h3 className="font-semibold text-[color:var(--text-primary)]">{spot.trim()}</h3>
                </div>
              ))
            ) : (
              <p className="text-[color:var(--text-secondary)]">Information not available</p>
            )}
          </div>
        </div>

        {/* Famous Local Food */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)]">
          <h2 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">Famous Local Food</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinationData.famous_food ? (
              destinationData.famous_food.split(',').map((food, index) => (
                <div key={index} className="bg-[color:var(--surface-secondary)] p-4 rounded-lg">
                  <h3 className="font-semibold text-[color:var(--text-primary)]">{food.trim()}</h3>
                </div>
              ))
            ) : (
              <p className="text-[color:var(--text-secondary)]">Information not available</p>
            )}
          </div>
        </div>

        {/* Packages for this destination */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[color:var(--text-primary)]">Packages for {destinationData.name}</h2>
            <Link 
              to={`/trip-planner?destination=${encodeURIComponent(destinationData.name)}`}
              className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg text-sm"
            >
              Ask AI about {destinationData.name}
            </Link>
          </div>
          
          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map(pkg => (
                <Link to={`/package/${pkg.id}`} key={pkg.id} className="block">
                  <div className="bg-[color:var(--surface-secondary)] p-4 rounded-lg hover:bg-[color:var(--border-primary)] transition">
                    <h3 className="font-bold text-[color:var(--text-primary)]">{pkg.title}</h3>
                    <p className="text-sm text-[color:var(--text-secondary)]">PKR {pkg.price?.toLocaleString()} • {pkg.duration_days} days</p>
                    <p className="text-sm text-[color:var(--text-secondary)] truncate">{pkg.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[color:var(--text-secondary)] text-center py-4">No packages available for this destination yet.</p>
          )}
        </div>

        <div className="text-center">
          <Link 
            to="/destinations" 
            className="inline-block bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] font-bold py-3 px-6 rounded-full transition"
          >
            Explore Other Destinations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DestinationExploreScreen;