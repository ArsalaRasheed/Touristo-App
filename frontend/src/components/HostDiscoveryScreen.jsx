import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HostDiscoveryScreen = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Seeded host data
  const seededHosts = [
    {
      id: 1,
      company_name: "Mountain Trails Pakistan",
      verified: true,
      ranking_badge: "Top Rated",
      avgRating: 4.9,
      rankingScore: 98,
      avgResponseTime: 2,
      description: "Specializing in Northern Areas trekking and cultural tours.",
      languages: ["English", "Urdu", "Pashto"],
      contact_email: "info@mountaintrails.pk",
      contact_phone: "+92 300 1234567",
      joinDate: "2020",
      completionRate: 99
    },
    {
      id: 2,
      company_name: "Historic Heritage Tours",
      verified: true,
      ranking_badge: "Highly Recommended",
      avgRating: 4.7,
      rankingScore: 92,
      avgResponseTime: 4,
      description: "Expert guides for Mughal architecture and ancient ruins.",
      languages: ["English", "Urdu", "Hindi"],
      contact_email: "tours@heritage.pk",
      contact_phone: "+92 310 9876543",
      joinDate: "2019",
      completionRate: 97
    },
    {
      id: 3,
      company_name: "Adventure Seekers Co.",
      verified: false,
      ranking_badge: "Rising Host",
      avgRating: 4.5,
      rankingScore: 85,
      avgResponseTime: 6,
      description: "Thrill-seekers paradise with activities like paragliding and rock climbing.",
      languages: ["English", "Urdu"],
      contact_email: "adventures@seekers.pk",
      contact_phone: "+92 320 5555555",
      joinDate: "2022",
      completionRate: 95
    },
    {
      id: 4,
      company_name: "Luxury Pakistan Journeys",
      verified: true,
      ranking_badge: "Trusted Operator",
      avgRating: 4.8,
      rankingScore: 95,
      avgResponseTime: 1,
      description: "Premium travel experience with luxury accommodations.",
      languages: ["English", "Urdu", "French"],
      contact_email: "hello@luxuryjourneys.pk",
      contact_phone: "+92 330 1112222",
      joinDate: "2018",
      completionRate: 98
    }
  ];

  // Fetch hosts from the backend
  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const response = await fetch('/api/hosts');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const fetchedHosts = data.data?.hosts || [];
        
        // Log if no hosts found
        if (fetchedHosts.length === 0) {
          console.log('No hosts found in the database, using seeded data');
        }
        
        // Use fetched data if available, otherwise use seeded data
        setHosts(fetchedHosts.length > 0 ? fetchedHosts : seededHosts);
      } catch (err) {
        console.error('Error fetching hosts:', err);
        setError(err.message);
        // Fallback to seeded data on error
        setHosts(seededHosts);
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, []);

  // Function to determine ranking badge color
  const getRankingBadgeColor = (ranking) => {
    switch(ranking) {
      case "Top Rated":
        return "bg-yellow-100 text-yellow-800";
      case "Highly Recommended":
        return "bg-blue-100 text-blue-800";
      case "Rising Host":
        return "bg-green-100 text-green-800";
      case "Trusted Operator":
        return "bg-purple-100 text-purple-800";
      case "New Host":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--text-secondary)]">Loading hosts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Hosts</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">Failed to load hosts: {error}</p>
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
        <h1 className="text-3xl font-bold mb-2 text-[color:var(--text-primary)]">Discover Top-Ranked Hosts</h1>
        <p className="text-[color:var(--text-secondary)] mb-8">Find trusted and highly-rated tour operators for your journey</p>
        
        {hosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏨</div>
            <h3 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">No hosts available</h3>
            <p className="text-[color:var(--text-secondary)] mb-6">Check back later for new hosts joining our platform.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {hosts.map(host => (
              <Link to={`/host-profile/${host.id}`} key={host.id}>
                <div className="bg-[color:var(--surface-primary)] rounded-xl p-6 flex items-center gap-6 hover:bg-[color:var(--surface-secondary)] transition border border-[color:var(--border-primary)]">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[color:var(--accent-primary)] flex items-center justify-center text-[color:var(--nav-text)] font-bold">
                      {(host.company_name || 'H').charAt(0)}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-4 mb-1">
                      <h3 className="text-xl font-bold text-[color:var(--text-primary)]">{host.company_name || 'Host Company'}</h3>
                      {host.verified && (
                        <span className="bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] text-xs px-2 py-1 rounded-full flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${getRankingBadgeColor(host.ranking_badge)}`}>
                        {host.ranking_badge || 'No Ranking'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 mb-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-[color:var(--accent-primary)] mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm">{host.avgRating?.toFixed(1) || 0} rating</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-[color:var(--accent-primary)] font-semibold">{host.rankingScore || 0}</span> ranking score
                      </div>
                      <div className="text-sm">
                        <span className="text-[color:var(--accent-primary)] font-semibold">{host.avgResponseTime || '?'}h</span> avg response
                      </div>
                    </div>
                    
                    <p className="text-[color:var(--text-secondary)] text-sm">{host.description || 'No description available'}</p>
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

export default HostDiscoveryScreen;