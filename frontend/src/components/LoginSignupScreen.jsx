import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  User,
  Building2,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo_touristo.png';

/*
 * IMPORTANT:
 * Keep reusable components OUTSIDE LoginSignupScreen.
 * Creating them inside render causes React 19:
 * "Components created during render"
 */
const Field = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  icon: Icon,
  autoComplete,
  children
}) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold text-[color:var(--text-primary)]"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.8}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] pointer-events-none"
          />
        )}

        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full h-[52px] rounded-2xl border border-[color:var(--border-primary)] bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] outline-none transition-all duration-200 ${
            Icon ? 'pl-11' : 'pl-4'
          } ${children ? 'pr-12' : 'pr-4'} focus:border-[color:var(--brand-primary)] focus:bg-[color:var(--surface-primary)] focus:ring-4 focus:ring-[color:var(--brand-primary)]/10`}
        />

        {children}
      </div>
    </div>
  );
};

const TextAreaField = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon
}) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold text-[color:var(--text-primary)]"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.8}
            className="absolute left-4 top-4 text-[color:var(--text-muted)] pointer-events-none"
          />
        )}

        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={3}
          className={`w-full min-h-[96px] rounded-2xl border border-[color:var(--border-primary)] bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] outline-none transition-all duration-200 resize-none ${
            Icon ? 'pl-11' : 'pl-4'
          } pr-4 py-3.5 focus:border-[color:var(--brand-primary)] focus:bg-[color:var(--surface-primary)] focus:ring-4 focus:ring-[color:var(--brand-primary)]/10`}
        />
      </div>
    </div>
  );
};

const LoginSignupScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isTraveler, setIsTraveler] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

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
          throw new Error(
            'User information was not returned by the server'
          );
        }

        if (!userData.role) {
          throw new Error('Role not found in user data');
        }

        if (!token) {
          throw new Error(
            'Authentication token was not returned by the server'
          );
        }

        login(userData, token);

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
        throw new Error(
          'Invalid server response during signup'
        );
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
       * A host needs TWO records:
       * 1. users table
       * 2. hosts table
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
       * Save authentication AFTER
       * successful user + host creation.
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
      console.error(
        'Authentication error:',
        err
      );

      setError(
        err.message ||
        'An error occurred during authentication'
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-4 py-8 sm:py-12">

      <div className="w-full max-w-[1040px] grid lg:grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-[30px] border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] shadow-[var(--shadow-lg)]">

        {/* ======================================
            LEFT BRAND PANEL
        ======================================= */}
        <div className="hidden lg:flex relative overflow-hidden bg-[color:var(--brand-primary)] p-10 xl:p-12 flex-col justify-between min-h-[680px]">

          {/* Decorative shapes */}
          <div className="absolute -top-28 -right-28 w-72 h-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full border border-white/10" />

          <div className="relative z-10">

            {/* Logo */}
            <div className="w-16 h-16 rounded-[20px] bg-white/10 border border-white/15 backdrop-blur-sm flex items-center justify-center p-2 mb-8">
              <img
                src={logo}
                alt="Touristo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-medium mb-6">
              <Compass size={14} />
              Travel differently
            </div>

            <h2 className="text-4xl xl:text-5xl font-semibold tracking-[-0.03em] text-white leading-[1.08]">
              Your next
              <br />
              journey starts
              <br />
              here.
            </h2>

            <p className="mt-6 max-w-sm text-sm xl:text-base leading-7 text-white/65">
              Discover beautiful destinations, connect with trusted tour hosts,
              and create experiences worth remembering.
            </p>
          </div>

          <div className="relative z-10">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck
                  size={20}
                  className="text-[color:var(--brand-gold-light)]"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Travel with confidence
                </p>

                <p className="text-xs text-white/55 mt-0.5">
                  Built for travelers and tour companies
                </p>
              </div>
            </div>

            <div className="h-px bg-white/10 mb-5" />

            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} Touristo
            </p>

          </div>
        </div>

        {/* ======================================
            RIGHT FORM PANEL
        ======================================= */}
        <div className="p-6 sm:p-8 lg:p-10 xl:p-12">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-7">
            <div className="w-14 h-14 rounded-[18px] bg-[color:var(--brand-primary)] flex items-center justify-center p-2 shadow-[var(--shadow-md)]">
              <img
                src={logo}
                alt="Touristo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">

            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-7 bg-[color:var(--brand-gold)]" />

              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--brand-gold)]">
                Touristo
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
              {isLogin
                ? 'Welcome back'
                : 'Create your account'}
            </h1>

            <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
              {isLogin
                ? 'Sign in to continue your journey.'
                : 'Join Touristo and start exploring unforgettable experiences.'}
            </p>

          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-[color:var(--danger)]/20 bg-[color:var(--danger-soft)] px-4 py-3.5"
            >
              <p className="text-sm leading-5 font-medium text-[color:var(--danger)]">
                {error}
              </p>
            </div>
          )}

          {/* ======================================
              LOGIN
          ======================================= */}
          {isLogin ? (
            <>
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                <Field
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  icon={Mail}
                  autoComplete="email"
                  placeholder="you@example.com"
                />

                <Field
                  id="password"
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? 'text' : 'password'}
                  required
                  icon={Lock}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-[color:var(--text-muted)] hover:bg-[color:var(--bg-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full h-[52px] rounded-2xl bg-[color:var(--brand-primary)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(22,59,47,0.18)] hover:bg-[color:var(--brand-primary-hover)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading
                    ? 'Signing In...'
                    : 'Sign In'}

                  {!loading && (
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  )}
                </button>

              </form>

              {/* Guest */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="w-full h-[50px] rounded-2xl border border-[color:var(--border-primary)] bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] font-semibold text-sm hover:bg-[color:var(--bg-secondary)] transition-colors"
                >
                  Continue as Guest
                </button>
              </div>

              {/* Switch */}
              <div className="mt-7 text-center">
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-semibold text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-hover)] transition-colors"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* ======================================
                  SIGNUP ROLE
              ======================================= */}
              <div className="mb-6">

                <p className="text-[13px] font-semibold text-[color:var(--text-primary)] mb-2.5">
                  I want to join as
                </p>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setIsTraveler(true);
                      setError('');
                    }}
                    className={`relative min-h-[76px] rounded-2xl border text-left px-4 transition-all duration-200 ${
                      isTraveler
                        ? 'border-[color:var(--brand-primary)] bg-[color:var(--brand-primary-soft)]'
                        : 'border-[color:var(--border-primary)] bg-[color:var(--surface-secondary)] hover:border-[color:var(--brand-primary)]/30'
                    }`}
                  >
                    <User
                      size={19}
                      className={
                        isTraveler
                          ? 'text-[color:var(--brand-primary)]'
                          : 'text-[color:var(--text-muted)]'
                      }
                    />

                    <p className="mt-2 text-sm font-semibold text-[color:var(--text-primary)]">
                      Traveler
                    </p>

                    <p className="text-[11px] text-[color:var(--text-muted)] mt-0.5">
                      Explore & book
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTraveler(false);
                      setError('');
                    }}
                    className={`relative min-h-[76px] rounded-2xl border text-left px-4 transition-all duration-200 ${
                      !isTraveler
                        ? 'border-[color:var(--brand-primary)] bg-[color:var(--brand-primary-soft)]'
                        : 'border-[color:var(--border-primary)] bg-[color:var(--surface-secondary)] hover:border-[color:var(--brand-primary)]/30'
                    }`}
                  >
                    <Building2
                      size={19}
                      className={
                        !isTraveler
                          ? 'text-[color:var(--brand-primary)]'
                          : 'text-[color:var(--text-muted)]'
                      }
                    />

                    <p className="mt-2 text-sm font-semibold text-[color:var(--text-primary)]">
                      Tour Company
                    </p>

                    <p className="text-[11px] text-[color:var(--text-muted)] mt-0.5">
                      Offer experiences
                    </p>
                  </button>

                </div>
              </div>

              {/* ======================================
                  SIGNUP FORM
              ======================================= */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Company name */}
                {!isTraveler && (
                  <Field
                    id="companyName"
                    name="companyName"
                    label="Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    icon={Building2}
                    autoComplete="organization"
                    placeholder="Enter your company name"
                  />
                )}

                {/* Traveler name */}
                {isTraveler && (
                  <Field
                    id="name"
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    icon={User}
                    autoComplete="name"
                    placeholder="Enter your full name"
                  />
                )}

                {/* Phone */}
                <Field
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  required
                  icon={Phone}
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                />

                {/* Company fields */}
                {!isTraveler && (
                  <>
                    <Field
                      id="cnicOrBusinessRegistration"
                      name="cnicOrBusinessRegistration"
                      label="CNIC or Business Registration Number"
                      value={
                        formData.cnicOrBusinessRegistration
                      }
                      onChange={handleChange}
                      required
                      icon={ShieldCheck}
                      placeholder="Enter registration number"
                    />

                    <TextAreaField
                      id="companyAddress"
                      name="companyAddress"
                      label="Company Address"
                      value={formData.companyAddress}
                      onChange={handleChange}
                      required
                      icon={MapPin}
                      placeholder="Enter your company address"
                    />
                  </>
                )}

                {/* Email */}
                <Field
                  id="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  icon={Mail}
                  autoComplete="email"
                  placeholder="you@example.com"
                />

                {/* Password */}
                <Field
                  id="password"
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? 'text' : 'password'}
                  required
                  icon={Lock}
                  autoComplete="new-password"
                  placeholder="Create a password"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-[color:var(--text-muted)] hover:bg-[color:var(--bg-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </Field>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full h-[52px] rounded-2xl bg-[color:var(--brand-primary)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(22,59,47,0.18)] hover:bg-[color:var(--brand-primary-hover)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading
                    ? isTraveler
                      ? 'Creating Account...'
                      : 'Registering Company...'
                    : isTraveler
                      ? 'Create Traveler Account'
                      : 'Register Company'}

                  {!loading && (
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  )}
                </button>

              </form>

              {/* Switch */}
              <div className="mt-7 text-center">
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="font-semibold text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-hover)] transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Terms */}
          <p className="mt-7 text-center text-[11px] leading-5 text-[color:var(--text-muted)] max-w-sm mx-auto">
            By continuing, you agree to Touristo's Terms of
            Service and Privacy Policy.
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoginSignupScreen;