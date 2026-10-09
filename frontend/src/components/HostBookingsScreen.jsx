import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, PackagePlus, RefreshCw, AlertTriangle, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HostBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeader, user } = useAuth();

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

    if (user) {
      fetchBookings();
    }
  }, [user, getAuthHeader]);

  const statusStyles = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[color:var(--success-soft)] text-[color:var(--success)]';
      case 'pending':
        return 'bg-[color:var(--warning-soft)] text-[color:var(--warning)]';
      case 'cancelled':
        return 'bg-[color:var(--danger-soft)] text-[color:var(--danger)]';
      default:
        return 'bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)]';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg-primary)] px-4">
        <div className="text-center">
          <span className="loading-spinner" />
          <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
            Loading bookings…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg-primary)] px-4">
        <div className="card card-static w-full max-w-md p-7 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--danger-soft)]">
            <AlertTriangle size={22} className="text-[color:var(--danger)]" />
          </span>

          <h2 className="mt-4 text-xl text-[color:var(--text-primary)]">
            Couldn’t load your bookings
          </h2>

          <p role="alert" className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-5 w-full"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] px-4 pb-6 pt-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-gold-ink)]">
              Host dashboard
            </p>

            <h1 className="mt-1.5 text-3xl tracking-[-0.03em] text-[color:var(--text-primary)]">
              My bookings
            </h1>

            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
              {bookings.length === 0
                ? 'No bookings received yet'
                : `${bookings.length} booking${bookings.length === 1 ? '' : 's'} on your packages`}
            </p>
          </div>

          <Link to="/host/create-package" className="btn btn-secondary">
            <PackagePlus size={16} />
            New package
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="card card-static p-8 text-center sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--brand-primary-soft)]">
              <CalendarDays size={26} className="text-[color:var(--brand-primary)]" />
            </span>

            <h2 className="mt-4 text-xl text-[color:var(--text-primary)]">
              No bookings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--text-secondary)]">
              You haven’t received any bookings yet. Publish a package to start
              attracting travelers.
            </p>

            <Link to="/host/create-package" className="btn btn-primary mt-5 inline-flex">
              <PackagePlus size={16} />
              Create a package
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map(booking => (
              <div key={booking.id} className="card card-static flex flex-col p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg text-[color:var(--text-primary)]">
                      {booking.package_title || 'Package'}
                    </h3>

                    <p className="mt-0.5 text-sm text-[color:var(--text-secondary)]">
                      Booked by {booking.user_name || 'Customer'}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles(booking.status)}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="mb-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--text-secondary)]">Travel date</span>
                    <span className="font-medium text-[color:var(--text-primary)]">
                      {new Date(booking.start_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--text-secondary)]">Travelers</span>
                    <span className="font-medium text-[color:var(--text-primary)]">
                      {booking.travelers || 1}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--text-secondary)]">Total price</span>
                    <span className="font-semibold text-[color:var(--brand-primary)]">
                      PKR {parseFloat(booking.total_price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <Link
                    to={`/package/${booking.package_id}`}
                    className="btn btn-ghost flex-1 !min-h-[40px] px-3 text-sm"
                  >
                    View package
                  </Link>

                  <Link
                    to="/inbox"
                    className="btn btn-primary flex-1 !min-h-[40px] px-3 text-sm"
                  >
                    <MessageCircle size={15} />
                    Contact
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostBookingsScreen;
