import './index.css';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
  Navigate
} from 'react-router-dom';

import React, { Suspense } from 'react';

import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthProvider';

import BottomNav from './components/BottomNav';

/*
|--------------------------------------------------------------------------
| CODE SPLITTING
|--------------------------------------------------------------------------
| Screens are lazy loaded so the initial bundle stays small.
| BottomNav stays eager because it renders alongside every
| protected screen.
*/

const SplashScreen = React.lazy(() => import('./components/SplashScreen'));
const OnboardingScreen = React.lazy(() => import('./components/OnboardingScreen'));
const HomeScreen = React.lazy(() => import('./components/HomeScreen'));
const SearchScreen = React.lazy(() => import('./components/SearchScreen'));

const PackageDetailScreen = React.lazy(() => import('./components/PackageDetailScreen'));
const BookingScreen = React.lazy(() => import('./components/BookingScreen'));

const LoginSignupScreen = React.lazy(() => import('./components/LoginSignupScreen'));
const CompanyRegistrationScreen = React.lazy(() => import('./components/CompanyRegistrationScreen'));

const AITripPlannerScreen = React.lazy(() => import('./components/AITripPlannerScreen'));
const EmergencySOSScreen = React.lazy(() => import('./components/EmergencySOSScreen'));
const WeatherScreen = React.lazy(() => import('./components/WeatherScreen'));
const MyTripsScreen = React.lazy(() => import('./components/MyTripsScreen'));

const ProfileScreen = React.lazy(() => import('./components/ProfileScreen'));
const EditProfileScreen = React.lazy(() => import('./components/EditProfileScreen'));
const PrivacySecurityScreen = React.lazy(() => import('./components/PrivacySecurityScreen'));
const PaymentMethodsScreen = React.lazy(() => import('./components/PaymentMethodsScreen'));
const MyReportsScreen = React.lazy(() => import('./components/MyReportsScreen'));
const HostProfileScreen = React.lazy(() => import('./components/HostProfileScreen'));

const HostDashboardScreen = React.lazy(() => import('./components/HostDashboardScreen'));
const CreateEditPackageScreen = React.lazy(() => import('./components/CreateEditPackageScreen'));

const NotificationsScreen = React.lazy(() => import('./components/NotificationsScreen'));
const SettingsScreen = React.lazy(() => import('./components/SettingsScreen'));
const AboutScreen = React.lazy(() => import('./components/AboutScreen'));
const ContactScreen = React.lazy(() => import('./components/ContactScreen'));

const DestinationsScreen = React.lazy(() => import('./components/DestinationsScreen'));
const DestinationExploreScreen = React.lazy(() => import('./components/DestinationExploreScreen'));

const TravelTrendRadar = React.lazy(() => import('./components/TravelTrendRadar'));

const ExperiencesScreen = React.lazy(() => import('./components/ExperiencesScreen'));
const ExperienceDetailScreen = React.lazy(() => import('./components/ExperienceDetailScreen'));

const HostDiscoveryScreen = React.lazy(() => import('./components/HostDiscoveryScreen'));

const HostBookingsScreen = React.lazy(() => import('./components/HostBookingsScreen'));
const MyPackagesScreen = React.lazy(() => import('./components/MyPackagesScreen'));
const ManageTourGuidesScreen = React.lazy(() => import('./components/ManageTourGuidesScreen'));

/*
|--------------------------------------------------------------------------
| CENTRALIZED MARKETPLACE COMMUNICATION
|--------------------------------------------------------------------------
*/
const InboxScreen = React.lazy(() => import('./components/InboxScreen'));

const AdminDashboardScreen = React.lazy(() => import('./components/AdminDashboardScreen'));


const RouteFallback = () => (
  <div
    className="min-h-screen flex items-center justify-center bg-[color:var(--bg-primary)]"
    role="status"
  >
    <div className="w-10 h-10 rounded-full border-4 border-[color:var(--brand-primary-soft)] border-t-[color:var(--brand-primary)] animate-spin" />
    <span className="sr-only">Loading screen…</span>
  </div>
);


/*
|--------------------------------------------------------------------------
| AppWithNav
|--------------------------------------------------------------------------
*/

const AppWithNav = () => {
  const location = useLocation();

  const noNavPaths = [
    '/',
    '/onboarding',
    '/login',
    '/signup',
    '/company-reg'
  ];

  const shouldShowNav =
    !noNavPaths.includes(location.pathname);

  if (!shouldShowNav) {
    return <Outlet />;
  }

  return (
    <div className="pb-24 min-h-screen">
      <Outlet />

      <BottomNav />
    </div>
  );
};


/*
|--------------------------------------------------------------------------
| Protected Route
|--------------------------------------------------------------------------
*/

const ProtectedRoute = ({
  children,
  allowedRoles
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-primary)]">
        <div className="w-10 h-10 rounded-full border-4 border-[color:var(--brand-primary-soft)] border-t-[color:var(--brand-primary)] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={
          user.role === 'admin'
            ? '/admin-dashboard'
            : user.role === 'host'
              ? '/host-dashboard'
              : '/home'
        }
        replace
      />
    );
  }

  return children;
};


