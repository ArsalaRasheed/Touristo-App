import './index.css';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
  Navigate
} from 'react-router-dom';

import React from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';

import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import SearchScreen from './components/SearchScreen';

import PackageDetailScreen from './components/PackageDetailScreen';
import BookingScreen from './components/BookingScreen';

import LoginSignupScreen from './components/LoginSignupScreen';
import CompanyRegistrationScreen from './components/CompanyRegistrationScreen';

import AITripPlannerScreen from './components/AITripPlannerScreen';
import EmergencySOSScreen from './components/EmergencySOSScreen';
import WeatherScreen from './components/WeatherScreen';
import MyTripsScreen from './components/MyTripsScreen';

import ProfileScreen from './components/ProfileScreen';
import HostProfileScreen from './components/HostProfileScreen';

import HostDashboardScreen from './components/HostDashboardScreen';
import CreateEditPackageScreen from './components/CreateEditPackageScreen';

import NotificationsScreen from './components/NotificationsScreen';
import SettingsScreen from './components/SettingsScreen';
import AboutScreen from './components/AboutScreen';
import ContactScreen from './components/ContactScreen';

import BottomNav from './components/BottomNav';

import DestinationsScreen from './components/DestinationsScreen';
import DestinationExploreScreen from './components/DestinationExploreScreen';

import ExperiencesScreen from './components/ExperiencesScreen';
import ExperienceDetailScreen from './components/ExperienceDetailScreen';

import HostDiscoveryScreen from './components/HostDiscoveryScreen';

import HostBookingsScreen from './components/HostBookingsScreen';
import MyPackagesScreen from './components/MyPackagesScreen';
import ManageTourGuidesScreen from './components/ManageTourGuidesScreen';

/*
|--------------------------------------------------------------------------
| CENTRALIZED MARKETPLACE COMMUNICATION
|--------------------------------------------------------------------------
| This file will be created in the next step.
*/
import InboxScreen from './components/InboxScreen';


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
        <div className="w-10 h-10 rounded-full border-4 border-[color:var(--accent-primary)]/20 border-t-[color:var(--accent-primary)] animate-spin" />
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
          user.role === 'host'
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
              404
          ====================================================== */}

          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-primary)] px-4">
                <div className="text-center">

                  <h1 className="text-5xl font-bold mb-3">
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

      </Router>

    </AuthProvider>
  );
};


function App() {
  return <AppContent />;
}

export default App;