import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReviewManager from './ReviewManager';

import {
  Settings,
  Luggage,
  Star,
  Heart,
  Shield,
  CreditCard,
  Bell,
  MessageCircle,
  LayoutDashboard,
  ChevronRight,
  MapPin,
  CalendarDays,
  Package,
  CheckCircle2,
  ArrowRight,
  UserRound
} from 'lucide-react';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [hostData, setHostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        const userResponse = await fetch(`/api/users/${user.id}`);

        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`);
        }

        const userDataResult = await userResponse.json();

        const enhancedUserData = {
          ...userDataResult.data.user,
          totalTrips: userDataResult.data.stats?.totalTrips || 0,
          totalReviews: userDataResult.data.stats?.totalReviews || 0,
          totalFavorites: userDataResult.data.stats?.totalFavorites || 0,
          favoriteDestinations:
            userDataResult.data.favorites || []
        };

        setUserData(enhancedUserData);

        if (user.role === 'host') {
          const hostResponse = await fetch(
            `/api/hosts/user/${user.id}`
          );

          if (hostResponse.ok) {
            const hostDataResult =
              await hostResponse.json();

            setHostData(hostDataResult.data.host);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);

        setError(err.message);

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
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-5">
        <div className="w-full max-w-sm bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[28px] p-8 text-center shadow-[var(--shadow-md)]">
          <div className="mx-auto w-11 h-11 rounded-full border-2 border-[color:var(--brand-primary-soft)] border-t-[color:var(--brand-gold)] animate-spin" />

          <h2 className="mt-5 text-lg font-semibold text-[color:var(--text-primary)]">
            Loading your profile
          </h2>

          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            Preparing your account details.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-5">
        <div className="w-full max-w-md bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[28px] p-8 text-center shadow-[var(--shadow-md)]">

          <div className="w-14 h-14 mx-auto rounded-full bg-[color:var(--danger-soft)] text-[color:var(--danger)] flex items-center justify-center text-xl font-bold">
            !
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-6"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  const isHost = user?.role === 'host';

  const displayName = isHost
    ? hostData?.company_name || userData?.name || 'Tour Host'
    : userData?.name || 'Traveler';

  const initial =
    displayName?.trim()?.charAt(0)?.toUpperCase() || 'T';

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">

          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[color:var(--brand-gold)]">
            Account
          </p>

          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
            My Profile
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[color:var(--text-secondary)]">
            Manage your account, trips, preferences, and activity.
          </p>

        </div>

        {/* =====================================================
            PROFILE HERO
        ===================================================== */}

        <section className="relative overflow-hidden bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[28px] shadow-[var(--shadow-md)] mb-6">

          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[color:var(--brand-gold-soft)] blur-3xl opacity-60 pointer-events-none" />

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">

              {/* Avatar */}

              <div className="shrink-0">

                <div className="w-24 h-24 rounded-[26px] bg-[color:var(--brand-primary)] flex items-center justify-center shadow-[var(--shadow-md)]">

                  <span className="text-3xl font-semibold text-white">
                    {initial}
                  </span>

                </div>

              </div>

              {/* Information */}

              <div className="flex-1 min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight truncate">
                    {displayName}
                  </h2>

                  {isHost && hostData?.verified && (
                    <CheckCircle2
                      className="w-5 h-5 text-[color:var(--brand-gold)]"
                      fill="currentColor"
                      strokeWidth={1.5}
                    />
                  )}

                </div>

                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                  {userData?.email}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  <span className="badge badge-gold">
                    {isHost
                      ? 'Tour Company'
                      : 'Traveler'}
                  </span>

                  {userData?.created_at && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color:var(--surface-secondary)] text-xs text-[color:var(--text-secondary)] border border-[color:var(--border-light)]">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Member since{' '}
                      {new Date(
                        userData.created_at
                      ).getFullYear()}
                    </span>
                  )}

                </div>

              </div>

              {/* Actions */}

              <div className="flex sm:flex-col gap-2 shrink-0">

                <Link
                  to="/settings"
                  className="btn btn-secondary"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            PRIMARY ACTION
        ===================================================== */}

        <Link
          to={isHost ? '/host-dashboard' : '/my-trips'}
          className="group flex items-center justify-between gap-4 bg-[color:var(--brand-primary)] text-white rounded-[24px] p-5 sm:p-6 mb-6 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-300"
        >

          <div className="flex items-center gap-4 min-w-0">

            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              {isHost ? (
                <LayoutDashboard className="w-6 h-6" />
              ) : (
                <Luggage className="w-6 h-6" />
              )}
            </div>

            <div className="min-w-0">

              <p className="font-semibold text-lg">
                {isHost
                  ? 'Go to Dashboard'
                  : 'My Trips'}
              </p>

              <p className="mt-1 text-sm text-white/70">
                {isHost
                  ? 'Manage packages, bookings, and customer inquiries.'
                  : 'View your bookings and upcoming travel plans.'}
              </p>

            </div>

          </div>

          <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />

        </Link>

        {/* =====================================================
            MESSAGES
        ===================================================== */}

        <Link
          to="/inbox"
          className="group flex items-center justify-between gap-4 bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[24px] p-5 sm:p-6 mb-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300"
        >

          <div className="flex items-center gap-4 min-w-0">

            <div className="w-12 h-12 rounded-2xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>

            <div className="min-w-0">

              <p className="font-semibold text-lg">
                Messages & Inbox
              </p>

              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                {isHost
                  ? 'Respond to traveler inquiries.'
                  : 'Chat directly with tour hosts.'}
              </p>

            </div>

          </div>

          <ChevronRight className="w-5 h-5 text-[color:var(--text-muted)] group-hover:translate-x-1 transition-transform" />

        </Link>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          {isHost ? (
            <>
              <StatCard
                icon={Package}
                value={hostData?.packages_count || 0}
                label="Packages"
              />

              <StatCard
                icon={CalendarDays}
                value={hostData?.total_bookings || 0}
                label="Bookings"
              />

              <StatCard
                icon={CreditCard}
                value={
                  hostData?.revenue
                    ? `PKR ${Number(
                        hostData.revenue
                      ).toLocaleString()}`
                    : '0'
                }
                label="Revenue"
              />
            </>
          ) : (
            <>
              <StatCard
                icon={Luggage}
                value={userData?.totalTrips || 0}
                label="Trips Taken"
              />

              <StatCard
                icon={Star}
                value={userData?.totalReviews || 0}
                label="Reviews"
              />

              <StatCard
                icon={Heart}
                value={userData?.totalFavorites || 0}
                label="Favorites"
              />
            </>
          )}

        </div>

        {/* =====================================================
            HOST INFORMATION
        ===================================================== */}

        {isHost && hostData && (
          <section className="bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[24px] p-6 sm:p-7 mb-6 shadow-[var(--shadow-sm)]">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-gold)] flex items-center justify-center">
                <UserRound className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Company Information
                </h2>

                <p className="text-sm text-[color:var(--text-secondary)]">
                  Your public host profile details.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <InfoItem
                label="Company Name"
                value={hostData.company_name}
              />

              <InfoItem
                label="Location"
                value={hostData.location || 'Not specified'}
                icon={MapPin}
              />

              <InfoItem
                label="License Number"
                value={
                  hostData.license_number ||
                  'Not specified'
                }
              />

              <InfoItem
                label="Rating"
                value={
                  hostData.rating
                    ? `${hostData.rating}/5`
                    : 'Unrated'
                }
                icon={Star}
              />

            </div>

            <div className="mt-5 pt-5 border-t border-[color:var(--border-light)]">

              <p className="text-xs uppercase tracking-wider font-semibold text-[color:var(--text-muted)]">
                Description
              </p>

              <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                {hostData.description ||
                  'No description provided.'}
              </p>

            </div>

          </section>
        )}

        {/* =====================================================
            FAVORITES / PACKAGES
        ===================================================== */}

        <section className="bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[24px] p-6 sm:p-7 mb-6 shadow-[var(--shadow-sm)]">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center">

              {isHost ? (
                <Package className="w-5 h-5" />
              ) : (
                <Heart className="w-5 h-5" />
              )}

            </div>

            <div>

              <h2 className="text-xl font-semibold">
                {isHost
                  ? 'My Packages'
                  : 'Favorite Destinations'}
              </h2>

              <p className="text-sm text-[color:var(--text-secondary)]">
                {isHost
                  ? 'Packages currently associated with your account.'
                  : 'Places you have saved for later.'}
              </p>

            </div>

          </div>

          {isHost ? (
            hostData?.packages?.length > 0 ? (
              <div className="space-y-3">

                {hostData.packages.map((pkg, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[color:var(--surface-secondary)] border border-[color:var(--border-light)]"
                  >

                    <div className="min-w-0">

                      <p className="font-medium truncate">
                        {pkg.title}
                      </p>

                      <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                        PKR{' '}
                        {Number(
                          pkg.price || 0
                        ).toLocaleString()}{' '}
                        • {pkg.duration_days} days
                      </p>

                    </div>

                    <span className="shrink-0 badge badge-success">
                      {pkg.bookings || 0} bookings
                    </span>

                  </div>

                ))}

              </div>
            ) : (
              <EmptyState
                icon={Package}
                text="No packages created yet."
              />
            )
          ) : (
            userData?.favoriteDestinations?.length > 0 ? (
              <div className="flex flex-wrap gap-2">

                {userData.favoriteDestinations.map(
                  (dest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-2 rounded-full bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] text-sm font-medium"
                    >
                      {dest}
                    </span>
                  )
                )}

              </div>
            ) : (
              <EmptyState
                icon={Heart}
                text="No favorite destinations yet."
              />
            )
          )}

        </section>

        {/* =====================================================
            REVIEWS
        ===================================================== */}

        {!isHost && user?.id && (
          <div className="mb-6">
            <ReviewManager userId={user.id} />
          </div>
        )}

        {/* =====================================================
            ACCOUNT SETTINGS
        ===================================================== */}

        <section className="bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[24px] p-6 sm:p-7 shadow-[var(--shadow-sm)]">

          <div className="mb-5">

            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[color:var(--brand-gold)]">
              Preferences
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Account Settings
            </h2>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

            <SettingLink
              to="/settings"
              icon={Shield}
              title="Privacy & Security"
            />

            <SettingLink
              to="/settings"
              icon={CreditCard}
              title="Payment Methods"
            />

            <SettingLink
              to="/notifications"
              icon={Bell}
              title="Notifications"
            />

            <SettingLink
              to="/settings"
              icon={Settings}
              title="All Settings"
            />

          </div>

        </section>

      </div>

    </div>
  );
};

const StatCard = ({
  icon: Icon,
  value,
  label
}) => (
  <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[22px] p-5 shadow-[var(--shadow-sm)]">

    <div className="flex items-center justify-between gap-3">

      <div>
        <p className="text-2xl font-semibold text-[color:var(--brand-primary)]">
          {value}
        </p>

        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          {label}
        </p>
      </div>

      <div className="w-10 h-10 rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>

    </div>

  </div>
);

const InfoItem = ({
  label,
  value,
  icon: Icon
}) => (
  <div>

    <p className="text-xs uppercase tracking-wider font-semibold text-[color:var(--text-muted)]">
      {label}
    </p>

    <div className="mt-1 flex items-center gap-2">

      {Icon && (
        <Icon className="w-4 h-4 text-[color:var(--brand-gold)]" />
      )}

      <p className="font-medium">
        {value}
      </p>

    </div>

  </div>
);

const EmptyState = ({
  icon: Icon,
  text
}) => (
  <div className="py-8 text-center">

    <div className="w-12 h-12 mx-auto rounded-2xl bg-[color:var(--surface-secondary)] text-[color:var(--text-muted)] flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>

    <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
      {text}
    </p>

  </div>
);

const SettingLink = ({
  to,
  icon: Icon,
  title
}) => (
  <Link
    to={to}
    className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-[color:var(--surface-secondary)] border border-transparent hover:border-[color:var(--border-light)] hover:bg-[color:var(--brand-primary-soft)] transition-all duration-200"
  >

    <div className="flex items-center gap-3">

      <div className="w-9 h-9 rounded-xl bg-[color:var(--surface-primary)] text-[color:var(--brand-primary)] flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>

      <span className="text-sm font-medium">
        {title}
      </span>

    </div>

    <ChevronRight className="w-4 h-4 text-[color:var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />

  </Link>
);

export default ProfileScreen;