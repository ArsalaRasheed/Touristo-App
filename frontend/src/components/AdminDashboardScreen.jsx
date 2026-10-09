import {
  useCallback,
  useEffect,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import {
  LayoutDashboard,
  Users,
  Building2,
  BadgeCheck,
  Package,
  CalendarCheck,
  Star,
  BarChart3,
  Search,
  Inbox,
  RefreshCw,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Flag,
  X,
  Loader2
} from 'lucide-react';


const SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users
  },
  {
    id: 'hosts',
    label: 'Hosts',
    icon: Building2
  },
  {
    id: 'verification',
    label: 'Verification',
    icon: BadgeCheck
  },
  {
    id: 'packages',
    label: 'Packages',
    icon: Package
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: CalendarCheck
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: Star
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: Flag
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3
  }
];


const ROLE_OPTIONS = ['traveler', 'host', 'admin'];

const BOOKING_OPTIONS = [
  'pending',
  'confirmed',
  'completed',
  'cancelled'
];

const VERIFICATION_OPTIONS = [
  'pending',
  'verified',
  'rejected'
];

const REPORT_STATUS_OPTIONS = [
  'open',
  'resolved',
  'dismissed'
];


const formatPKR = value => {
  const amount = Number(value) || 0;

  return `PKR ${amount.toLocaleString('en-PK', {
    maximumFractionDigits: 0
  })}`;
};


const formatDate = value => {
  if (!value) return '—';

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return '—';

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};


const EmptyState = ({ message }) => (
  <div className="card card-static p-10 text-center">
    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--bg-secondary)] text-[color:var(--text-muted)]">
      <Inbox className="h-5 w-5" />
    </span>

    <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
      {message}
    </p>
  </div>
);


const Pagination = ({ pagination, onPage }) => {
  if (!pagination || pagination.total === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--text-secondary)]">
      <span>
        {pagination.total} record{pagination.total === 1 ? '' : 's'}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => onPage(pagination.page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border-light)] px-3 py-1.5 font-medium transition hover:bg-[color:var(--surface-secondary)] disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        <span className="px-1">
          Page {pagination.page} of {pagination.pages}
        </span>

        <button
          type="button"
          disabled={pagination.page >= pagination.pages}
          onClick={() => onPage(pagination.page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border-light)] px-3 py-1.5 font-medium transition hover:bg-[color:var(--surface-secondary)] disabled:opacity-40"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


const StatCard = ({ label, value, hint, accent }) => (
  <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
      {label}
    </p>

    <p className={`mt-1 text-2xl font-bold ${accent || 'text-[color:var(--text-primary)]'}`}>
      {value}
    </p>

    {hint && (
      <p className="mt-1 text-xs text-[color:var(--text-muted)]">{hint}</p>
    )}
  </div>
);


