import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Luggage,
  Star,
  Heart,
  Shield,
  CreditCard,
  Bell,
  MessageCircle,
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [hostData, setHostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth(); // Get authenticated user from context

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Fetch user data
        const userResponse = await fetch(`/api/users/${user.id}`);
        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }
        const userDataResult = await userResponse.json();
        
        // Enhance user data with trip/review stats
        const enhancedUserData = {
          ...userDataResult.data.user,
          totalTrips: userDataResult.data.stats?.totalTrips || 0,
          totalReviews: userDataResult.data.stats?.totalReviews || 0,
          totalFavorites: userDataResult.data.stats?.totalFavorites || 0,
          favoriteDestinations: userDataResult.data.favorites || []
        };
        
        setUserData(enhancedUserData);
        
        // If user is a host, fetch host-specific data
        if (user.role === 'host') {
          const hostResponse = await fetch(`/api/hosts/user/${user.id}`);
          if (hostResponse.ok) {
            const hostDataResult = await hostResponse.json();
            setHostData(hostDataResult.data.host);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        
        // Use a fallback with the current logged-in user data
        setUserData({
          ...user,
          totalTrips: 0,
          totalReviews: 0,
          totalFavorites: 0,
          favoriteDestinations: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--text-secondary)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md shadow-sm">
          <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Profile</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">Failed to load profile: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isHost = user?.role === 'host';

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-[color:var(--text-primary)]">My Profile</h1>
        
        {/* Profile Header */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)] shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md ring-2 ring-[color:var(--border-primary)]">
              <div className="w-full h-full bg-gradient-to-br from-[color:var(--accent-primary)] to-[color:var(--accent-primary-hover)] flex items-center justify-center text-[color:var(--nav-text)] font-bold text-2xl">
                {(hostData?.company_name || userData.name)?.charAt(0) || 'U'}
              </div>
            </div>
            
            <div className="text-center md:text-left flex-grow">
              <h2 className="text-2xl font-bold mb-1 text-[color:var(--text-primary)]">
                {isHost ? hostData?.company_name || userData.name : userData.name}
              </h2>
              <p className="text-[color:var(--text-secondary)] mb-1">{userData.email}</p>
              <p className="text-sm text-[color:var(--text-secondary)] mb-1">Member since {new Date(userData.created_at || Date.now()).getFullYear()}</p>
              
              {/* Role-specific indicator */}
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {isHost ? 'Tour Company Account' : 'Traveler Account'}
              </div>
            </div>
            
            <div className="flex gap-3 shrink-0">
              <Link 
                to="/settings" 
                className="px-4 py-2 bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] rounded-lg hover:bg-[color:var(--border-primary)] transition text-sm font-medium"
              >
                Edit Profile
              </Link>
              <Link 
                to="/settings" 
                className="px-4 py-2 bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] rounded-lg hover:bg-[color:var(--accent-primary-hover)] transition text-sm font-medium"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Prominent quick-access: My Trips (moved from bottom nav) / Dashboard for hosts */}
        <Link
          to={isHost ? '/host-dashboard' : '/my-trips'}
          className="flex items-center justify-between bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] rounded-2xl p-5 mb-6 shadow-md hover:shadow-lg hover:bg-[color:var(--accent-primary-hover)] transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              {isHost ? <LayoutDashboard className="w-6 h-6" /> : <Luggage className="w-6 h-6" />}
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{isHost ? 'Go to Dashboard' : 'My Trips'}</p>
              <p className="text-sm opacity-90">{isHost ? 'Manage your bookings & packages' : 'View your bookings and travel plans'}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
        </Link>
        {/* Messages / Inbox */}
        <Link
          to="/inbox"
          className="flex items-center justify-between bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] rounded-2xl p-5 mb-6 border border-[color:var(--border-primary)] shadow-sm hover:shadow-md hover:bg-[color:var(--surface-secondary)] transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[color:var(--surface-secondary)] flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[color:var(--accent-primary)]" />
            </div>

            <div>
              <p className="font-bold text-lg leading-tight">
                Messages &amp; Inbox
              </p>
              <p className="text-sm text-[color:var(--text-secondary)]">
                Chat with tour companies and manage your inquiries
              </p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-[color:var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
        </Link>
        {/* Host-specific information if user is a host */}
        {isHost && hostData && (
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)] shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[color:var(--text-secondary)]">Company Name</p>
                <p className="font-medium">{hostData.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-[color:var(--text-secondary)]">Location</p>
                <p className="font-medium">{hostData.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-[color:var(--text-secondary)]">License Number</p>
                <p className="font-medium">{hostData.license_number || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-[color:var(--text-secondary)]">Rating</p>
                <p className="font-medium">{hostData.rating ? `${hostData.rating}/5` : 'Unrated'}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-[color:var(--text-secondary)]">Description</p>
              <p className="font-medium">{hostData.description || 'No description provided'}</p>
            </div>
          </div>
        )}
        
        {/* Stats - Different for hosts vs travelers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {isHost ? (
            <>
              <div className="bg-[color:var(--surface-primary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)] shadow-sm">
                <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{hostData?.packages_count || 0}</div>
                <div className="text-[color:var(--text-secondary)] text-sm">Packages</div>
              </div>
              <div className="bg-[color:var(--surface-primary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)] shadow-sm">
                <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{hostData?.total_bookings || 0}</div>
                <div className="text-[color:var(--text-secondary)] text-sm">Total Bookings</div>
              </div>
              <div className="bg-[color:var(--surface-primary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)] shadow-sm">
                <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{hostData?.revenue ? `PKR ${hostData.revenue.toLocaleString()}` : '0'}</div>
                <div className="text-[color:var(--text-secondary)] text-sm">Revenue</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[color:var(--surface-primary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)] shadow-sm">
                <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{userData.totalTrips}</div>
                <div className="text-[color:var(--text-secondary)] text-sm">Trips Taken</div>
              </div>
              <div className="bg-[color:var(--surface-primary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)] shadow-sm">
                <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{userData.totalReviews}</div>
                <div className="text-[color:var(--text-secondary)] text-sm">Reviews Written</div>
              </div>
              <div className="bg-[color:var(--surface-primary)] rounded-xl p-4 text-center border border-[color:var(--border-primary)] shadow-sm">
                <div className="text-2xl font-bold text-[color:var(--accent-primary)]">{userData.totalFavorites}</div>
                <div className="text-[color:var(--text-secondary)] text-sm">Favorites</div>
              </div>
            </>
          )}
        </div>
        
        {/* Favorite Destinations for travelers, or packages for hosts */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-6 border border-[color:var(--border-primary)] shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)] flex items-center gap-2">
            {isHost ? <><Star className="w-5 h-5 text-[color:var(--accent-primary)]" /> My Packages</> : <><Heart className="w-5 h-5 text-[color:var(--accent-primary)]" /> Favorite Destinations</>}
          </h2>
          {isHost ? (
            hostData?.packages && hostData.packages.length > 0 ? (
              <div className="space-y-3">
                {hostData.packages.map((pkg, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-[color:var(--surface-secondary)] rounded-lg">
                    <div>
                      <p className="font-medium">{pkg.title}</p>
                      <p className="text-sm text-[color:var(--text-secondary)]">PKR {pkg.price?.toLocaleString()} • {pkg.duration_days} days</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {pkg.bookings || 0} bookings
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[color:var(--text-secondary)] text-center py-4">No packages created yet</p>
            )
          ) : (
            userData.favoriteDestinations && userData.favoriteDestinations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userData.favoriteDestinations.map((dest, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] rounded-full text-sm"
                  >
                    {dest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[color:var(--text-secondary)] text-center py-4">No favorite destinations yet</p>
            )
          )}
        </div>
        
        {/* Account Actions */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)] shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Account Settings</h2>
          <div className="space-y-2">
            <Link to="/settings" className="flex items-center gap-3 p-3 bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] rounded-lg transition text-[color:var(--text-primary)]">
              <Shield className="w-5 h-5 text-[color:var(--accent-primary)]" />
              <span>Privacy &amp; Security</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 p-3 bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] rounded-lg transition text-[color:var(--text-primary)]">
              <CreditCard className="w-5 h-5 text-[color:var(--accent-primary)]" />
              <span>Payment Methods</span>
            </Link>
            <Link to="/notifications" className="flex items-center gap-3 p-3 bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] rounded-lg transition text-[color:var(--text-primary)]">
              <Bell className="w-5 h-5 text-[color:var(--accent-primary)]" />
              <span>Notification Preferences</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 p-3 bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] rounded-lg transition text-[color:var(--text-primary)]">
              <SettingsIcon className="w-5 h-5 text-[color:var(--accent-primary)]" />
              <span>All Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
