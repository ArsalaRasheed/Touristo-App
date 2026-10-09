import {
  useState,
  useEffect
} from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const MyPackagesScreen = () => {
  const [packages, setPackages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const {
    user,
    getAuthHeader
  } = useAuth();

  const navigate =
    useNavigate();

  const accessError = !user
    ? 'User not authenticated.'
    : user.role !== 'host'
      ? 'Access denied. This section is available to tour companies only.'
      : null;

  useEffect(() => {
    const fetchPackages =
      async () => {

        try {

          if (!user) {
            throw new Error(
              'User not authenticated'
            );
          }

          // Get host/company record
          const hostResponse =
            await fetch(
              `/api/hosts/user/${user.id}`,
              {
                headers:
                  getAuthHeader()
              }
            );

          if (!hostResponse.ok) {

            let message =
              'Could not load your company profile';

            try {

              const errorData =
                await hostResponse.json();

              message =
                errorData.message ||
                message;

            } catch {
              // Keep default message
            }

            throw new Error(
              message
            );
          }

          const hostData =
            await hostResponse.json();

          const hostId =
            hostData.data?.host?.id;

          if (!hostId) {
            throw new Error(
              'No company profile is linked to this account. Please complete your company registration.'
            );
          }

          // Fetch packages
          const response =
            await fetch(
              `/api/packages/host/${hostId}`,
              {
                headers:
                  getAuthHeader()
              }
            );

          if (!response.ok) {

            let message =
              `Unable to load packages. Server returned ${response.status}.`;

            try {

              const errorData =
                await response.json();

              message =
                errorData.message ||
                message;

            } catch {
              // Keep default message
            }

            throw new Error(
              message
            );
          }

          const data =
            await response.json();

          setPackages(
            data.data?.packages ||
            []
          );

        } catch (err) {

          console.error(
            'Error fetching packages:',
            err
          );

          setError(
            err.message ||
            'Failed to load packages'
          );

        } finally {

          setLoading(false);

        }
      };

    if (user?.role !== 'host') {
      return;
    }

    fetchPackages();

  }, [
    user,
    getAuthHeader
  ]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading && !accessError) {

    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">

        <div className="text-center" role="status">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--brand-primary)] mx-auto"></div>

          <p className="mt-4 text-[color:var(--text-secondary)]">
            Loading your packages...
          </p>

        </div>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (accessError || error) {

    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">

        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-light)] max-w-md">

          <h2 className="text-xl mb-2 text-[color:var(--danger)]">
            Error Loading Packages
          </h2>

          <p role="alert" className="text-[color:var(--text-secondary)] mb-4">
            {accessError || error}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">

            <button
              onClick={() =>
                window.location.reload()
              }
              className="bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-[color:var(--text-inverse)] py-2 px-4 rounded-lg"
            >
              Try Again
            </button>

            <button
              onClick={() =>
                navigate('/host-dashboard')
              }
              className="bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-light)] text-[color:var(--text-primary)] py-2 px-4 rounded-lg"
            >
              Go to Dashboard
            </button>

          </div>

        </div>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Main Screen
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">

      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl tracking-[-0.03em] text-[color:var(--text-primary)]">
            My Packages
          </h1>

          <Link
            to="/host/create-package"
            className="bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-[color:var(--text-inverse)] font-bold py-2 px-4 rounded-lg"
          >
            + Add New
          </Link>

        </div>

        <p className="text-[color:var(--text-secondary)] mb-8">
          Manage and edit your tour packages
        </p>

        {packages.length === 0 ? (

          <div className="text-center py-12">

            <div className="text-5xl mb-4">
              📦
            </div>

            <h3 className="text-xl mb-2 text-[color:var(--text-primary)]">
              No packages yet
            </h3>

            <p className="text-[color:var(--text-secondary)] mb-6">
              You haven't created any packages yet. Start by adding your first package!
            </p>

            <Link
              to="/host/create-package"
              className="inline-block bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-[color:var(--text-inverse)] font-bold py-3 px-6 rounded-full transition"
            >
              Create Your First Package
            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {packages.map((pkg) => (

              <div
                key={pkg.id}
                className="bg-[color:var(--surface-primary)] rounded-2xl overflow-hidden shadow-[var(--shadow-md)] border border-[color:var(--border-light)]"
              >

                <div className="h-48 bg-gradient-to-r from-[color:var(--brand-primary)] to-[color:var(--brand-primary-hover)] flex items-center justify-center">

                  <div className="text-white text-4xl">
                    {(pkg.title || 'P')
                      .substring(0, 1)}
                  </div>

                </div>

                <div className="p-6">

                  <h3 className="text-xl mb-2 text-[color:var(--text-primary)]">
                    {pkg.title}
                  </h3>

                  <p className="text-[color:var(--text-secondary)] mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">

                    <span className="font-bold text-[color:var(--brand-primary)]">
                      PKR{' '}
                      {parseInt(
                        pkg.price || 0
                      ).toLocaleString()}
                    </span>

                    <span className="text-[color:var(--text-secondary)]">
                      {pkg.duration_days || 0}{' '}
                      days
                    </span>

                  </div>

                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        navigate(
                          `/host/create-package?edit=${pkg.id}`
                        )
                      }
                      className="flex-1 py-2 bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] rounded-lg hover:bg-[color:var(--border-light)] transition text-sm"
                    >
                      Edit
                    </button>

                    <button
                      className="flex-1 py-2 bg-[color:var(--danger-soft)] text-[color:var(--danger)] rounded-lg hover:bg-[color:var(--danger)]/35 transition text-sm"
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
            className="inline-block bg-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary-hover)] text-[color:var(--text-inverse)] font-bold py-3 px-6 rounded-full transition"
          >
            Create More Packages
          </Link>

        </div>

      </div>

    </div>
  );
};

export default MyPackagesScreen;
