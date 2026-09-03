import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const HomeScreen = () => {
  const [recommendedPackages, setRecommendedPackages] = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate(); // Hook for navigation

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results with the query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      // Reset search query after navigation
      setSearchQuery('');
    }
  };

  // Fetch homepage data from backend
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        // In a real app, we would get the user ID from authentication context
        // For now, we'll call without user ID to get trending packages
        const response = await fetch('/api/homepage-data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setRecommendedPackages(data.data.recommendedPackages || []);
        setFeaturedPackages(data.data.featuredPackages || []);
        setPopularDestinations(data.data.popularDestinations || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--text-secondary)]">Loading homepage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Homepage</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">Failed to load homepage data: {error}</p>
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
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
      {/* Hero Section with image and dark gradient overlay */}
      <div 
        className="relative z-10 min-h-screen flex flex-col"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/20 z-0"></div>
        
        {/* Navigation */}
        <nav className="p-6 md:p-8 w-full relative z-10" style={{ backgroundColor: 'var(--nav-footer-bg)' }}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-[color:var(--accent-primary)] flex items-center justify-center">
                <span className="font-bold text-xl text-[color:var(--nav-text)]">T</span>
              </div>
              <h1 className="text-2xl font-bold text-[color:var(--nav-text)]">Touristo</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link to="/destinations" className="hover:text-[color:var(--accent-primary)] transition text-[color:var(--nav-text)]">Destinations</Link>
              <Link to="/experiences" className="hover:text-[color:var(--accent-primary)] transition text-[color:var(--nav-text)]">Experiences</Link>
              <Link to="/about" className="hover:text-[color:var(--accent-primary)] transition text-[color:var(--nav-text)]">About</Link>
              <Link to="/contact" className="hover:text-[color:var(--accent-primary)] transition text-[color:var(--nav-text)]">Contact</Link>
            </div>
            <button className="md:hidden text-2xl text-[color:var(--nav-text)]">☰</button>
          </div>
        </nav>

        {/* Search Bar - Added at the top of the hero content */}
        <div className="max-w-4xl mx-auto w-full px-4 mt-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, packages, or activities..."
              className="w-full p-4 pl-12 pr-16 rounded-xl bg-white/90 backdrop-blur-sm text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] shadow-lg"
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[color:var(--text-secondary)]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] p-2 rounded-lg hover:bg-[color:var(--accent-primary-hover)] transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Hero Content */}
        <div className="flex-grow flex flex-col items-center justify-center px-4 text-center relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-[color:var(--nav-text)]">
              Discover <span className="text-[color:var(--accent-primary)]">Pakistan</span>, Verified
            </h1>
            <p className="text-lg md:text-xl text-[color:var(--nav-text)] mb-10 max-w-2xl mx-auto">
              Experience the breathtaking beauty of Pakistan through trusted, verified tour operators. From the mountains of Hunza to the beaches of Gwadar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/destinations" className="btn btn-primary hover-lift py-4 px-8 text-lg">
                Explore Destinations
              </Link>
              <Link to="/host-discovery" className="btn btn-secondary hover-lift py-4 px-8 text-lg">
                Find Trusted Operators
              </Link>
            </div>
          </div>
        </div>

        {/* Scrolling indicator */}
        <div className="self-center pb-10 relative z-10">
          <div className="animate-bounce w-10 h-16 rounded-full border-2 border-[color:var(--accent-primary)] flex justify-center">
            <div className="w-1 h-3 mt-2 bg-[color:var(--accent-primary)] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Recommended for You Section */}
      {recommendedPackages.length > 0 && (
        <section className="py-12 px-4 bg-[color:var(--bg-primary)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[color:var(--text-primary)]">Recommended for You</h2>
              <Link to="/destinations" className="link">See All →</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedPackages.map(pkg => (
                <Link to={`/package/${pkg.id}`} key={pkg.id}>
                  <div className="bg-[color:var(--surface-primary)] rounded-xl overflow-hidden hover:shadow-lg transition border border-[color:var(--border-primary)] relative">
                    {/* Top Match Badge */}
                    {pkg.comparisonBadge === 'Top Match' && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                        Top Match
                      </div>
                    )}
                    
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={pkg.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"} 
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 text-[color:var(--accent-primary)] mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">{pkg.avg_rating || pkg.rating || 0}</span>
                      </div>
                      <h3 className="font-bold mb-1 text-[color:var(--text-primary)] text-sm truncate">{pkg.title}</h3>
                      <p className="text-xs text-[color:var(--text-secondary)] truncate">{pkg.host_name || 'Host'}</p>
                      <div className="flex justify-between items-center mt-3">
                        <div>
                          <span className="font-bold text-[color:var(--accent-primary)] text-sm">PKR {parseInt(pkg.price || 0).toLocaleString()}</span>
                          <span className="text-xs text-[color:var(--text-secondary)]"> per person</span>
                        </div>
                        <div className="text-xs text-[color:var(--text-secondary)]">
                          {pkg.duration_days || 0} days
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destinations Preview Section */}
      <section className="py-16 px-4 bg-[color:var(--bg-primary)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[color:var(--text-primary)]">Popular Destinations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularDestinations.map((destination, index) => (
              <div 
                key={index}
                className="card hover-lift"
              >
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <div className="w-full h-full bg-[color:var(--accent-primary)] flex items-center justify-center">
                    <span className="text-4xl text-[color:var(--nav-text)] font-bold">{destination.name?.charAt(0) || '?'}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">{destination.name}</h3>
                  <p className="text-[color:var(--text-secondary)]">{destination.packageCount} packages</p>
                  <Link to={`/package/${destination.packages[0]?.id || '#'}`} className="link mt-4 inline-block">
                    Explore →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/destinations" className="btn btn-primary hover-lift">
              View All Destinations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;