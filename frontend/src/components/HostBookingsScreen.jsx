import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import auth context

const HostBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeader, user } = useAuth(); // Get the auth header function and user info

  // Fetch bookings from the backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const hostResponse = await fetch(`/api/hosts/user/${user.id}`, {
          headers: getAuthHeader()
        });
        if (!hostResponse.ok) throw new Error('Could not load your company profile');
        const hostData = await hostResponse.json();
        const hostId = hostData.data?.host?.id;
        if (!hostId) throw new Error('No company profile is linked to this account');

        const response = await fetch(`/api/bookings/host/${hostId}`, {
          headers: getAuthHeader()
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setBookings(data.data.bookings || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Only fetch if user is authenticated
      fetchBookings();
    }
  }, [user, getAuthHeader]);

  // Function to determine trip status based on dates
  const getTripStatus = (startDate) => {
    const today = new Date();
    const tripDate = new Date(startDate);
    
    if (tripDate < today) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--text-secondary)]">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">Error Loading Bookings</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">Failed to load bookings: {error}</p>
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
    <div className="min-h-screen bg-[color:var(--bg-primary)] p-4">
      <h1 className="text-2xl font-bold mb-6 text-[color:var(--text-primary)]">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-8 text-center border border-[color:var(--border-primary)]">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">No Bookings Yet</h2>
          <p className="text-[color:var(--text-secondary)] mb-4">You haven't received any bookings yet. Start by creating packages to attract customers!</p>
          <Link to="/host/create-package" className="inline-block bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-6 rounded-lg font-medium">
            Create Package
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-[color:var(--text-primary)]">{booking.package_title || 'Package'}</h3>
                  <p className="text-sm text-[color:var(--text-secondary)]">Booked by {booking.user_name || 'Customer'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : booking.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--text-secondary)]">Travel Date:</span>
                  <span className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--text-secondary)]">Travelers:</span>
                  <span className="font-medium">{booking.travelers || 1}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--text-secondary)]">Total Price:</span>
                  <span className="font-bold text-[color:var(--accent-primary)]">PKR {parseFloat(booking.total_price || 0).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link 
                  to={`/package/${booking.package_id}`} 
                  className="flex-1 text-center bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] text-[color:var(--text-primary)] py-2 rounded-lg text-sm font-medium"
                >
                  View Package
                </Link>
                <Link 
                  to="#" 
                  className="flex-1 text-center bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 rounded-lg text-sm font-medium"
                >
                  Contact
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostBookingsScreen;