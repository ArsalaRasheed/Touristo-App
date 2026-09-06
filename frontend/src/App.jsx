import './index.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom'; // Import useLocation and Outlet
import React from 'react'; // Import React
import { AuthProvider, useAuth } from './context/AuthContext'; // Import Auth context
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
import BottomNav from './components/BottomNav'; // Import the BottomNav
import DestinationsScreen from './components/DestinationsScreen';
import ExperiencesScreen from './components/ExperiencesScreen';
import HostDiscoveryScreen from './components/HostDiscoveryScreen';
import HostBookingsScreen from './components/HostBookingsScreen'; // Import HostBookingsScreen
import DestinationExploreScreen from './components/DestinationExploreScreen'; // Import DestinationExploreScreen
import MyPackagesScreen from './components/MyPackagesScreen'; // Import MyPackagesScreen
import ManageTourGuidesScreen from './components/ManageTourGuidesScreen';
import ExperienceDetailScreen from './components/ExperienceDetailScreen';

// Wrapper component to conditionally render BottomNav based on user role
const AppWithNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const noNavPaths = ['/', '/onboarding', '/login', '/signup', '/company-reg']; // Paths where nav is not shown

  const shouldShowNav = !noNavPaths.includes(location.pathname);
  
  // Define navigation based on user role
  if (!shouldShowNav) {
    return <Outlet />;
  }

  return (
    <div className="pb-24 min-h-screen"> {/* Increased pb from 20 to 24 to account for bottom nav */}
      <Outlet /> {/* This renders the child route components */}
      {shouldShowNav && <BottomNav />}
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={user.role === 'host' ? "/host-dashboard" : "/home"} replace />;
  }
  
  return children;
};

// Main App component wrapped with AuthProvider
const AppContent = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Wrap routes that need the bottom nav - now using proper nested routing */}
          <Route element={<AppWithNav />}>
            {/* Traveler routes */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <HomeScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/search" 
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <SearchScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/destinations" 
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <DestinationsScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/destination/:destination" 
              element={
                <ProtectedRoute allowedRoles={['traveler', 'host']}>
                  <DestinationExploreScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/experiences" 
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <ExperiencesScreen />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/experiences/:experienceId"
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <ExperienceDetailScreen />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/host-discovery" 
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <HostDiscoveryScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/package/:id" 
              element={
                <ProtectedRoute allowedRoles={['traveler', 'host']}>
                  <PackageDetailScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/booking" 
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <BookingScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trip-planner" 
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <AITripPlannerScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sos" 
              element={
                <ProtectedRoute allowedRoles={['traveler', 'host']}>
                  <EmergencySOSScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/weather" 
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <WeatherScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-trips" 
              element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <MyTripsScreen />
                </ProtectedRoute>
              } 
            />
            
            {/* Host routes */}
            <Route 
              path="/host-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <HostDashboardScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-packages" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <MyPackagesScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/create-package" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <CreateEditPackageScreen />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/host/guides"
              element={<ProtectedRoute allowedRoles={['host']}><ManageTourGuidesScreen /></ProtectedRoute>}
            />
            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute allowedRoles={['host']}>
                  <HostBookingsScreen />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared routes */}
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/host-profile/:id" element={<HostProfileScreen />} />
            <Route path="/notifications" element={<NotificationsScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/contact" element={<ContactScreen />} />
          </Route>

          {/* Routes without bottom nav */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/login" element={<LoginSignupScreen />} />
          <Route path="/signup" element={<LoginSignupScreen />} />
          <Route path="/company-reg" element={<CompanyRegistrationScreen />} />

          {/* Catch-all for any undefined routes */}
          <Route path="*" element={
            <div className="p-4 text-center text-[color:var(--text-secondary)]">Page Not Found</div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

function App() {
  return <AppContent />;
};

export default App;