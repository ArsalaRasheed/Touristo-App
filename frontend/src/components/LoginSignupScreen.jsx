import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginSignupScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isTraveler, setIsTraveler] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    phone: '',
    cnicOrBusinessRegistration: '',
    companyAddress: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      /*
       * ============================
       * LOGIN
       * ============================
       */
      if (isLogin) {
        if (!isValidEmail(formData.email)) {
          throw new Error('Invalid email format');
        }

        const response = await fetch(
          '/api/users/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            })
          }
        );

        let data;

        try {
          data = await response.json();
        } catch {
          throw new Error('Invalid server response');
        }

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        const userData = data.data?.user || {};
        const token = data.token;

        if (!userData.id) {
          throw new Error('User information was not returned by the server');
        }

        if (!userData.role) {
          throw new Error('Role not found in user data');
        }

        if (!token) {
          throw new Error('Authentication token was not returned by the server');
        }

        /*
         * Save login information
         */
        login(userData, token);

        /*
         * Redirect according to role
         */
        if (userData.role === 'host') {
          navigate('/host-dashboard');
        } else {
          navigate('/home');
        }

        return;
      }

      /*
       * ============================
       * SIGNUP
       * ============================
       */

      if (!isValidEmail(formData.email)) {
        throw new Error('Invalid email format');
      }

      const signupData = {
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: isTraveler ? 'traveler' : 'host'
      };

      /*
       * Traveler name OR company name
       */
      if (isTraveler) {
        signupData.name = formData.name;
      } else {
        signupData.name = formData.companyName;
      }

      /*
       * Create user account
       */
      const response = await fetch(
        '/api/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(signupData)
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error('Invalid server response during signup');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      const userData = data.data?.user || {};
      const token = data.token;

      if (!userData.id) {
        throw new Error(
          'Account was created but user information was not returned.'
        );
      }

      if (!userData.role) {
        throw new Error('Role not found in user data');
      }

      if (!token) {
        throw new Error(
          'Account was created but authentication token was not returned.'
        );
      }

      /*
       * ============================
       * HOST SIGNUP
       * ============================
       *
       * IMPORTANT:
       * A host needs TWO records:
       *
       * 1. users table
       * 2. hosts table
       *
       * Previously, if hosts table creation failed,
       * the app ignored the error and still opened
       * the dashboard. That caused:
       *
       * GET /api/hosts/user/13 -> 404
       *
       * Now we stop signup if the host profile
       * cannot be created.
       */
      if (!isTraveler) {
        const hostResponse = await fetch(
          '/api/hosts',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              user_id: userData.id,
              company_name: formData.companyName,
              description: 'New tour company',
              location: 'Pakistan',
              license_number: 'TEMP-' + Date.now(),
              cnic_or_business_registration:
                formData.cnicOrBusinessRegistration,
              company_address: formData.companyAddress
            })
          }
        );

        let hostData = null;

        try {
          hostData = await hostResponse.json();
        } catch {
          // If response is not JSON, hostData stays null
        }

        /*
         * DO NOT ignore host creation failure.
         */
        if (!hostResponse.ok) {
          console.error(
            'Error creating host record:',
            hostData
          );

          throw new Error(
            hostData?.message ||
            'Your account was created, but your company profile could not be created. Please try registering again.'
          );
        }

        /*
         * Verify that backend actually returned host data.
         */
        if (!hostData?.data?.host?.id) {
          console.error(
            'Host creation response did not contain a host ID:',
            hostData
          );

          throw new Error(
            'Your account was created, but your company profile could not be linked to your account.'
          );
        }
      }

      /*
       * Save user authentication AFTER successful
       * user + host creation.
       */
      login(userData, token);

      /*
       * Redirect according to role.
       */
      if (userData.role === 'host') {
        navigate('/host-dashboard');
      } else {
        navigate('/home');
      }

    } catch (err) {
      console.error('Authentication error:', err);

      setError(
        err.message ||
        'An error occurred during authentication'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-primary)] p-4">

      <div className="w-full max-w-md bg-[color:var(--surface-primary)] p-8 rounded-2xl shadow-xl border border-[color:var(--border-primary)]">

        <h1 className="text-3xl font-bold text-center mb-6 text-[color:var(--text-primary)]">
          {isLogin ? 'Welcome Back!' : 'Join Touristo'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isLogin ? (
          <p className="text-center text-[color:var(--text-secondary)] mb-8">
            Sign in to continue your journey.
          </p>
        ) : (
          <div className="mb-6">

            <p className="text-center text-[color:var(--text-secondary)] mb-4">
              Are you a traveler or a tour company?
            </p>

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => setIsTraveler(true)}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  isTraveler
                    ? 'bg-[color:var(--accent-primary)] text-[color:var(--nav-text)]'
                    : 'bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)]'
                }`}
              >
                I'm a Traveler
              </button>

              <button
                type="button"
                onClick={() => setIsTraveler(false)}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  !isTraveler
                    ? 'bg-[color:var(--accent-primary)] text-[color:var(--nav-text)]'
                    : 'bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)]'
                }`}
              >
                I'm a Tour Company
              </button>

            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* COMPANY NAME */}
          {!isLogin && !isTraveler && (
            <div className="mb-4">

              <label
                htmlFor="companyName"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Company Name
              </label>

              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required={!isTraveler}
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="Enter your company name"
              />

            </div>
          )}

          {/* TRAVELER NAME */}
          {!isLogin && isTraveler && (
            <div className="mb-4">

              <label
                htmlFor="name"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Full Name
              </label>

              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={isTraveler}
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="Enter your name"
              />

            </div>
          )}

          {/* PHONE */}
          {!isLogin && (
            <div className="mb-4">

              <label
                htmlFor="phone"
                className="block text-[color:var(--text-secondary)] mb-1"
              >
                Phone Number
              </label>

              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="Enter your phone number"
              />

            </div>
          )}

          {/* COMPANY EXTRA FIELDS */}
          {!isLogin && !isTraveler && (
            <>

              <div className="mb-4">

                <label
                  htmlFor="cnicOrBusinessRegistration"
                  className="block text-[color:var(--text-secondary)] mb-1"
                >
                  CNIC or Business Registration Number
                </label>

                <input
                  type="text"
                  id="cnicOrBusinessRegistration"
                  name="cnicOrBusinessRegistration"
                  value={formData.cnicOrBusinessRegistration}
                  onChange={handleChange}
                  required={!isTraveler}
                  className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  placeholder="Enter CNIC or business registration number"
                />

              </div>

              <div className="mb-4">

                <label
                  htmlFor="companyAddress"
                  className="block text-[color:var(--text-secondary)] mb-1"
                >
                  Company Address
                </label>

                <textarea
                  id="companyAddress"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  required={!isTraveler}
                  className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  placeholder="Enter company address"
                  rows="3"
                />

              </div>

            </>
          )}

          {/* EMAIL */}
          <div className="mb-4">

            <label
              htmlFor="email"
              className="block text-[color:var(--text-secondary)] mb-1"
            >
              Email Address
            </label>

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              placeholder="Enter your email"
            />

          </div>

          {/* PASSWORD */}
          <div className="mb-6">

            <label
              htmlFor="password"
              className="block text-[color:var(--text-secondary)] mb-1"
            >
              Password
            </label>

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              placeholder="Enter your password"
            />

          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)]'
            }`}
          >
            {loading
              ? isLogin
                ? 'Signing In...'
                : 'Signing Up...'
              : isLogin
                ? 'Sign In'
                : isTraveler
                  ? 'Sign Up as Traveler'
                  : 'Register Company'}
          </button>

        </form>

        {/* SWITCH LOGIN / SIGNUP */}
        <div className="mt-6 text-center">

          <p className="text-[color:var(--text-secondary)]">

            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}{' '}

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[color:var(--accent-primary)] hover:underline font-medium"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>

          </p>

        </div>

        {/* GUEST */}
        {isLogin && (
          <div className="mt-6">

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-full bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] text-[color:var(--text-primary)] py-3 rounded-lg font-semibold transition duration-200"
            >
              Continue as Guest
            </button>

          </div>
        )}

        {/* TERMS */}
        <div className="mt-6 text-center">

          <p className="text-[color:var(--text-secondary)] text-sm">
            By continuing, you agree to Touristo's Terms of Service and Privacy Policy.
          </p>

        </div>

      </div>
    </div>
  );
};

export default LoginSignupScreen;