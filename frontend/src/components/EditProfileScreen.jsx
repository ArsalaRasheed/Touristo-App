import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';


/* ============================================================
   FIELD
============================================================ */

const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon: Icon,
  disabled = false,
  required = false
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-[color:var(--text-primary)] mb-2"
      >
        {label}
        {required && (
          <span className="text-[color:var(--danger)] ml-1">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--text-muted)] pointer-events-none"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input w-full ${
            Icon ? 'pl-12' : ''
          } ${
            disabled
              ? 'bg-[color:var(--surface-secondary)] text-[color:var(--text-muted)] cursor-not-allowed'
              : ''
          }`}
        />
      </div>
    </div>
  );
};


/* ============================================================
   EDIT PROFILE SCREEN
============================================================ */

const EditProfileScreen = () => {
  const navigate = useNavigate();

  const {
    user,
    login,
    getAuthHeader
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [accountInfo, setAccountInfo] = useState({
    role: '',
    created_at: ''
  });


  /* ============================================================
     LOAD CURRENT USER
  ============================================================ */

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated.');
        }

        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/users/${user.id}`,
          {
            headers: {
              ...getAuthHeader()
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
            'Unable to load your profile.'
          );
        }

        const currentUser =
          result?.data?.user;

        if (!currentUser) {
          throw new Error(
            'User information was not returned by the server.'
          );
        }

        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || ''
        });

        setAccountInfo({
          role: currentUser.role || user.role || '',
          created_at:
            currentUser.created_at ||
            user.created_at ||
            ''
        });

      } catch (err) {
        console.error(
          'Error loading edit profile:',
          err
        );

        setError(
          err.message ||
          'Unable to load your profile.'
        );

        /*
         * Keep the screen usable if the API
         * request fails.
         */
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || ''
        });

        setAccountInfo({
          role: user?.role || '',
          created_at: user?.created_at || ''
        });

      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [user, getAuthHeader]);


  /* ============================================================
     INPUT CHANGE
  ============================================================ */

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    if (error) {
      setError('');
    }

    if (success) {
      setSuccess('');
    }
  };


  /* ============================================================
     SAVE PROFILE
  ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    if (!name) {
      setError('Please enter your full name.');
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/users/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({
            name,
            email,
            phone
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          'Unable to update your profile.'
        );
      }

      const updatedUser =
        result?.data?.user;

      if (!updatedUser) {
        throw new Error(
          'Profile was updated, but updated user data was not returned.'
        );
      }

      /*
       * Keep AuthContext + localStorage synchronized.
       *
       * We preserve the existing authenticated user's
       * other fields such as role.
       */
      const updatedAuthUser = {
        ...user,
        ...updatedUser
      };

      login(
        updatedAuthUser,
        localStorage.getItem('touristo_token')
      );

      setFormData({
        name: updatedUser.name || name,
        email: updatedUser.email || email,
        phone: updatedUser.phone || phone
      });

      setSuccess(
        'Your profile has been updated successfully.'
      );

    } catch (err) {
      console.error(
        'Error updating profile:',
        err
      );

      setError(
        err.message ||
        'Something went wrong while updating your profile.'
      );

    } finally {
      setSaving(false);
    }
  };


  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-5">
        <div className="w-full max-w-sm bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[28px] p-8 text-center shadow-[var(--shadow-md)]">

          <div className="mx-auto w-11 h-11 rounded-full border-2 border-[color:var(--brand-primary-soft)] border-t-[color:var(--brand-gold)] animate-spin" />

          <h2 className="mt-5 text-lg font-semibold text-[color:var(--text-primary)]">
            Loading your profile
          </h2>

          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            Preparing your account information.
          </p>

        </div>
      </div>
    );
  }


  /* ============================================================
     DERIVED DATA
  ============================================================ */

  const displayName =
    formData.name.trim() ||
    'Traveler';

  const initial =
    displayName
      .charAt(0)
      .toUpperCase();

  const accountType =
    accountInfo.role === 'host'
      ? 'Tour Company'
      : 'Traveler';

  const memberSince =
    accountInfo.created_at
      ? new Date(
          accountInfo.created_at
        ).getFullYear()
      : '';


  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <div className="flex items-center justify-between gap-4 mb-7">

          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--brand-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>

          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[color:var(--brand-gold)]">
            Account
          </span>

        </div>


        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className="mb-7">

          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[color:var(--brand-gold)]">
            Personal Information
          </p>

          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
            Edit Profile
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[color:var(--text-secondary)]">
            Keep your personal information up to date.
          </p>

        </div>


        {/* ====================================================
            PROFILE PREVIEW
        ==================================================== */}

        <section className="relative overflow-hidden bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[28px] shadow-[var(--shadow-md)] mb-6">

          <div className="absolute top-0 right-0 w-52 h-52 rounded-full bg-[color:var(--brand-gold-soft)] blur-3xl opacity-60 pointer-events-none" />

          <div className="relative p-6 sm:p-7">

            <div className="flex items-center gap-4">

              <div className="w-20 h-20 rounded-[24px] bg-[color:var(--brand-primary)] flex items-center justify-center shadow-[var(--shadow-md)] shrink-0">

                <span className="text-3xl font-semibold text-white">
                  {initial}
                </span>

              </div>

              <div className="min-w-0">

                <h2 className="text-xl sm:text-2xl font-semibold truncate">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm text-[color:var(--text-secondary)] truncate">
                  {formData.email || 'No email address'}
                </p>

                <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-primary)] text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {accountType}
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[28px] shadow-[var(--shadow-sm)] overflow-hidden"
        >

          <div className="p-6 sm:p-8">

            {/* ----------------------------------------------
                SECTION TITLE
            ---------------------------------------------- */}

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center">
                <UserRound className="w-5 h-5" />
              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Personal Details
                </h2>

                <p className="text-sm text-[color:var(--text-secondary)]">
                  Update the information associated with your account.
                </p>

              </div>

            </div>


            {/* ----------------------------------------------
                FIELDS
            ---------------------------------------------- */}

            <div className="space-y-5">

              <Field
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                icon={UserRound}
                required
              />

              <Field
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                type="email"
                icon={Mail}
                required
              />

              <Field
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                type="tel"
                icon={Phone}
                required
              />

            </div>


            {/* ----------------------------------------------
                ACCOUNT INFORMATION
            ---------------------------------------------- */}

            <div className="mt-8 pt-7 border-t border-[color:var(--border-light)]">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-gold)] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <div>

                  <h2 className="text-lg font-semibold">
                    Account Information
                  </h2>

                  <p className="text-sm text-[color:var(--text-secondary)]">
                    These details are managed by your account.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="p-4 rounded-2xl bg-[color:var(--surface-secondary)] border border-[color:var(--border-light)]">

                  <p className="text-xs uppercase tracking-wider font-semibold text-[color:var(--text-muted)]">
                    Account Type
                  </p>

                  <p className="mt-2 font-semibold">
                    {accountType}
                  </p>

                </div>

                <div className="p-4 rounded-2xl bg-[color:var(--surface-secondary)] border border-[color:var(--border-light)]">

                  <p className="text-xs uppercase tracking-wider font-semibold text-[color:var(--text-muted)]">
                    Member Since
                  </p>

                  <div className="mt-2 flex items-center gap-2 font-semibold">

                    <CalendarDays className="w-4 h-4 text-[color:var(--brand-gold)]" />

                    {memberSince || '—'}

                  </div>

                </div>

              </div>

            </div>


            {/* ----------------------------------------------
                PHOTO NOTE
            ---------------------------------------------- */}

            <div className="mt-6 p-4 rounded-2xl bg-[color:var(--brand-primary-soft)] border border-[color:var(--border-light)]">

              <div className="flex gap-3">

                <div className="w-9 h-9 rounded-xl bg-[color:var(--surface-primary)] text-[color:var(--brand-primary)] flex items-center justify-center shrink-0">
                  <UserRound className="w-4 h-4" />
                </div>

                <div>

                  <p className="text-sm font-semibold">
                    Profile photo
                  </p>

                  <p className="mt-1 text-xs sm:text-sm leading-5 text-[color:var(--text-secondary)]">
                    Profile photo upload will be available after the profile image storage setup is completed.
                  </p>

                </div>

              </div>

            </div>


            {/* ----------------------------------------------
                ERROR
            ---------------------------------------------- */}

            {error && (
              <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-[color:var(--danger-soft)] border border-[color:var(--danger)]/15 text-[color:var(--danger)]">

                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

                <p className="text-sm leading-5">
                  {error}
                </p>

              </div>
            )}


            {/* ----------------------------------------------
                SUCCESS
            ---------------------------------------------- */}

            {success && (
              <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-[color:var(--success-soft)] border border-[color:var(--success)]/15 text-[color:var(--success)]">

                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />

                <p className="text-sm leading-5">
                  {success}
                </p>

              </div>
            )}

          </div>


          {/* ==================================================
              ACTION BAR
          ================================================== */}

          <div className="px-6 sm:px-8 py-5 bg-[color:var(--surface-secondary)] border-t border-[color:var(--border-light)] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">

            <button
              type="button"
              onClick={() => navigate('/profile')}
              disabled={saving}
              className="btn btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditProfileScreen;