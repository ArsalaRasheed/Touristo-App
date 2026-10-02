import React from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowLeft,
  WalletCards,
  CreditCard,
  Landmark,
  Banknote,
  ShieldCheck,
  Info,
  ChevronRight,
  Clock3
} from 'lucide-react';


/* ============================================================
   PAYMENT METHOD CARD
============================================================ */

const PaymentMethodCard = ({
  icon: Icon,
  title,
  description,
  status,
  statusType = 'neutral',
  children
}) => {
  const statusClasses = {
    neutral:
      'bg-[color:var(--surface-secondary)] text-[color:var(--text-secondary)]',
    pending:
      'bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-primary)]',
    available:
      'bg-[color:var(--success-soft)] text-[color:var(--success)]'
  };

  return (
    <div className="rounded-[24px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]">

      <div className="flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="font-semibold">
              {title}
            </h3>

            {status && (
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClasses[statusType]}`}
              >
                {status}
              </span>
            )}

          </div>

          <p className="mt-1 text-sm leading-5 text-[color:var(--text-secondary)]">
            {description}
          </p>

          {children}

        </div>

      </div>

    </div>
  );
};


/* ============================================================
   PAYMENT METHODS SCREEN
============================================================ */

const PaymentMethodsScreen = () => {
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-10 sm:px-6 sm:py-9">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mb-7">

          <div className="mb-7 flex items-center justify-between gap-4">

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--brand-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>

            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
              Payments
            </span>

          </div>


          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)] text-white shadow-[var(--shadow-md)]">
              <WalletCards className="h-7 w-7" />
            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
                Payment Methods
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                Manage payments.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)] sm:text-base">
                Review the payment options currently supported
                by the Touristo booking system.
              </p>

            </div>

          </div>

        </header>


        {/* ====================================================
            PAYMENT STATUS
        ==================================================== */}

        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[color:var(--brand-gold-soft)] opacity-70 blur-3xl" />

          <div className="relative p-5 sm:p-7">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--success-soft)] text-[color:var(--success)]">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>

                <h2 className="font-semibold">
                  Payment integration status
                </h2>

                <p className="mt-1 text-sm leading-6 text-[color:var(--text-secondary)]">
                  Touristo currently records the selected payment
                  method with a booking, but a live online payment
                  gateway is not connected yet.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            AVAILABLE BOOKING OPTIONS
        ==================================================== */}

        <section className="mb-6">

          <div className="mb-4">

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              Booking options
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Current payment options
            </h2>

          </div>


          <div className="space-y-3">

            <PaymentMethodCard
              icon={CreditCard}
              title="Credit / Debit Card"
              description="The booking interface supports selecting a card payment option."
              status="Gateway pending"
              statusType="pending"
            >
              <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
                <Clock3 className="h-3.5 w-3.5" />
                Online card processing will be connected with the payment gateway.
              </div>
            </PaymentMethodCard>


            <PaymentMethodCard
              icon={Landmark}
              title="Bank Transfer"
              description="Available as a selectable booking payment option."
              status="Gateway pending"
              statusType="pending"
            >
              <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
                <Clock3 className="h-3.5 w-3.5" />
                Bank transfer instructions will be connected to the host/payment system later.
              </div>
            </PaymentMethodCard>


            <PaymentMethodCard
              icon={Banknote}
              title="Cash on Arrival"
              description="Pay when you arrive at your destination."
              status="Booking option"
              statusType="available"
            />

          </div>

        </section>


        {/* ====================================================
            NO SAVED METHODS
        ==================================================== */}

        <section className="mb-6 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-sm)] sm:p-7">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--surface-secondary)] text-[color:var(--text-muted)]">
              <WalletCards className="h-5 w-5" />
            </div>

            <div>

              <p className="font-semibold">
                Saved payment methods
              </p>

              <p className="mt-1 text-sm leading-6 text-[color:var(--text-secondary)]">
                You don't have any saved payment methods yet.
                Saved cards will become available after a real
                payment gateway is integrated.
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            SECURITY INFORMATION
        ==================================================== */}

        <section className="mb-7 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-sm)] sm:p-7">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-gold)]">
              <Info className="h-5 w-5" />
            </div>

            <div>

              <h2 className="font-semibold">
                About payments
              </h2>

              <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                No card numbers or banking credentials are stored
                by this screen. Real payment details should only be
                handled by the selected payment provider once the
                payment gateway is implemented.
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            SETTINGS LINK
        ==================================================== */}

        <Link
          to="/settings"
          className="group flex items-center justify-between gap-4 rounded-[24px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
        >

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
              <WalletCards className="h-5 w-5" />
            </div>

            <div>

              <p className="font-semibold">
                More account settings
              </p>

              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                Manage your general Touristo preferences.
              </p>

            </div>

          </div>

          <ChevronRight className="h-5 w-5 shrink-0 text-[color:var(--text-muted)] transition-transform group-hover:translate-x-0.5" />

        </Link>

      </div>

    </div>
  );
};

export default PaymentMethodsScreen;