const AdminDashboardScreen = () => {
  const navigate = useNavigate();
  const { user, logout, getAuthHeader } = useAuth();

  const [section, setSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [busyId, setBusyId] = useState(null);


  const showNotice = message => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 4000);
  };


  const handleSessionError = useCallback(
    status => {
      if (status === 401 || status === 403) {
        logout();
        navigate('/login', { replace: true });
        return true;
      }

      return false;
    },
    [logout, navigate]
  );


  const request = useCallback(
    async (path, options = {}) => {
      const response = await fetch(path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
          ...(options.headers || {})
        }
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (handleSessionError(response.status)) {
          return null;
        }

        throw new Error(
          data?.message || 'Request failed'
        );
      }

      return data;
    },
    [getAuthHeader, handleSessionError]
  );


  const refresh = () => setRefreshKey(key => key + 1);


  /*
  |--------------------------------------------------------------------------
  | Load the active section
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        if (section === 'overview') {
          const data = await request('/api/admin/dashboard');

          if (!cancelled && data) {
            setOverview(data.data?.overview || null);
          }

        } else if (section === 'analytics') {
          const data = await request('/api/admin/analytics');

          if (!cancelled && data) {
            setAnalytics(data.data || null);
          }

        } else {
          const params = new URLSearchParams({
            page: String(page),
            limit: '20'
          });

          if (appliedSearch) params.set('q', appliedSearch);
          if (filter) {
            if (section === 'users') params.set('role', filter);
            if (section === 'verification') params.set('verification', filter);
            if (section === 'hosts') params.set('verification', filter);
            if (section === 'bookings') params.set('status', filter);
            if (section === 'reviews') params.set('rating', filter);
            if (section === 'reports') params.set('status', filter);
          }

          const resource =
            section === 'verification' ? 'hosts' : section;

          const data = await request(
            `/api/admin/${resource}?${params.toString()}`
          );

          if (!cancelled && data) {
            const payload = data.data || {};
            const key = {
              users: 'users',
              hosts: 'hosts',
              packages: 'packages',
              bookings: 'bookings',
              reviews: 'reviews',
              reports: 'reports'
            }[resource] || resource;

            setRows(payload[key] || []);
            setPagination(payload.pagination || null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setRows([]);
          setPagination(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [section, page, appliedSearch, filter, refreshKey, request]);


  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  const runAction = async (id, action, successMessage) => {
    setBusyId(id);

    try {
      await action();
      showNotice(successMessage);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };


  const changeRole = (userId, role) =>
    runAction(
      userId,
      async () => {
        await request(`/api/admin/users/${userId}/role`, {
          method: 'PATCH',
          body: JSON.stringify({ role })
        });
      },
      `Role updated to ${role}`
    );


  const changeVerification = (hostId, status) =>
    runAction(
      hostId,
      async () => {
        await request(
          `/api/admin/hosts/${hostId}/verification`,
          {
            method: 'PATCH',
            body: JSON.stringify({ status })
          }
        );
      },
      `Host marked as ${status}`
    );


  const changeBookingStatus = (bookingId, status) =>
    runAction(
      bookingId,
      async () => {
        await request(
          `/api/admin/bookings/${bookingId}/status`,
          {
            method: 'PATCH',
            body: JSON.stringify({ status })
          }
        );
      },
      `Booking marked as ${status}`
    );


  const removeReview = review =>
    runAction(
      review.id,
      async () => {
        const confirmed = window.confirm(
          `Remove the review by ${review.traveler_name || 'this traveler'}?`
        );

        if (!confirmed) return;

        await request(`/api/admin/reviews/${review.id}`, {
          method: 'DELETE'
        });
      },
      'Review removed'
    );


  const removePackage = pkg =>
    runAction(
      pkg.id,
      async () => {
        const confirmed = window.confirm(
          `Remove "${pkg.title}" from the marketplace?\n\nThis also removes its bookings and reviews. This cannot be undone.`
        );

        if (!confirmed) return;

        await request(`/api/admin/packages/${pkg.id}`, {
          method: 'DELETE'
        });
      },
      'Package removed'
    );


  const updateReport = (report, status) =>
    runAction(
      report.id,
      async () => {
        let note = '';

        if (status !== 'open') {
          const input = window.prompt(
            `Moderation note for report #${report.id} (optional):`,
            report.resolution_note || ''
          );

          if (input === null) return;

          note = input;
        }

        await request(`/api/admin/reports/${report.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status, note })
        });
      },
      `Report marked as ${status}`
    );


  const applySearch = event => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };


  const changeFilter = value => {
    setPage(1);
    setFilter(value);
  };


  const openSection = id => {
    setSection(id);
    setPage(1);
    setFilter('');
    setSearchInput('');
    setAppliedSearch('');
    setError('');
  };


  /*
  |--------------------------------------------------------------------------
  | Section renderers
  |--------------------------------------------------------------------------
  */

  const renderOverview = () => {
    if (!overview) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total users"
            value={overview.totalUsers}
            hint={`${overview.totalTravelers} travelers`}
          />
          <StatCard
            label="Hosts"
            value={overview.totalHosts}
            hint={`${overview.totalAdmins} admin account${overview.totalAdmins === 1 ? '' : 's'}`}
          />
          <StatCard
            label="Packages"
            value={overview.totalPackages}
            hint="Live listings"
          />
          <StatCard
            label="Bookings"
            value={overview.totalBookings}
            hint={`${overview.completedBookings} completed`}
          />
        </div>

        <div className="rounded-xl border border-[color:var(--brand-gold)]/40 bg-[color:var(--brand-gold)]/10 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-[color:var(--brand-primary)]" />

            <div>
              <p className="font-semibold text-[color:var(--text-primary)]">
                {overview.pendingHostVerifications} host
                {overview.pendingHostVerifications === 1 ? '' : 's'} waiting for verification
              </p>

              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                Review company documents and approve or reject hosts from the Verification section.
              </p>

              <button
                type="button"
                onClick={() => openSection('verification')}
                className="mt-3 rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--text-inverse)] transition hover:bg-[color:var(--brand-primary-hover)]"
              >
                Open verification queue
              </button>
            </div>
          </div>
        </div>

        {overview.openReports > 0 && (
          <div className="rounded-xl border border-[color:var(--warning)]/40 bg-[color:var(--warning-soft)] p-5">
            <div className="flex items-start gap-3">
              <Flag className="w-5 h-5 shrink-0 text-[color:var(--warning)]" />

              <div>
                <p className="font-semibold text-[color:var(--text-primary)]">
                  {overview.openReports} open report{overview.openReports === 1 ? '' : 's'} to review
                </p>

                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                  Travelers reported reviews, packages, hosts or accounts. Resolve or dismiss each one from the Reports section.
                </p>

                <button
                  type="button"
                  onClick={() => openSection('reports')}
                  className="mt-3 rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--text-inverse)] transition hover:bg-[color:var(--brand-primary-hover)]"
                >
                  Open reports queue
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5">
            <p className="font-semibold text-[color:var(--text-primary)]">
              Platform health
            </p>

            <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-secondary)]">
              <li>
                {overview.totalTravelers} travelers, {overview.totalHosts} hosts, {overview.totalAdmins} admins
              </li>
              <li>
                {overview.totalBookings} bookings in total
              </li>
              <li>
                {overview.completedBookings} completed bookings
              </li>
              <li>
                {overview.openReports || 0} open report{(overview.openReports || 0) === 1 ? '' : 's'} waiting for moderation
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5">
            <p className="font-semibold text-[color:var(--text-primary)]">
              Quick actions
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {SECTIONS.filter(item =>
                ['users', 'hosts', 'packages', 'bookings', 'reviews', 'reports', 'analytics'].includes(item.id)
              ).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openSection(item.id)}
                  className="rounded-lg border border-[color:var(--border-light)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-secondary)]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderTable = (headers, body) => (
    <div className="overflow-x-auto rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[color:var(--surface-secondary)] text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
          <tr>
            {headers.map(header => (
              <th key={header} className="px-4 py-3 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[color:var(--border-light)]">
          {body}
        </tbody>
      </table>
    </div>
  );


  const renderUsers = () =>
    renderTable(
      ['User', 'Role', 'Joined', 'Activity', 'Change role'],
      rows.map(item => (
        <tr key={item.id} className="align-middle">
          <td className="px-4 py-3">
            <p className="font-semibold text-[color:var(--text-primary)]">{item.name}</p>
            <p className="text-xs text-[color:var(--text-muted)]">{item.email}</p>
            {item.company_name && (
              <p className="text-xs text-[color:var(--text-muted)]">
                {item.company_name}
                {item.verification_status ? ` · ${item.verification_status}` : ''}
              </p>
            )}
          </td>

          <td className="px-4 py-3">
            <span className="rounded-full bg-[color:var(--brand-primary-soft)] px-2.5 py-1 text-xs font-semibold text-[color:var(--brand-primary)]">
              {item.role}
            </span>
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-[color:var(--text-secondary)]">
            {formatDate(item.created_at)}
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-[color:var(--text-secondary)]">
            {item.booking_count} bookings · {item.review_count} reviews
          </td>

          <td className="px-4 py-3">
            <select
              aria-label="Change user role"
              value={item.role}
              disabled={busyId === item.id || user?.id === item.id}
              onChange={event => changeRole(item.id, event.target.value)}
              className="rounded-lg border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-2 py-1.5 text-xs font-semibold text-[color:var(--text-primary)] outline-none focus:border-[color:var(--brand-primary)] disabled:opacity-50"
            >
              {ROLE_OPTIONS.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {user?.id === item.id && (
              <span className="ml-2 text-xs text-[color:var(--text-muted)]">you</span>
            )}
          </td>
        </tr>
      ))
    );


  const renderHostRows = withVerification =>
    renderTable(
      withVerification
        ? ['Company', 'Owner', 'Documents', 'Status', 'Action']
        : ['Company', 'Owner', 'Listings', 'Joined', 'Status'],
      rows.map(item => (
        <tr key={item.id} className="align-middle">
          <td className="px-4 py-3">
            <p className="font-semibold text-[color:var(--text-primary)]">
              {item.company_name}
            </p>
            <p className="text-xs text-[color:var(--text-muted)]">
              {item.location || 'Location not set'}
            </p>
          </td>

          <td className="px-4 py-3">
            <p className="text-[color:var(--text-primary)]">{item.owner_name || '—'}</p>
            <p className="text-xs text-[color:var(--text-muted)]">{item.owner_email || '—'}</p>
          </td>

          {withVerification ? (
            <td className="px-4 py-3 text-xs text-[color:var(--text-secondary)]">
              <p>License: {item.license_number || 'not provided'}</p>
              <p>Registration: {item.cnic_or_business_registration || 'not provided'}</p>
              <p>Address: {item.company_address || 'not provided'}</p>
            </td>
          ) : (
            <td className="px-4 py-3 whitespace-nowrap text-[color:var(--text-secondary)]">
              {item.package_count} packages · {item.booking_count} bookings
            </td>
          )}

          {!withVerification && (
            <td className="px-4 py-3 whitespace-nowrap text-[color:var(--text-secondary)]">
              {formatDate(item.created_at)}
            </td>
          )}

          <td className="px-4 py-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                item.verification_status === 'verified'
                  ? 'bg-[color:var(--success-soft)] text-[color:var(--success)]'
                  : item.verification_status === 'rejected'
                    ? 'bg-[color:var(--danger-soft)] text-[color:var(--danger)]'
                    : 'bg-[color:var(--warning-soft)] text-[color:var(--warning)]'
              }`}
            >
              {item.verified && item.verification_status === 'pending'
                ? 'pending (flagged verified)'
                : item.verification_status}
            </span>
          </td>

          {withVerification && (
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === item.id || item.verification_status === 'verified'}
                  onClick={() => changeVerification(item.id, 'verified')}
                  className="inline-flex items-center gap-1 rounded-lg bg-[color:var(--brand-primary)] px-2.5 py-1.5 text-xs font-semibold text-[color:var(--text-inverse)] transition hover:bg-[color:var(--brand-primary-hover)] disabled:opacity-40"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Approve
                </button>

                <button
                  type="button"
                  disabled={busyId === item.id || item.verification_status === 'rejected'}
                  onClick={() => changeVerification(item.id, 'rejected')}
                  className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--danger)]/35 px-2.5 py-1.5 text-xs font-semibold text-[color:var(--danger)] transition hover:bg-[color:var(--danger-soft)] disabled:opacity-40"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Reject
                </button>

                <button
                  type="button"
                  disabled={busyId === item.id || item.verification_status === 'pending'}
                  onClick={() => changeVerification(item.id, 'pending')}
                  className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border-light)] px-2.5 py-1.5 text-xs font-semibold text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-secondary)] disabled:opacity-40"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </td>
          )}
        </tr>
      ))
    );


  const renderPackages = () =>
    renderTable(
      ['Package', 'Host', 'Price', 'Activity', 'Action'],
      rows.map(item => (
        <tr key={item.id} className="align-middle">
          <td className="px-4 py-3">
            <p className="font-semibold text-[color:var(--text-primary)]">{item.title}</p>
            <p className="text-xs text-[color:var(--text-muted)]">
              {item.destination || 'Destination not set'} · {item.duration_days || '?'} days
            </p>
          </td>

          <td className="px-4 py-3">
            <p className="text-[color:var(--text-primary)]">{item.company_name}</p>
            <p className="text-xs text-[color:var(--text-muted)]">
              {item.host_verification_status}
            </p>
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-[color:var(--text-secondary)]">
            {formatPKR(item.price)}
          </td>

          <td className="px-4 py-3 whitespace-nowrap text-[color:var(--text-secondary)]">
            {item.booking_count} bookings · {item.review_count} reviews
          </td>

          <td className="px-4 py-3">
            <button
              type="button"
              disabled={busyId === item.id}
              onClick={() => removePackage(item)}
              className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--danger)]/35 px-2.5 py-1.5 text-xs font-semibold text-[color:var(--danger)] transition hover:bg-[color:var(--danger-soft)] disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </td>
        </tr>
      ))
    );


  const renderBookings = () =>
    renderTable(
      ['Booking', 'Traveler', 'Package', 'Amount', 'Status'],
      rows.map(item => (
        <tr key={item.id} className="align-middle">
          <td className="px-4 py-3 whitespace-nowrap">
            <p className="font-semibold text-[color:var(--text-primary)]">#{item.id}</p>
            <p className="text-xs text-[color:var(--text-muted)]">
              {formatDate(item.created_at)}
            </p>
          </td>

          <td className="px-4 py-3">
            <p className="text-[color:var(--text-primary)]">{item.traveler_name}</p>
            <p className="text-xs text-[color:var(--text-muted)]">{item.traveler_email}</p>
          </td>

          <td className="px-4 py-3">
            <p className="text-[color:var(--text-primary)]">{item.package_title}</p>
            <p className="text-xs text-[color:var(--text-muted)]">
              {item.company_name} · {item.travelers} traveler{item.travelers === 1 ? '' : 's'}
            </p>
          </td>

          <td className="px-4 py-3 whitespace-nowrap">
            <p className="font-semibold text-[color:var(--text-primary)]">
              {formatPKR(item.total_price)}
            </p>
            <p className="text-xs text-[color:var(--text-muted)]">
              payment: {item.payment_status}
            </p>
          </td>

          <td className="px-4 py-3">
            <select
              aria-label="Change status"
              value={item.status}
              disabled={busyId === item.id}
              onChange={event => changeBookingStatus(item.id, event.target.value)}
              className={`rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none disabled:opacity-50 ${
                item.status === 'completed'
                  ? 'border-[color:var(--success)]/30 bg-[color:var(--success-soft)] text-[color:var(--success)]'
                  : item.status === 'cancelled'
                    ? 'border-[color:var(--danger)]/35 bg-[color:var(--danger-soft)] text-[color:var(--danger)]'
                    : 'border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)]'
              }`}
            >
              {BOOKING_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </td>
        </tr>
      ))
    );


  const renderReviews = () =>
    renderTable(
      ['Rating', 'Review', 'Package', 'Host', 'Action'],
      rows.map(item => (
        <tr key={item.id} className="align-middle">
          <td className="px-4 py-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-gold)]/15 px-2.5 py-1 text-xs font-bold text-[color:var(--brand-gold-ink)]">
              <Star className="w-3.5 h-3.5 fill-current" />
              {item.rating}
            </span>
          </td>

          <td className="px-4 py-3 max-w-md">
            <p className="line-clamp-2 text-[color:var(--text-secondary)]">
              {item.comment || 'No comment'}
            </p>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
              {item.traveler_name} · {formatDate(item.created_at)}
            </p>
          </td>

          <td className="px-4 py-3">
            <p className="text-[color:var(--text-primary)]">{item.package_title}</p>
          </td>

          <td className="px-4 py-3 text-[color:var(--text-secondary)]">
            {item.company_name}
          </td>

          <td className="px-4 py-3">
            <button
              type="button"
              disabled={busyId === item.id}
              onClick={() => removeReview(item)}
              className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--danger)]/35 px-2.5 py-1.5 text-xs font-semibold text-[color:var(--danger)] transition hover:bg-[color:var(--danger-soft)] disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </td>
        </tr>
      ))
    );


  const REPORT_BADGE = {
    open: 'badge badge-warning',
    resolved: 'badge badge-success',
    dismissed: 'badge'
  };


  const renderReports = () =>
    renderTable(
      ['Report', 'Target', 'Reason', 'Status', 'Moderation'],
      rows.map(item => (
        <tr key={item.id} className="align-middle">
          <td className="px-4 py-3 whitespace-nowrap">
            <p className="font-semibold text-[color:var(--text-primary)]">#{item.id}</p>
            <p className="text-xs text-[color:var(--text-muted)]">
              {item.reporter_name} · {formatDate(item.created_at)}
            </p>
          </td>

          <td className="px-4 py-3 max-w-xs">
            <span className="inline-block rounded bg-[color:var(--bg-secondary)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[color:var(--text-muted)]">
              {item.target_type}
            </span>
            <p className="line-clamp-2 text-[color:var(--text-primary)]">
              {item.target_label || `#${item.target_id}`}
            </p>
            <p className="text-xs text-[color:var(--text-muted)]">
              target #{item.target_id}
            </p>
          </td>

          <td className="px-4 py-3 max-w-sm">
            <p className="font-semibold text-[color:var(--text-primary)]">
              {item.reason}
            </p>
            <p className="line-clamp-2 text-xs text-[color:var(--text-secondary)]">
              {item.details || 'No extra details'}
            </p>
          </td>

          <td className="px-4 py-3 whitespace-nowrap">
            <span className={REPORT_BADGE[item.status] || 'badge'}>
              {item.status}
            </span>
            {item.resolution_note && (
              <p className="mt-1 max-w-[10rem] text-xs text-[color:var(--text-muted)]">
                {item.resolution_note}
              </p>
            )}
          </td>

          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex flex-wrap items-center gap-2">
              {item.status === 'open' ? (
                <>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => updateReport(item, 'resolved')}
                    className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--success)]/35 px-2.5 py-1.5 text-xs font-semibold text-[color:var(--success)] transition hover:bg-[color:var(--success-soft)] disabled:opacity-40"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Resolve
                  </button>

                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => updateReport(item, 'dismissed')}
                    className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border-light)] px-2.5 py-1.5 text-xs font-semibold text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-secondary)] disabled:opacity-40"
                  >
                    <X className="w-3.5 h-3.5" />
                    Dismiss
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => updateReport(item, 'open')}
                  className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border-light)] px-2.5 py-1.5 text-xs font-semibold text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-secondary)] disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reopen
                </button>
              )}
            </div>
          </td>
        </tr>
      ))
    );


  const renderAnalytics = () => {
    if (!analytics) return null;

    const { totals, bookingsByMonth, signupsByMonth, bookingStatus, ratingDistribution, topPackages, topDestinations, hostVerification } =
      analytics;

    const maxBookings = Math.max(
      1,
      ...bookingsByMonth.map(item => Number(item.bookings) || 0)
    );

    const maxSignups = Math.max(
      1,
      ...signupsByMonth.map(item => Number(item.signups) || 0)
    );

    const maxRating = Math.max(
      1,
      ...ratingDistribution.map(item => Number(item.count) || 0)
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Gross revenue"
            value={formatPKR(totals.grossRevenue)}
            hint="Confirmed bookings, excludes cancellations"
          />
          <StatCard
            label="Bookings"
            value={totals.totalBookings}
            hint={`${totals.completedBookings} completed · ${totals.cancelledBookings} cancelled`}
          />
          <StatCard
            label="Average rating"
            value={
              totals.averageRating === null || totals.averageRating === undefined
                ? '—'
                : Number(totals.averageRating).toFixed(2)
            }
            hint={`${totals.totalReviews} reviews`}
          />
          <StatCard
            label="Destinations"
            value={totals.totalDestinations}
            hint={`${totals.totalPackages} packages listed`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5">
            <p className="font-semibold text-[color:var(--text-primary)]">
              Bookings by month
            </p>

            <div className="mt-4 space-y-3">
              {bookingsByMonth.map(item => (
                <div key={item.month}>
                  <div className="flex items-center justify-between text-xs text-[color:var(--text-secondary)]">
                    <span>{item.month}</span>
                    <span>
                      {item.bookings} bookings · {formatPKR(item.revenue)}
                    </span>
                  </div>

                  <div className="mt-1 h-2 rounded-full bg-[color:var(--surface-secondary)]">
                    <div
                      className="h-2 rounded-full bg-[color:var(--brand-primary)]"
                      style={{
                        width: `${(Number(item.bookings) / maxBookings) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5">
            <p className="font-semibold text-[color:var(--text-primary)]">
              New signups by month
            </p>

            <div className="mt-4 space-y-3">
              {signupsByMonth.map(item => (
                <div key={item.month}>
                  <div className="flex items-center justify-between text-xs text-[color:var(--text-secondary)]">
                    <span>{item.month}</span>
                    <span>{item.signups} signups</span>
                  </div>

                  <div className="mt-1 h-2 rounded-full bg-[color:var(--surface-secondary)]">
                    <div
                      className="h-2 rounded-full bg-[color:var(--brand-gold)]"
                      style={{
                        width: `${(Number(item.signups) / maxSignups) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5">
            <p className="font-semibold text-[color:var(--text-primary)]">
              Booking status
            </p>

            <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-secondary)]">
              {bookingStatus.length ? (
                bookingStatus.map(item => (
                  <li key={item.status} className="flex items-center justify-between">
                    <span className="capitalize">{item.status}</span>
                    <span className="font-semibold text-[color:var(--text-primary)]">
                      {item.count}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-[color:var(--text-muted)]">No bookings yet</li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5">
            <p className="font-semibold text-[color:var(--text-primary)]">
              Rating distribution
            </p>

            <div className="mt-3 space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const found = ratingDistribution.find(
                  item => Number(item.rating) === star
                );

                const count = found ? Number(found.count) : 0;

                return (
                  <div key={star} className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
                    <span className="w-4">{star}★</span>
                    <div className="h-2 flex-1 rounded-full bg-[color:var(--surface-secondary)]">
                      <div
                        className="h-2 rounded-full bg-[color:var(--brand-gold)]"
                        style={{ width: `${(count / maxRating) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5">
            <p className="font-semibold text-[color:var(--text-primary)]">
              Host verification
            </p>

            <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-secondary)]">
              {hostVerification.length ? (
                hostVerification.map(item => (
                  <li
                    key={item.verification_status}
                    className="flex items-center justify-between"
                  >
                    <span className="capitalize">{item.verification_status}</span>
                    <span className="font-semibold text-[color:var(--text-primary)]">
                      {item.count}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-[color:var(--text-muted)]">No hosts yet</li>
              )}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5">
            <p className="font-semibold text-[color:var(--text-primary)]">
              Top packages by bookings
            </p>

            <ol className="mt-3 space-y-3">
              {topPackages.length ? (
                topPackages.map((item, index) => (
                  <li key={item.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                        {index + 1}. {item.title}
                      </p>
                      <p className="text-xs text-[color:var(--text-muted)]">
                        {item.destination}
                      </p>
                    </div>

                    <div className="text-right text-xs text-[color:var(--text-secondary)]">
                      <p className="font-semibold text-[color:var(--text-primary)]">
                        {item.bookings} bookings
                      </p>
                      <p>{formatPKR(item.revenue)}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-sm text-[color:var(--text-muted)]">No packages yet</li>
              )}
            </ol>
          </div>

          <div className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5">
            <p className="font-semibold text-[color:var(--text-primary)]">
              Top destinations
            </p>

            <ol className="mt-3 space-y-3">
              {topDestinations.length ? (
                topDestinations.map((item, index) => (
                  <li
                    key={`${item.destination}-${index}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                      {index + 1}. {item.destination}
                    </p>

                    <div className="text-right text-xs text-[color:var(--text-secondary)]">
                      <p className="font-semibold text-[color:var(--text-primary)]">
                        {item.bookings} bookings
                      </p>
                      <p>{formatPKR(item.revenue)}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-sm text-[color:var(--text-muted)]">No destination data yet</li>
              )}
            </ol>
          </div>
        </div>
      </div>
    );
  };


  const SEARCHABLE = [
    'users',
    'hosts',
    'verification',
    'packages',
    'bookings',
    'reviews',
    'reports'
  ];

  const FILTERS = {
    users: { label: 'Role', options: ROLE_OPTIONS },
    verification: { label: 'Status', options: VERIFICATION_OPTIONS },
    hosts: { label: 'Status', options: VERIFICATION_OPTIONS },
    bookings: { label: 'Status', options: BOOKING_OPTIONS },
    reviews: { label: 'Rating', options: ['1', '2', '3', '4', '5'] },
    reports: { label: 'Status', options: REPORT_STATUS_OPTIONS }
  };

  const filterConfig = FILTERS[section];

  const renderBody = () => {
    if (loading) {
      return (
        <div
          className="flex items-center justify-center py-16"
          role="status"
        >
          <Loader2 className="w-6 h-6 animate-spin text-[color:var(--brand-primary)]" />

          <span className="sr-only">Loading admin data…</span>
        </div>
      );
    }

    if (error) {
      return (
        <div
          role="alert"
          className="rounded-xl border border-[color:var(--danger)]/35 bg-[color:var(--danger-soft)] p-4 text-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-[color:var(--danger)]">
              {error}
            </p>

            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-[color:var(--danger)]/35 px-3 py-1.5 text-xs font-semibold text-[color:var(--danger)] transition hover:bg-[color:var(--danger)]/10"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    if (section === 'overview') return renderOverview();
    if (section === 'analytics') return renderAnalytics();

    if (!rows.length) {
      return (
        <EmptyState
          message={
            appliedSearch || filter
              ? 'Nothing matches the current search and filters.'
              : 'No records yet.'
          }
        />
      );
    }

    if (section === 'users') return renderUsers();
    if (section === 'verification') return renderHostRows(true);
    if (section === 'hosts') return renderHostRows(false);
    if (section === 'packages') return renderPackages();
    if (section === 'bookings') return renderBookings();
    if (section === 'reviews') return renderReviews();
    if (section === 'reports') return renderReports();

    return null;
  };


  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)]">
      {/* Header */}

      <header className="sticky top-0 z-20 border-b border-[color:var(--border-light)] bg-[color:var(--surface-primary)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand-primary)] text-[color:var(--brand-gold)]">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-base text-[color:var(--text-primary)] sm:text-lg">
                Touristo Admin
              </h1>

              <p className="hidden text-xs text-[color:var(--text-muted)] sm:block">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border-light)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-secondary)]"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--brand-primary)] px-3 py-2 text-sm font-semibold text-[color:var(--text-inverse)] transition hover:bg-[color:var(--brand-primary-hover)]"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>


      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* Sidebar */}

        <nav className="lg:w-60 lg:shrink-0">
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTIONS.map(item => {
              const Icon = item.icon;
              const active = section === item.id;

              return (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => openSection(item.id)}
                    className={`flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-[color:var(--brand-primary)] text-[color:var(--text-inverse)]'
                        : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-primary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>


        {/* Content */}

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl text-[color:var(--text-primary)]">
              {SECTIONS.find(item => item.id === section)?.label}
            </h2>

            {(SEARCHABLE.includes(section) || filterConfig) && (
              <div className="flex flex-wrap items-center gap-2">
                {SEARCHABLE.includes(section) && (
                  <form
                    onSubmit={applySearch}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="search"
                      aria-label="Search records"
                      value={searchInput}
                      onChange={event => setSearchInput(event.target.value)}
                      placeholder="Search..."
                      className="w-44 rounded-lg border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] px-3 py-2 text-sm outline-none focus:border-[color:var(--brand-primary)]"
                    />

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border-light)] px-3 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-secondary)]"
                    >
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                  </form>
                )}

                {filterConfig && (
                  <select
                    aria-label="Filter records"
                    value={filter}
                    onChange={event => changeFilter(event.target.value)}
                    className="rounded-lg border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] px-3 py-2 text-sm font-medium text-[color:var(--text-primary)] outline-none focus:border-[color:var(--brand-primary)]"
                  >
                    <option value="">
                      All {filterConfig.label.toLowerCase()}
                    </option>

                    {filterConfig.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {notice && (
            <div className="mb-4 rounded-xl border border-[color:var(--success)]/30 bg-[color:var(--success-soft)] px-4 py-3 text-sm text-[color:var(--success)]">
              {notice}
            </div>
          )}

          {renderBody()}

          {pagination && !loading && !error && (
            <Pagination
              pagination={pagination}
              onPage={nextPage => setPage(nextPage)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardScreen;
