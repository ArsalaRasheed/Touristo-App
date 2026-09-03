import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const PackageDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [packageData, setPackageData] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch package data from backend
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/packages/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPackageData(data.data?.package || {});
        
        // Get review summary if available
        if (data.data?.reviewSummary) {
          setReviewSummary(data.data.reviewSummary);
        }
      } catch (err) {
        console.error('Error fetching package data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [id]);

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-500 text-xl mb-4">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] py-2 px-6 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : packageData ? (
          <div>
            {/* Hero Image */}
            <div className="rounded-2xl overflow-hidden mb-6 h-64 md:h-80">
              <img 
                src={packageData.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"} 
                alt={packageData.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[color:var(--text-primary)]">{packageData.title || 'Package Title'}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    <svg className="w-5 h-5 text-[color:var(--accent-primary)] mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm">{packageData.avg_rating || 0} ({packageData.total_reviews || 0} reviews)</span>
                  </div>
                  <span className="text-sm text-[color:var(--accent-primary)] font-medium">{packageData.duration_days || 0} days</span>
                  <span className="mx-2 text-sm text-[color:var(--text-secondary)]">•</span>
                  <span className="text-sm text-[color:var(--text-secondary)]">{packageData.group_size || '2-6 people'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl md:text-3xl font-bold text-[color:var(--accent-primary)]">PKR {parseInt(packageData.price || 0).toLocaleString()}</div>
                <div className="text-[color:var(--text-secondary)] text-sm">per person</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link 
                to={{
                  pathname: '/booking',
                  state: { 
                    packageInfo: {
                      id: packageData.id,
                      title: packageData.title,
                      host: packageData.host_name || 'Host Name',
                      pricePerPerson: packageData.price,
                      totalDays: packageData.duration_days,
                      image: packageData.image
                    }
                  }
                }}
                className="flex-1 min-w-[200px] bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-3 px-6 rounded-xl text-center font-bold transition"
              >
                Book Now
              </Link>
              <button className="flex-1 min-w-[200px] border border-[color:var(--accent-primary)] text-[color:var(--accent-primary)] py-3 px-6 rounded-xl font-bold hover:bg-[color:var(--accent-primary)] hover:text-[color:var(--nav-text)] transition">
                Save for Later
              </button>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-[color:var(--border-primary)] mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? 'text-[color:var(--accent-primary)] border-b-2 border-[color:var(--accent-primary)]' : 'text-[color:var(--text-secondary)]'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'details' ? 'text-[color:var(--accent-primary)] border-b-2 border-[color:var(--accent-primary)]' : 'text-[color:var(--text-secondary)]'}`}
                onClick={() => setActiveTab('details')}
              >
                Package Details
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'itinerary' ? 'text-[color:var(--accent-primary)] border-b-2 border-[color:var(--accent-primary)]' : 'text-[color:var(--text-secondary)]'}`}
                onClick={() => setActiveTab('itinerary')}
              >
                Itinerary
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'reviews' ? 'text-[color:var(--accent-primary)] border-b-2 border-[color:var(--accent-primary)]' : 'text-[color:var(--text-secondary)]'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({packageData.reviews?.length || 0})
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="mb-8">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">About This Package</h2>
                  <p className="text-[color:var(--text-secondary)] mb-6 leading-relaxed">{packageData.description || 'Detailed package description will appear here.'}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-bold mb-3 text-[color:var(--text-primary)]">What's Included</h3>
                      <ul className="space-y-2">
                        {(packageData.inclusions || []).map((item, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[color:var(--text-secondary)]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold mb-3 text-[color:var(--text-primary)]">What's Not Included</h3>
                      <ul className="space-y-2">
                        {(packageData.exclusions || []).map((item, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-[color:var(--text-secondary)]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'details' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Package Details</h2>
                  <div className="bg-[color:var(--surface-secondary)] rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold mb-2 text-[color:var(--text-primary)]">Duration</h3>
                        <p className="text-[color:var(--text-secondary)]">{packageData.duration_days || 0} days</p>
                      </div>
                      <div>
                        <h3 className="font-bold mb-2 text-[color:var(--text-primary)]">Group Size</h3>
                        <p className="text-[color:var(--text-secondary)]">{packageData.group_size || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="font-bold mb-2 text-[color:var(--text-primary)]">Destination</h3>
                        <p className="text-[color:var(--text-secondary)]">{packageData.destination || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="font-bold mb-2 text-[color:var(--text-primary)]">Location</h3>
                        <p className="text-[color:var(--text-secondary)]">{packageData.location || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold mb-4 text-[color:var(--text-primary)]">Host Information</h3>
                  <div className="flex items-center p-4 bg-[color:var(--surface-secondary)] rounded-xl">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      <div className="w-full h-full bg-gradient-to-br from-[color:var(--accent-primary)] to-teal-600 flex items-center justify-center text-[color:var(--nav-text)] font-bold">
                        {packageData.host_name?.charAt(0) || 'H'}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[color:var(--text-primary)]">{packageData.host_name || 'Host Name'}</h4>
                      <p className="text-[color:var(--text-secondary)] text-sm">Verified Tour Operator</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'itinerary' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Itinerary</h2>
                  <div className="space-y-4">
                    {(packageData.itinerary || []).map((day, index) => (
                      <div key={index} className="border-l-4 border-[color:var(--accent-primary)] pl-4 py-1">
                        <h3 className="font-bold text-[color:var(--text-primary)]">Day {day.day || index + 1}: {day.title || 'Day Activity'}</h3>
                        <p className="text-[color:var(--text-secondary)] mt-1">{day.description || 'Activity details will appear here.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Reviews</h2>
                  {packageData.reviews && packageData.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {packageData.reviews.map(review => (
                        <div key={review.id} className="bg-[color:var(--surface-secondary)] p-4 rounded-xl">
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                              <div className="w-full h-full bg-gradient-to-br from-[color:var(--accent-primary)] to-teal-600 flex items-center justify-center text-[color:var(--nav-text)] font-bold text-sm">
                                {review.reviewer_name?.charAt(0) || 'U'}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-[color:var(--text-primary)]">{review.reviewer_name || 'Anonymous'}</h4>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-[color:var(--accent-primary)] mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm">{review.rating}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[color:var(--text-secondary)]">{review.comment || 'No comment provided.'}</p>
                          <p className="text-xs text-[color:var(--text-secondary)] mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[color:var(--text-secondary)]">No reviews yet for this package.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[color:var(--text-secondary)]">Package not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageDetailScreen;