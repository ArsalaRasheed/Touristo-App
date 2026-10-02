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
  UserRound,
  Mail,
  Building2,
  Clock3,
  Sparkles,
  Globe2,
  WalletCards
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
            const hostDataResult = await hostResponse.json();
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
      <div className="min-h-screen bg-[color:var(--bg-primary)] px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-8 text-center shadow-[var(--shadow-md)]">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--brand-primary-soft)]">
            <div className="h-6 w-6 rounded-full border-2 border-[color:var(--brand-primary-soft)] border-t-[color:var(--brand-gold)] animate-spin" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-[color:var(--text-primary)]">
            Loading your profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            Preparing your account details.
          </p>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] px-4 py-10 flex items-center justify-center">

        <div className="w-full max-w-md rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-8 text-center shadow-[var(--shadow-md)]">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--danger-soft)] text-[color:var(--danger)]">
            <Shield className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-[color:var(--text-primary)]">
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

  const memberYear = userData?.created_at
    ? new Date(userData.created_at).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-10 sm:px-6 sm:py-9 lg:px-8">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <header className="mb-7 sm:mb-9">

          <div className="flex items-end justify-between gap-4">

            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[color:var(--brand-gold)]">
                <Sparkles className="h-3.5 w-3.5" />
                Account
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--text-secondary)] sm:text-base">
                Manage your account, trips, preferences, and activity
                from one place.
              </p>
            </div>

          </div>

        </header>

        {/* =====================================================
            PROFILE HERO
        ===================================================== */}

        <section className="relative mb-6 overflow-hidden rounded-[30px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] shadow-[var(--shadow-md)]">

          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[color:var(--brand-gold-soft)] opacity-70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[color:var(--brand-primary-soft)] opacity-70 blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* Avatar */}

              <div className="relative shrink-0">

                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-[color:var(--brand-primary)] shadow-[var(--shadow-lg)] sm:h-28 sm:w-28">

                  <span className="text-4xl font-semibold text-white sm:text-5xl">
                    {initial}
                  </span>

                </div>

                <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[color:var(--surface-primary)] bg-[color:var(--brand-gold)] text-white shadow-sm">
                  <UserRound className="h-4 w-4" />
                </div>

              </div>

              {/* User information */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="max-w-full truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                    {displayName}
                  </h2>

                  {isHost && hostData?.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-gold-soft)] px-2.5 py-1 text-xs font-semibold text-[color:var(--brand-primary)]">
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        fill="currentColor"
                        strokeWidth={1.5}
                      />
                      Verified
                    </span>
                  )}

                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[color:var(--text-secondary)]">

                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-[color:var(--brand-gold)]" />
                    {userData?.email}
                  </span>

                  {memberYear && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-[color:var(--brand-gold)]" />
                      Member since {memberYear}
                    </span>
                  )}

                </div>

                <div className="mt-4 flex flex-wrap gap-2">

                  <span className="inline-flex items-center rounded-full bg-[color:var(--brand-primary-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand-primary)]">
                    {isHost ? 'Tour Company' : 'Traveler'}
                  </span>

                  {isHost && hostData?.rating && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-secondary)]">
                      <Star
                        className="h-3.5 w-3.5 text-[color:var(--brand-gold)]"
                        fill="currentColor"
                      />
                      {hostData.rating}/5 rating
                    </span>
                  )}

                </div>

              </div>

              {/* Settings */}

              <div className="flex flex-col sm:flex-col gap-2 shrink-0">

                <Link
                  to="/profile/edit"
                  className="btn btn-primary"
                >
                  <UserRound className="w-4 h-4" />
                  Edit Profile
                </Link>

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
          className="group mb-6 flex items-center justify-between gap-4 overflow-hidden rounded-[26px] bg-[color:var(--brand-primary)] p-5 text-white shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] sm:p-6"
        >

          <div className="flex min-w-0 items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              {isHost ? (
                <LayoutDashboard className="h-6 w-6" />
              ) : (
                <Luggage className="h-6 w-6" />
              )}
            </div>

            <div className="min-w-0">

              <p className="text-lg font-semibold">
                {isHost ? 'Go to Dashboard' : 'My Trips'}
              </p>

              <p className="mt-1 text-sm leading-5 text-white/70">
                {isHost
                  ? 'Manage packages, bookings, and customer inquiries.'
                  : 'View your bookings and upcoming travel plans.'}
              </p>

            </div>

          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </div>

        </Link>

        {/* =====================================================
            MESSAGES
        ===================================================== */}

        <Link
          to="/inbox"
          className="group mb-7 flex items-center justify-between gap-4 rounded-[26px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] sm:p-6"
        >

          <div className="flex min-w-0 items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
              <MessageCircle className="h-6 w-6" />
            </div>

            <div className="min-w-0">

              <p className="text-lg font-semibold">
                Messages & Inbox
              </p>

              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                {isHost
                  ? 'Respond to traveler inquiries.'
                  : 'Chat directly with tour hosts.'}
              </p>

            </div>

          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-secondary)]">
            <ChevronRight className="h-4 w-4 text-[color:var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
          </div>

        </Link>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="mb-7">

          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Overview
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                {isHost ? 'Business overview' : 'Travel overview'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

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

        </section>

        {/* =====================================================
            HOST INFORMATION
        ===================================================== */}

        {isHost && hostData && (
          <section className="mb-7 rounded-[26px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-sm)] sm:p-7">

            <SectionHeader
              icon={Building2}
              title="Company Information"
              subtitle="Your public host profile details."
            />

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">

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
                  hostData.license_number || 'Not specified'
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

            <div className="mt-6 border-t border-[color:var(--border-light)] pt-5">

              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                Description
              </p>

              <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                {hostData.description ||
                  'No company description provided.'}
              </p>

            </div>

          </section>
        )}

        {/* =====================================================
            FAVORITES / PACKAGES
        ===================================================== */}

        <section className="mb-7 rounded-[26px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-sm)] sm:p-7">

          <SectionHeader
            icon={isHost ? Package : Heart}
            title={
              isHost
                ? 'My Packages'
                : 'Favorite Destinations'
            }
            subtitle={
              isHost
                ? 'Packages currently associated with your account.'
                : 'Places you have saved for later.'
            }
          />

          <div className="mt-6">

            {isHost ? (
              hostData?.packages?.length > 0 ? (
                <div className="space-y-3">

                  {hostData.packages.map((pkg, index) => (

                    <div
                      key={index}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] p-4 transition-all duration-200 hover:border-[color:var(--brand-gold-light)] hover:bg-[color:var(--brand-gold-soft)]"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
                          <Package className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">
                            {pkg.title}
                          </p>

                          <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                            PKR{' '}
                            {Number(
                              pkg.price || 0
                            ).toLocaleString()}
                            {' '}• {pkg.duration_days} days
                          </p>

                        </div>

                      </div>

                      <span className="shrink-0 rounded-full bg-[color:var(--success-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--success)]">
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
                        className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary-soft)] px-4 py-2.5 text-sm font-medium text-[color:var(--brand-primary)]"
                      >
                        <MapPin className="h-3.5 w-3.5" />
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

          </div>

        </section>

        {/* =====================================================
            REVIEWS
        ===================================================== */}

        {!isHost && user?.id && (
          <section className="mb-7">

            <div className="mb-4">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Your Reviews
              </h2>

            </div>

            <div className="overflow-hidden rounded-[26px]">
              <ReviewManager userId={user.id} />
            </div>

          </section>
        )}

        {/* =====================================================
            ACCOUNT SETTINGS
        ===================================================== */}

        <section className="rounded-[26px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-sm)] sm:p-7">

          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-gold)]">
                Preferences
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Account Settings
              </h2>

              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                Manage privacy, payments, notifications, and preferences.
              </p>
            </div>

            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-gold)] sm:flex">
              <Settings className="h-5 w-5" />
            </div>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">

            <SettingLink
              to="/privacy-security"
              icon={Shield}
              title="Privacy & Security"
              description="Manage profile visibility and privacy"
            />

            <SettingLink
              to="/payment-methods"
              icon={WalletCards}
              title="Payment Methods"
              description="Manage your payment preferences"
            />

            <SettingLink
              to="/notifications"
              icon={Bell}
              title="Notifications"
              description="Manage notification preferences"
            />

            <SettingLink
              to="/settings"
              icon={Globe2}
              title="All Settings"
              description="Language, currency and account settings"
            />

          </div>

        </section>

      </div>

    </div>
  );
};


/* =============================================================
   REUSABLE COMPONENTS
============================================================= */

const SectionHeader = ({
  icon: Icon,
  title,
  subtitle
}) => (
  <div className="flex items-center gap-3">

    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
      <Icon className="h-5 w-5" />
    </div>

    <div className="min-w-0">

      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-0.5 text-sm text-[color:var(--text-secondary)]">
        {subtitle}
      </p>

    </div>

  </div>
);


const StatCard = ({
  icon: Icon,
  value,
  label
}) => (
  <div className="group rounded-[22px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">

    <div className="flex items-center justify-between gap-3">

      <div className="min-w-0">

        <p className="truncate text-2xl font-semibold tracking-tight text-[color:var(--brand-primary)]">
          {value}
        </p>

        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          {label}
        </p>

      </div>

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] transition-transform duration-200 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>

    </div>

  </div>
);


const InfoItem = ({
  label,
  value,
  icon: Icon
}) => (
  <div className="rounded-2xl bg-[color:var(--surface-secondary)] p-4">

    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
      {label}
    </p>

    <div className="mt-2 flex items-center gap-2">

      {Icon && (
        <Icon className="h-4 w-4 shrink-0 text-[color:var(--brand-gold)]" />
      )}

      <p className="truncate text-sm font-semibold text-[color:var(--text-primary)]">
        {value}
      </p>

    </div>

  </div>
);


const EmptyState = ({
  icon: Icon,
  text
}) => (
  <div className="rounded-2xl border border-dashed border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] py-10 text-center">

    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--surface-primary)] text-[color:var(--text-muted)] shadow-[var(--shadow-xs)]">
      <Icon className="h-5 w-5" />
    </div>

    <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
      {text}
    </p>

  </div>
);


const SettingLink = ({
  to,
  icon: Icon,
  title,
  description
}) => (
  <Link
    to={to}
    className="group flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-[color:var(--surface-secondary)] p-4 transition-all duration-200 hover:border-[color:var(--border-light)] hover:bg-[color:var(--brand-primary-soft)]"
  >

    <div className="flex min-w-0 items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--surface-primary)] text-[color:var(--brand-primary)] shadow-[var(--shadow-xs)]">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">

        <span className="block text-sm font-semibold text-[color:var(--text-primary)]">
          {title}
        </span>

        <span className="mt-0.5 block truncate text-xs text-[color:var(--text-muted)]">
          {description}
        </span>

      </div>

    </div>

    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-primary)]">
      <ChevronRight className="h-4 w-4 text-[color:var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
    </div>

  </Link>
);


export default ProfileScreen;