/*
|--------------------------------------------------------------------------
| Main App Content
|--------------------------------------------------------------------------
*/

const AppContent = () => {
  return (
    <AuthProvider>

      <Router>

        <Suspense fallback={<RouteFallback />}>

        <Routes>

          {/* ======================================================
              ROUTES WITH BOTTOM NAV
          ====================================================== */}

          <Route element={<AppWithNav />}>

            {/* ====================================================
                TRAVELER
            ==================================================== */}

            <Route
              path="/home"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <HomeScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/search"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <SearchScreen />
                </ProtectedRoute>
              }
            />

            {/* Destinations */}

            <Route
              path="/destinations"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <DestinationsScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/destination/:destination"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <DestinationExploreScreen />
                </ProtectedRoute>
              }
            />

            {/* Experiences */}

            <Route
              path="/experiences"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <ExperiencesScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/experiences/:experienceId"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <ExperienceDetailScreen />
                </ProtectedRoute>
              }
            />

            {/* Hosts */}

            <Route
              path="/host-discovery"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <HostDiscoveryScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/host-profile/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <HostProfileScreen />
                </ProtectedRoute>
              }
            />

            {/* Package */}

            <Route
              path="/package/:id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <PackageDetailScreen />
                </ProtectedRoute>
              }
            />

            {/* Booking */}

            <Route
              path="/booking"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <BookingScreen />
                </ProtectedRoute>
              }
            />

            {/* AI Planner */}

            <Route
              path="/trip-planner"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <AITripPlannerScreen />
                </ProtectedRoute>
              }
            />

            {/* SOS */}

            <Route
              path="/sos"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <EmergencySOSScreen />
                </ProtectedRoute>
              }
            />

            {/* Weather */}

            <Route
              path="/weather"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <WeatherScreen />
                </ProtectedRoute>
              }
            />

            {/* My Trips */}

            <Route
              path="/my-trips"
              element={
                <ProtectedRoute
                  allowedRoles={['traveler']}
                >
                  <MyTripsScreen />
                </ProtectedRoute>
              }
            />


            {/* ====================================================
                CENTRALIZED COMMUNICATION
            ==================================================== */}

            <Route
              path="/inbox"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <InboxScreen />
                </ProtectedRoute>
              }
            />


            {/* ====================================================
                HOST DASHBOARD
            ==================================================== */}

            <Route
              path="/host-dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={['host']}
                >
                  <HostDashboardScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-packages"
              element={
                <ProtectedRoute
                  allowedRoles={['host']}
                >
                  <MyPackagesScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/host/create-package"
              element={
                <ProtectedRoute
                  allowedRoles={['host']}
                >
                  <CreateEditPackageScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/host/guides"
              element={
                <ProtectedRoute
                  allowedRoles={['host']}
                >
                  <ManageTourGuidesScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedRoute
                  allowedRoles={['host']}
                >
                  <HostBookingsScreen />
                </ProtectedRoute>
              }
            />


            {/* ====================================================
                SHARED
            ==================================================== */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <ProfileScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <EditProfileScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/privacy-security"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <PrivacySecurityScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment-methods"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <PaymentMethodsScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-reports"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <MyReportsScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <NotificationsScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <SettingsScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/about"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <AboutScreen />
                </ProtectedRoute>
              }
            />

            <Route
              path="/contact"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    'traveler',
                    'host'
                  ]}
                >
                  <ContactScreen />
                </ProtectedRoute>
              }
            />

          </Route>


          {/* ======================================================
              ROUTES WITHOUT BOTTOM NAV
          ====================================================== */}

          <Route
            path="/"
            element={<SplashScreen />}
          />

          <Route
            path="/onboarding"
            element={<OnboardingScreen />}
          />

          <Route
            path="/login"
            element={<LoginSignupScreen />}
          />

          <Route
            path="/signup"
            element={<LoginSignupScreen />}
          />

          <Route
            path="/company-reg"
            element={
              <CompanyRegistrationScreen />
            }
          />

          {/* ======================================================
              TRAVEL TREND RADAR
          ====================================================== */}

          <Route
            path="/travel-radar"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'traveler',
                  'host'
                ]}
              >
                <TravelTrendRadar />
              </ProtectedRoute>
            }
          />


          {/* ======================================================
              ADMIN DASHBOARD
          ====================================================== */}

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              >
                <AdminDashboardScreen />
              </ProtectedRoute>
            }
          />


          {/* ======================================================
              404
          ====================================================== */}

          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-primary)] px-4">
                <div className="text-center">

                  <h1 className="text-5xl mb-3">
                    404
                  </h1>

                  <p className="text-[color:var(--text-secondary)] mb-6">
                    The page you are looking for does not exist.
                  </p>

                  <Navigate
                    to="/home"
                    replace
                  />

                </div>
              </div>
            }
          />

        </Routes>

        </Suspense>

      </Router>

    </AuthProvider>
  );
};


function App() {
  return <AppContent />;
}

export default App;