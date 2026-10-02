import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowLeft,
  Bell,
  Globe2,
  Shield,
  Eye,
  Mail,
  Smartphone,
  MessageSquare,
  Coins,
  Trash2,
  ChevronDown,
  Settings
} from 'lucide-react';


/* ============================================================
   TOGGLE
============================================================ */

const Toggle = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-200 ${
        checked
          ? 'bg-[color:var(--brand-primary)]'
          : 'bg-[color:var(--border-light)]'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};


/* ============================================================
   SETTING ROW
============================================================ */

const SettingRow = ({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  last = false
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 ${
        !last
          ? 'border-b border-[color:var(--border-light)]'
          : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div className="min-w-0">

          <h3 className="text-sm font-semibold">
            {title}
          </h3>

          <p className="mt-0.5 text-xs leading-5 text-[color:var(--text-secondary)]">
            {description}
          </p>

        </div>

      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
      />

    </div>
  );
};


/* ============================================================
   SECTION CARD
============================================================ */

const SectionCard = ({
  icon: Icon,
  eyebrow,
  title,
  children
}) => {
  return (
    <section className="rounded-[26px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-sm)] sm:p-6">

      <div className="mb-3 flex items-center gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
          <Icon className="h-5 w-5" />
        </div>

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--brand-gold)]">
            {eyebrow}
          </p>

          <h2 className="mt-0.5 text-lg font-semibold">
            {title}
          </h2>

        </div>

      </div>

      {children}

    </section>
  );
};


/* ============================================================
   SELECT FIELD
============================================================ */

const SelectField = ({
  icon: Icon,
  label,
  description,
  value,
  onChange,
  children
}) => {
  return (
    <div>

      <div className="mb-2 flex items-start gap-3">

        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--surface-secondary)] text-[color:var(--text-secondary)]">
          <Icon className="h-4 w-4" />
        </div>

        <div>

          <label className="block text-sm font-semibold">
            {label}
          </label>

          <p className="mt-0.5 text-xs leading-5 text-[color:var(--text-muted)]">
            {description}
          </p>

        </div>

      </div>

      <div className="relative">

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-4 py-3 pr-10 text-sm font-medium text-[color:var(--text-primary)] outline-none transition-all focus:border-[color:var(--brand-gold)] focus:ring-2 focus:ring-[color:var(--brand-gold)]/15"
        >
          {children}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />

      </div>

    </div>
  );
};


/* ============================================================
   SETTINGS SCREEN
============================================================ */

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profilePublic: true,
      showActivity: false
    },
    language: 'English',
    currency: 'PKR'
  });

  const toggleSetting = (category, setting) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const changeLanguage = (language) => {
    setSettings((prev) => ({
      ...prev,
      language
    }));
  };

  const changeCurrency = (currency) => {
    setSettings((prev) => ({
      ...prev,
      currency
    }));
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-10 sm:px-6 sm:py-9">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mb-7">

          <div className="mb-7 flex items-center justify-between">

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--brand-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
              Preferences
            </span>

          </div>


          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)] text-white shadow-[var(--shadow-md)]">
              <Settings className="h-7 w-7" />
            </div>

            <div>

              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
                Account
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)] sm:text-base">
                Manage your Touristo preferences and account experience.
              </p>

            </div>

          </div>

        </header>


        <div className="space-y-5">

          {/* ==================================================
              PRIVACY
          ================================================== */}

          <SectionCard
            icon={Shield}
            eyebrow="Privacy"
            title="Account visibility"
          >

            <div>

              <SettingRow
                icon={Eye}
                title="Profile Visibility"
                description="Control who can see your profile"
                checked={settings.privacy.profilePublic}
                onChange={() =>
                  toggleSetting('privacy', 'profilePublic')
                }
              />

              <SettingRow
                icon={Eye}
                title="Show Activity"
                description="Show your activity on your profile"
                checked={settings.privacy.showActivity}
                onChange={() =>
                  toggleSetting('privacy', 'showActivity')
                }
                last
              />

            </div>

          </SectionCard>


          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <SectionCard
            icon={Bell}
            eyebrow="Notifications"
            title="Stay updated"
          >

            <div>

              <SettingRow
                icon={Mail}
                title="Email Notifications"
                description="Receive updates via email"
                checked={settings.notifications.email}
                onChange={() =>
                  toggleSetting('notifications', 'email')
                }
              />

              <SettingRow
                icon={Bell}
                title="Push Notifications"
                description="Receive push notifications"
                checked={settings.notifications.push}
                onChange={() =>
                  toggleSetting('notifications', 'push')
                }
              />

              <SettingRow
                icon={Smartphone}
                title="SMS Notifications"
                description="Receive updates via SMS"
                checked={settings.notifications.sms}
                onChange={() =>
                  toggleSetting('notifications', 'sms')
                }
                last
              />

            </div>

          </SectionCard>


          {/* ==================================================
              LANGUAGE & CURRENCY
          ================================================== */}

          <SectionCard
            icon={Globe2}
            eyebrow="Preferences"
            title="Language & currency"
          >

            <div className="grid gap-5 pt-1 sm:grid-cols-2">

              <SelectField
                icon={MessageSquare}
                label="Language"
                description="Choose your preferred language"
                value={settings.language}
                onChange={changeLanguage}
              >
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
                <option value="Hindi">Hindi</option>
              </SelectField>


              <SelectField
                icon={Coins}
                label="Currency"
                description="Choose your preferred currency"
                value={settings.currency}
                onChange={changeCurrency}
              >
                <option value="PKR">
                  PKR - Pakistani Rupee
                </option>

                <option value="USD">
                  USD - US Dollar
                </option>

                <option value="EUR">
                  EUR - Euro
                </option>
              </SelectField>

            </div>

          </SectionCard>


          {/* ==================================================
              DANGER ZONE
          ================================================== */}

          <section className="rounded-[26px] border border-[color:var(--danger)]/20 bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-xs)] sm:p-6">

            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--danger-soft)] text-[color:var(--danger)]">
                <Trash2 className="h-5 w-5" />
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--danger)]">
                  Danger Zone
                </p>

                <h2 className="mt-0.5 text-lg font-semibold">
                  Delete Account
                </h2>

                <p className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">
                  Permanently deleting your account requires a
                  proper backend deletion flow.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-xl border border-[color:var(--danger)]/25 bg-[color:var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[color:var(--danger)] transition-colors hover:bg-[color:var(--danger)]/10"
            >
              Delete Account
            </button>

          </section>


          {/* ==================================================
              NOTE
          ================================================== */}

          <div className="rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-4 py-3 text-xs leading-5 text-[color:var(--text-muted)]">
            These preference controls currently manage the settings
            within this screen. Persistent account-level preference
            storage will require backend support.
          </div>

        </div>

      </div>

    </div>
  );
};

export default SettingsScreen;