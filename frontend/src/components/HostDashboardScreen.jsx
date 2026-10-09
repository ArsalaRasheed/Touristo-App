import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageCircle,
  ChevronRight
} from 'lucide-react';

const HostDashboardScreen = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    revenue: 0,
    avgRating: 0
  });

  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [hostData, setHostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    user,
    getAuthHeader
  } = useAuth();

  // Fetch host dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const hostResponse =
          await fetch(
            `/api/hosts/user/${user.id}`,
            {
              headers:
                getAuthHeader()
            }
          );

        if (!hostResponse.ok) {
          throw new Error(
            'Could not load your company profile'
          );
        }

        const hostDataRes =
          await hostResponse.json();

        const hostId =
          hostDataRes.data?.host?.id;

        if (!hostId) {
          throw new Error(
            'No company profile is linked to this account'
          );
        }

        // Fetch host profile data
        setHostData(
          hostDataRes.data?.host ||
          null
        );

        // Fetch packages for this host
        const packagesResponse =
          await fetch(
            `/api/packages/host/${hostId}`,
            {
              headers:
                getAuthHeader()
            }
          );

        if (packagesResponse.ok) {
          const packagesData =
            await packagesResponse.json();

          setPackages(
            packagesData.data?.packages ||
            []
          );
        }

        // Fetch bookings related to this host's packages
        const bookingsResponse =
          await fetch(
            `/api/bookings/host/${hostId}`,
            {
              headers:
                getAuthHeader()
            }
          );

        if (bookingsResponse.ok) {
          const bookingsData =
            await bookingsResponse.json();

          setBookings(
            bookingsData.data?.bookings ||
            []
          );

          // Calculate stats
          const totalBookings =
            bookingsData.data?.bookings
              ?.length || 0;

          const upcomingBookings =
            bookingsData.data?.bookings?.filter(
              b =>
                new Date(
                  b.start_date
                ) >= new Date()
            ).length || 0;

          const revenue =
            bookingsData.data?.bookings?.reduce(
              (sum, booking) =>
                sum +
                (
                  parseFloat(
                    booking.total_price
                  ) || 0
                ),
              0
            ) || 0;

          setStats({
            totalBookings,
            upcomingBookings,
            revenue,
            avgRating: 4.5
          });
        }

      } catch (err) {
        console.error(
          'Error fetching dashboard data:',
          err
        );

        setError(
          err.message
        );

      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [
    user,
    getAuthHeader
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--brand-primary)] mx-auto"></div>

          <p className="mt-4 text-[color:var(--text-secondary)]">
            Loading dashboard...
          </p>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">

        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-light)] max-w-md">

          <h2 className="text-xl mb-2 text-[color:var(--danger)]">
            Error Loading Dashboard
          </h2>

          <p className="text-[color:var(--text-secondary)] mb-4">
            Failed to load dashboard data:
            {' '}
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-[color:var(--text-inverse)] py-2 px-4 rounded-lg"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] p-4">

      {/* Display verification status */}
      {hostData && (
        <div className="mb-6 p-4 bg-[color:var(--brand-primary-soft)] rounded-xl border border-[color:var(--brand-primary)]/30">

          <div className="flex justify-between items-center">

            <div>

              <h2 className="text-lg text-[color:var(--text-primary)]">
                {hostData.company_name}
              </h2>

              <p className="text-[color:var(--text-secondary)] text-sm">
                Verification Status:
                {' '}
                {hostData.verification_status}
              </p>

            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                hostData.verification_status ===
                'approved'
                  ? 'bg-[color:var(--success-soft)] text-[color:var(--success)]'
                  : hostData.verification_status ===
                    'rejected'
                    ? 'bg-[color:var(--danger-soft)] text-[color:var(--danger)]'
                    : 'bg-[color:var(--warning-soft)] text-[color:var(--warning)]'
              }`}
            >
              {hostData.verification_status ===
              'pending'
                ? 'Pending Verification'
                : hostData.verification_status}
            </span>

          </div>
        </div>
      )}

      <h1 className="text-3xl tracking-[-0.03em] text-[color:var(--text-primary)] mb-6">
        Host Dashboard
      </h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-[color:var(--surface-primary)] p-4 rounded-xl shadow text-center border border-[color:var(--border-light)]">
          <p className="text-2xl font-bold text-[color:var(--brand-primary)]">
            {stats.totalBookings}
          </p>
          <p className="text-[color:var(--text-secondary)] text-sm">
            Total Bookings
          </p>
        </div>

        <div className="bg-[color:var(--surface-primary)] p-4 rounded-xl shadow text-center border border-[color:var(--border-light)]">
          <p className="text-2xl font-bold text-[color:var(--brand-primary)]">
            {stats.upcomingBookings}
          </p>
          <p className="text-[color:var(--text-secondary)] text-sm">
            Upcoming
          </p>
        </div>

        <div className="bg-[color:var(--surface-primary)] p-4 rounded-xl shadow text-center border border-[color:var(--border-light)]">
          <p className="text-2xl font-bold text-[color:var(--brand-primary)]">
            PKR {stats.revenue.toLocaleString()}
          </p>
          <p className="text-[color:var(--text-secondary)] text-sm">
            Revenue
          </p>
        </div>

        <div className="bg-[color:var(--surface-primary)] p-4 rounded-xl shadow text-center border border-[color:var(--border-light)]">
          <p className="text-2xl font-bold text-[color:var(--brand-primary)]">
            {stats.avgRating}
          </p>
          <p className="text-[color:var(--text-secondary)] text-sm">
            Avg. Rating
          </p>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Customer Inquiries */}
        <Link
          to="/inbox"
          className="flex items-center justify-between bg-[color:var(--surface-primary)] hover:bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] p-4 rounded-xl border border-[color:var(--border-light)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition group"
        >

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-[color:var(--surface-secondary)] flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[color:var(--brand-primary)]" />
            </div>

            <div>

              <p className="font-bold text-base">
                Customer Inquiries
              </p>

              <p className="text-sm text-[color:var(--text-secondary)]">
                View and reply to traveler messages
              </p>

            </div>

          </div>

          <ChevronRight className="w-5 h-5 text-[color:var(--text-secondary)] group-hover:translate-x-1 transition-transform" />

        </Link>

        {/* Manage Tour Guides */}
        <Link
          to="/host/guides"
          className="flex items-center justify-between bg-[color:var(--surface-primary)] hover:bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] p-4 rounded-xl border border-[color:var(--border-light)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition group"
        >

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-[color:var(--surface-secondary)] flex items-center justify-center">
              <span className="text-xl">
                🧑‍🏫
              </span>
            </div>

            <div>

              <p className="font-bold text-base">
                Manage Tour Guides
              </p>

              <p className="text-sm text-[color:var(--text-secondary)]">
                Add and manage your tour guides
              </p>

            </div>

          </div>

          <ChevronRight className="w-5 h-5 text-[color:var(--text-secondary)] group-hover:translate-x-1 transition-transform" />

        </Link>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Bookings */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 shadow-[var(--shadow-md)] border border-[color:var(--border-light)]">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-lg text-[color:var(--text-primary)]">
              Recent Bookings
            </h2>

            <Link
              to="/bookings"
              className="text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-hover)] text-sm font-medium"
            >
              View All
            </Link>

          </div>

          <div className="space-y-3">

            {bookings.length > 0 ? (

              bookings
                .slice(0, 5)
                .map(booking => (

                  <div
                    key={booking.id}
                    className="flex justify-between items-center border-b border-[color:var(--border-light)] pb-2 last:border-0 last:pb-0"
                  >

                    <div>

                      <p className="font-medium text-[color:var(--text-primary)]">
                        {booking.user_name ||
                          'Customer'}
                      </p>

                      <p className="text-xs text-[color:var(--text-secondary)]">
                        {booking.package_title ||
                          'Package'}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-sm text-[color:var(--text-secondary)]">
                        {new Date(
                          booking.start_date
                        ).toLocaleDateString()}
                      </p>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          booking.status ===
                          'confirmed'
                            ? 'bg-[color:var(--success-soft)] text-[color:var(--success)]'
                            : 'bg-[color:var(--warning-soft)] text-[color:var(--warning)]'
                        }`}
                      >
                        {booking.status}
                      </span>

                    </div>

                  </div>

                ))

            ) : (

              <p className="text-[color:var(--text-secondary)] text-center py-4">
                No bookings yet
              </p>

            )}

          </div>

        </div>

        {/* My Packages */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 shadow-[var(--shadow-md)] border border-[color:var(--border-light)]">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-lg text-[color:var(--text-primary)]">
              My Packages
            </h2>

            <Link
              to="/host/create-package"
              className="text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-hover)] text-sm font-medium"
            >
              + Add New
            </Link>

          </div>

          <div className="space-y-3">

            {packages.length > 0 ? (

              packages
                .slice(0, 5)
                .map(pkg => (

                  <div
                    key={pkg.id}
                    className="flex justify-between items-center border-b border-[color:var(--border-light)] pb-2 last:border-0 last:pb-0"
                  >

                    <div>

                      <p className="font-medium text-[color:var(--text-primary)]">
                        {pkg.title}
                      </p>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          pkg.status ===
                          'active'
                            ? 'bg-[color:var(--success-soft)] text-[color:var(--success)]'
                            : 'bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)]'
                        }`}
                      >
                        {pkg.status ||
                          'active'}
                      </span>

                    </div>

                    <div className="text-right">

                      <p className="text-sm text-[color:var(--text-secondary)]">
                        {pkg.booking_count ||
                          0}{' '}
                        bookings
                      </p>

                      <Link
                        to={`/host/create-package?edit=${pkg.id}`}
                        className="text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-hover)] text-xs font-medium inline-block mt-1"
                      >
                        Manage
                      </Link>

                    </div>

                  </div>

                ))

            ) : (

              <p className="text-[color:var(--text-secondary)] text-center py-4">
                No packages yet
              </p>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default HostDashboardScreen;