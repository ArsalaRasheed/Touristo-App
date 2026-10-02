import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  Eye,
  UserRound,
  Mail,
  KeyRound,
  LogOut,
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';


/* ============================================================
   INFO ROW
============================================================ */

const InfoRow = ({
  icon: Icon,
  title,
  description,
  value,
  disabled = false
}) => {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] ${
        disabled ? 'opacity-70' : ''
      }`}
    >
      <div className="w-11 h-11 shrink-0 rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm sm:text-base">
          {title}
        </p>

        <p className="mt-1 text-xs sm:text-sm leading-5 text-[color:var(--text-secondary)]">
          {description}
        </p>
      </div>

      {value && (
        <span className="shrink-0 text-xs font-semibold text-[color:var(--text-muted)]">
          {value}
        </span>
      )}
    </div>
  );
};


/* ============================================================
   PRIVACY & SECURITY
============================================================ */

const PrivacySecurityScreen = () => {
  const {
    user,
    logout
  } = useAuth();


  const accountType =
    user?.role === 'host'
      ? 'Tour Company'
      : 'Traveler';


  const handleLogout = () => {
    logout();
  };


  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-9">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mb-7">

          <div className="flex items-center justify-between gap-4 mb-7">

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--brand-primary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>

            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[color:var(--brand-gold)]">
              Security
            </span>

          </div>


          <div className="flex items-start gap-4">

            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[color:var(--brand-primary)] text-white flex items-center justify-center shadow-[var(--shadow-md)]">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>

              <p className="text-xs uppercase tracking-[0.2em] font-bold text-[color:var(--brand-gold)]">
                Privacy & Security
              </p>

              <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight">
                Your account, protected.
              </h1>

              <p className="mt-2 max-w-2xl text-sm sm:text-base leading-6 text-[color:var(--text-secondary)]">
                Review your account information and security
                controls from one place.
              </p>

            </div>

          </div>

        </header>


        {/* ====================================================
            SECURITY STATUS
        ==================================================== */}

        <section className="relative overflow-hidden mb-6 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] shadow-[var(--shadow-md)]">

          <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-[color:var(--brand-gold-soft)] blur-3xl opacity-70 pointer-events-none" />

          <div className="relative p-5 sm:p-7">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-[color:var(--success-soft)] text-[color:var(--success)] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <p className="font-semibold">
                    Account security
                  </p>

                  <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                    You are signed in securely.
                  </p>
                </div>

              </div>

              <span className="inline-flex self-start sm:self-auto items-center rounded-full bg-[color:var(--success-soft)] px-3 py-1.5 text-xs font-bold text-[color:var(--success)]">
                Active session
              </span>

            </div>

          </div>

        </section>


        {/* ====================================================
            ACCOUNT
        ==================================================== */}

        <section className="mb-6 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 sm:p-7 shadow-[var(--shadow-sm)]">

          <div className="mb-5">

            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[color:var(--text-muted)]">
              Account
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Account information
            </h2>

          </div>


          <div className="space-y-3">

            <InfoRow
              icon={UserRound}
              title="Account Type"
              description="Your Touristo account role."
              value={accountType}
            />

            <InfoRow
              icon={Mail}
              title="Email Address"
              description="Your registered account email."
              value={user?.email || '—'}
            />

          </div>

        </section>


        {/* ====================================================
            PASSWORD / AUTHENTICATION
        ==================================================== */}

        <section className="mb-6 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 sm:p-7 shadow-[var(--shadow-sm)]">

          <div className="mb-5">

            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[color:var(--text-muted)]">
              Authentication
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Sign-in security
            </h2>

          </div>


          <div className="space-y-3">

            <InfoRow
              icon={LockKeyhole}
              title="Password"
              description="Your password is securely stored on the server and is never displayed here."
              value="Protected"
            />

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[color:var(--brand-gold-soft)] border border-[color:var(--brand-gold-light)]">

              <Info className="w-5 h-5 shrink-0 mt-0.5 text-[color:var(--brand-gold)]" />

              <p className="text-xs sm:text-sm leading-5 text-[color:var(--text-secondary)]">
                Password change and password recovery require
                dedicated backend authentication support. They
                are not being simulated here.
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            PRIVACY
        ==================================================== */}

        <section className="mb-6 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 sm:p-7 shadow-[var(--shadow-sm)]">

          <div className="mb-5">

            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[color:var(--text-muted)]">
              Privacy
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Privacy controls
            </h2>

            <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
              Privacy preferences will be connected to your
              account data once the corresponding backend
              fields are added.
            </p>

          </div>


          <div className="space-y-3">

            <InfoRow
              icon={Eye}
              title="Profile visibility"
              description="Control how your profile is presented to other users."
              value="Coming soon"
              disabled
            />

            <InfoRow
              icon={UserRound}
              title="Activity visibility"
              description="Control whether selected activity is visible on your profile."
              value="Coming soon"
              disabled
            />

          </div>

        </section>


        {/* ====================================================
            SESSION
        ==================================================== */}

        <section className="mb-8 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 sm:p-7 shadow-[var(--shadow-sm)]">

          <div className="mb-5">

            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[color:var(--text-muted)]">
              Session
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Current session
            </h2>

          </div>


          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl border border-[color:var(--danger)]/15 bg-[color:var(--danger-soft)] text-[color:var(--danger)] transition-all duration-200 hover:border-[color:var(--danger)]/30 hover:-translate-y-0.5"
          >

            <div className="flex items-center gap-3 text-left">

              <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>

              <div>

                <p className="font-semibold text-sm">
                  Sign out
                </p>

                <p className="mt-1 text-xs opacity-80">
                  End your current Touristo session.
                </p>

              </div>

            </div>

            <ChevronRight className="w-5 h-5 shrink-0" />

          </button>

        </section>


        {/* ====================================================
            FOOTNOTE
        ==================================================== */}

        <div className="flex items-start gap-3 px-1 pb-4">

          <KeyRound className="w-4 h-4 mt-0.5 shrink-0 text-[color:var(--brand-gold)]" />

          <p className="text-xs leading-5 text-[color:var(--text-muted)]">
            Touristo keeps authentication credentials separate
            from the information displayed in your profile.
          </p>

        </div>

      </div>

    </div>
  );
};

export default PrivacySecurityScreen;