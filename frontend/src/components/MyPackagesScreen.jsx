import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MyPackagesScreen = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, getAuthHeader } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        // First, get the host/company record for the logged-in user
        const hostResponse = await fetch(
          `/api/hosts/user/${user.id}`,
          {
            headers: getAuthHeader()
          }
        );

        if (!hostResponse.ok) {
          let message = 'Could not load your company profile';

          try {
            const errorData = await hostResponse.json();
            message = errorData.message || message;
          } catch {
            // Keep default message if response is not JSON
          }

          throw new Error(message);
        }

        const hostData = await hostResponse.json();
        const hostId = hostData.data?.host?.id;

        if (!hostId) {
          throw new Error(
            'No company profile is linked to this account. Please complete your company registration.'
          );
        }

        // Now fetch packages for this host
        const response = await fetch(
          `/api/packages/host/${hostId}`,
          {
            headers: getAuthHeader()
          }
        );

        if (!response.ok) {
          let message = `Unable to load packages. Server returned ${response.status}.`;

          try {
            const errorData = await response.json();
            message = errorData.message || message;
          } catch {
            // Keep default message
          }

          throw new Error(message);
        }

        const data = await response.json();

        setPackages(data.data?.packages || []);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(err.message || 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'host') {
      fetchPackages();
    } else if (user) {
      setError('Access denied. This section is available to tour companies only.');
      setLoading(false);
    } else {
      setError('User not authenticated.');
      setLoading(false);
    }
  }, [user, getAuthHeader]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--text-secondary)]">
            Loading your packages...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">
          <h2 className="text-xl font-bold mb-2 text-red-500">
            Error Loading Packages
          </h2>

          <p className="text-[color:var(--text-secondary)] mb-4">
            {error}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg"
            >
              Try Again
            </button>

            <button
              onClick={() => navigate('/host-dashboard')}
              className="bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] text-[color:var(--text-primary)] py-2 px-4 rounded-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
            My Packages
          </h1>

          <Link
            to="/host/create-package"
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] font-bold py-2 px-4 rounded-lg"
          >
            + Add New
          </Link>
        </div>

        <p className="text-[color:var(--text-secondary)] mb-8">
          Manage and edit your tour packages
        </p>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📦</div>

            <h3 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">
              No packages yet
            </h3>

            <p className="text-[color:var(--text-secondary)] mb-6">
              You haven't created any packages yet. Start by adding your first package!
            </p>

            <Link
              to="/host/create-package"
              className="inline-block bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] font-bold py-3 px-6 rounded-full transition"
            >
              Create Your First Package
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-[color:var(--surface-primary)] rounded-2xl overflow-hidden shadow-md border border-[color:var(--border-primary)]"
              >

                <div className="h-48 bg-gradient-to-r from-[color:var(--accent-primary)] to-[color:var(--accent-primary-hover)] flex items-center justify-center">
                  <div className="text-white text-4xl">
                    {(pkg.title || 'P').substring(0, 1)}
                  </div>
                </div>

                <div className="p-6">

                  <h3 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">
                    {pkg.title}
                  </h3>

                  <p className="text-[color:var(--text-secondary)] mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">

                    <span className="font-bold text-[color:var(--accent-primary)]">
                      PKR {parseInt(pkg.price || 0).toLocaleString()}
                    </span>

                    <span className="text-[color:var(--text-secondary)]">
                      {pkg.duration_days || 0} days
                    </span>

                  </div>

                  <div className="flex gap-2">

                    <button
                      className="flex-1 py-2 bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] rounded-lg hover:bg-[color:var(--border-primary)] transition text-sm"
                    >
                      Edit
                    </button>

                    <button
                      className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/host/create-package"
            className="inline-block bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] font-bold py-3 px-6 rounded-full transition"
          >
            Create More Packages
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MyPackagesScreen;