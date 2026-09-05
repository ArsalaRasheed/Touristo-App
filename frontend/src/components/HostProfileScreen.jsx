import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TourGuideChat from './TourGuideChat';
import { useNavigate } from 'react-router-dom';

const HostProfileScreen = () => {
  const { id } = useParams();
  const [hostData, setHostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // Added tab state
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [guidePreference, setGuidePreference] = useState('');
  const [guideRecommendation, setGuideRecommendation] = useState(null);
  const [recommending, setRecommending] = useState(false);

  const handleGetRecommendation = async () => {
    if (!guidePreference.trim()) return;
    setRecommending(true);
    setGuideRecommendation(null);
    try {
      const response = await fetch('/api/tour-guides/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guides: hostData.tourGuides,
          preference: guidePreference
        })
      });
      const data = await response.json();
      setGuideRecommendation(data.data);
    } catch (err) {
      setGuideRecommendation({ error: 'Could not get a recommendation right now.' });
    } finally {
    setRecommending(false);
    }
  };
  const navigate = useNavigate(); // Added navigation hook

  // Function to get appropriate color for ranking badge
  const getRankingBadgeColor = (badge) => {
    switch(badge) {
      case 'Top Rated':
        return 'bg-yellow-100 text-yellow-800';
      case 'Highly Recommended':
        return 'bg-blue-100 text-blue-800';
      case 'Rising Host':
        return 'bg-green-100 text-green-800';
      case 'Trusted Operator':
        return 'bg-purple-100 text-purple-800';
      case 'New Host':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const fetchHostData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/hosts/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setHostData(data.data.host);
      } catch (err) {
        console.error('Error fetching host data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Validate that id exists before making the API call
    if (id) {
      fetchHostData();
    } else {
      setError('Invalid host ID');
      setLoading(false);
    }
  }, [id]); // Added id as dependency

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--text-secondary)]">Loading host profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Host</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">Failed to load host data: {error}</p>
          <button 
            onClick={() => navigate(-1)} // Go back to previous page
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!hostData) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2">Host Not Found</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">The requested host could not be found.</p>
          <button 
            onClick={() => navigate(-1)} // Go back to previous page
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
      {/* Cover Photo */}
      <div className="h-48 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-[color:var(--accent-primary)] to-teal-600 flex items-center justify-center">
          <span className="text-4xl text-[color:var(--nav-text)] font-bold">{hostData.company_name?.charAt(0) || 'H'}</span>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl shadow-xl p-6 mb-6 border border-[color:var(--border-primary)]">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[color:var(--bg-primary)]">
              <div className="w-full h-full bg-gradient-to-br from-[color:var(--accent-primary)] to-teal-600 flex items-center justify-center text-[color:var(--nav-text)] font-bold text-3xl">
                {hostData.company_name?.charAt(0) || 'H'}
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--text-primary)]">{hostData.company_name}</h1>
                {hostData.verified && (
                  <span className="bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] px-3 py-1 rounded-full flex items-center text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.118l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
                {hostData.ranking_badge && (
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRankingBadgeColor(hostData.ranking_badge)}`}>
                    {hostData.ranking_badge}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[color:var(--accent-primary)] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-bold text-lg">{hostData.avgRating?.toFixed(1) || 0}</span>
                  <span className="mx-2">•</span>
                  <span>{hostData.total_reviews || 0} reviews</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[color:var(--accent-primary)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>{hostData.trips_completed || 0} trips</span>
                </div>
              </div>
              
              <p className="text-[color:var(--text-secondary)] mb-4">{hostData.description || 'No description available.'}</p>
              
              <div className="flex flex-wrap gap-3">
                <a 
                  href={`mailto:${hostData.contact_email || 'info@example.com'}`} 
                  className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] px-4 py-2 rounded-lg font-medium transition"
                >
                  Contact via Email
                </a>
                <a 
                  href={`tel:${hostData.contact_phone || '+92000000000'}`} 
                  className="border border-[color:var(--accent-primary)] text-[color:var(--accent-primary)] px-4 py-2 rounded-lg font-medium hover:bg-[color:var(--accent-primary)] hover:text-[color:var(--nav-text)] transition"
                >
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Host Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[color:var(--surface-secondary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)]">
            <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{hostData.rankingScore || 0}</div>
            <div className="text-sm text-[color:var(--text-secondary)]">Ranking Score</div>
          </div>
          <div className="bg-[color:var(--surface-secondary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)]">
            <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{hostData.avgResponseTime || '?'}h</div>
            <div className="text-sm text-[color:var(--text-secondary)]">Avg Response Time</div>
          </div>
          <div className="bg-[color:var(--surface-secondary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)]">
            <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{hostData.completionRate || 0}%</div>
            <div className="text-sm text-[color:var(--text-secondary)]">Completion Rate</div>
          </div>
          <div className="bg-[color:var(--surface-secondary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)]">
            <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{hostData.packageCount || 0}</div>
            <div className="text-sm text-[color:var(--text-secondary)]">Active Packages</div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-[color:var(--border-primary)] mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-[color:var(--accent-primary)] border-b-2 border-[color:var(--accent-primary)]' : 'text-[color:var(--text-secondary)]'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'packages' ? 'text-[color:var(--accent-primary)] border-b-2 border-[color:var(--accent-primary)]' : 'text-[color:var(--text-secondary)]'}`}
            onClick={() => setActiveTab('packages')}
          >
            Packages ({hostData.packages?.length || 0})
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'guides' ? 'text-[color:var(--accent-primary)] border-b-2 border-[color:var(--accent-primary)]' : 'text-[color:var(--text-secondary)]'}`}
            onClick={() => setActiveTab('guides')}
          >
            Tour Guides ({hostData.tourGuides?.length || 0})
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">About {hostData.company_name}</h2>
              <p className="text-[color:var(--text-secondary)] mb-6">{hostData.description || 'No additional information available.'}</p>
              
              <h3 className="text-lg font-bold mb-3 text-[color:var(--text-primary)]">Available Packages</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(hostData.packages || []).slice(0, 4).map(pkg => (
                  <div key={pkg.id} className="bg-[color:var(--surface-secondary)] rounded-xl p-4 border border-[color:var(--border-primary)]">
                    <h4 className="font-bold text-[color:var(--text-primary)]">{pkg.title}</h4>
                    <p className="text-[color:var(--accent-primary)] font-semibold">PKR {parseInt(pkg.price || 0).toLocaleString()} • {pkg.duration_days || 0} days</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'packages' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">All Packages</h2>
              {hostData.packages && hostData.packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostData.packages.map(pkg => (
                    <div key={pkg.id} className="bg-[color:var(--surface-primary)] rounded-xl overflow-hidden hover:shadow-lg transition border border-[color:var(--border-primary)]">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={pkg.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"} 
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold mb-1 text-[color:var(--text-primary)] text-sm truncate">{pkg.title}</h3>
                        <div className="flex justify-between items-center mt-3">
                          <div>
                            <span className="font-bold text-[color:var(--accent-primary)] text-sm">PKR {parseInt(pkg.price || 0).toLocaleString()}</span>
                            <span className="text-xs text-[color:var(--text-secondary)]"> per person</span>
                          </div>
                          <div className="text-xs text-[color:var(--text-secondary)]">
                            {pkg.duration_days || 0} days
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-[color:var(--text-secondary)]">
                          {pkg.group_size || '2-6 people'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[color:var(--text-secondary)]">No packages available.</p>
              )}
            </div>
          )}
          
          {activeTab === 'guides' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Tour Guides</h2>
              {hostData.tourGuides && hostData.tourGuides.length > 1 && (
                <div className="bg-[color:var(--surface-secondary)] rounded-xl p-4 mb-6 border border-[color:var(--border-primary)]">
                  <h3 className="font-bold text-[color:var(--text-primary)] mb-2">🤖 Which guide is best for me?</h3>
                  <p className="text-sm text-[color:var(--text-secondary)] mb-3">e.g. "Urdu-speaking guide for a family trip"</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={guidePreference}
                      onChange={(e) => setGuidePreference(e.target.value)}
                      placeholder="Describe what you need..."
                      className="flex-1 p-2 rounded-lg border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)]"
                    />
                    <button
                      onClick={handleGetRecommendation}
                      disabled={recommending}
                      className="bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                      {recommending ? '...' : 'Ask AI'}
                    </button>
                  </div>
                  {guideRecommendation && !guideRecommendation.error && (
                    <div className="mt-3 p-3 bg-[color:var(--surface-primary)] rounded-lg">
                      <p className="font-bold text-[color:var(--accent-primary)]">{guideRecommendation.recommendedGuideName}</p>
                      <p className="text-sm text-[color:var(--text-secondary)]">{guideRecommendation.reason}</p>
                    </div>
                  )}
                  {guideRecommendation?.error && (
                    <p className="text-sm text-red-500 mt-2">{guideRecommendation.error}</p>
                  )}
                </div>
              )}
              {hostData.tourGuides && hostData.tourGuides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostData.tourGuides.map(guide => (
                    <div key={guide.id} className="bg-[color:var(--surface-primary)] rounded-xl p-4 border border-[color:var(--border-primary)]">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                          <img 
                            src={guide.photo || `https://randomuser.me/api/portraits/${guide.name?.includes(' ') ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`} 
                            alt={guide.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-[color:var(--text-primary)]">{guide.name}</h3>
                          <p className="text-[color:var(--accent-primary)] text-sm">{guide.specialty}</p>
                          <div className="flex items-center mt-1">
                            <svg className="w-4 h-4 text-[color:var(--accent-primary)] mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm">{guide.rating || 0}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedGuide(guide)}
                        className="w-full bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg font-medium transition"
                      >
                        Chat with Guide
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[color:var(--text-secondary)]">No tour guides available.</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Tour Guide Chat Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[color:var(--surface-primary)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[color:var(--border-primary)]">
            <div className="p-4 border-b border-[color:var(--border-primary)] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[color:var(--text-primary)]">Chat with {selectedGuide.name}</h3>
              <button 
                onClick={() => setSelectedGuide(null)}
                className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <div className="flex-grow overflow-auto p-4">
              <TourGuideChat
                tourGuideId={selectedGuide.id}
                tourGuideName={selectedGuide.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostProfileScreen;