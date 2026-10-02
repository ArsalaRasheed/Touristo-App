import React from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowLeft,
  Compass,
  ShieldCheck,
  MapPinned,
  Sparkles,
  Headphones,
  Leaf,
  ArrowRight
} from 'lucide-react';


/* ============================================================
   FEATURE CARD
============================================================ */

const FeatureCard = ({
  icon: Icon,
  title,
  description
}) => {
  return (
    <div className="rounded-[24px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
        {description}
      </p>

    </div>
  );
};


/* ============================================================
   ABOUT SCREEN
============================================================ */

const AboutScreen = () => {
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-12 sm:px-6 sm:py-9">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mb-8">

          <Link
            to="/profile"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--brand-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>


          <div className="relative overflow-hidden rounded-[32px] bg-[color:var(--brand-primary)] px-6 py-10 text-white shadow-[var(--shadow-lg)] sm:px-10 sm:py-14">

            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[color:var(--brand-gold)] opacity-15 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl" />


            <div className="relative max-w-3xl">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[color:var(--brand-gold-light)] backdrop-blur-sm">
                <Compass className="h-7 w-7" />
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand-gold-light)]">
                About Touristo
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                Discover Pakistan.
                <span className="block text-[color:var(--brand-gold-light)]">
                  Travel with confidence.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Touristo connects travelers with local tour operators
                and experiences across Pakistan, making it easier to
                discover places, plan journeys and connect with hosts.
              </p>

            </div>

          </div>

        </header>


        {/* ====================================================
            MISSION
        ==================================================== */}

        <section className="mb-6 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">

          <div className="rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-6 shadow-[var(--shadow-sm)] sm:p-8">

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
              Our Mission
            </p>

            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Better journeys start with better connections.
            </h2>

            <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)] sm:text-base">
              At Touristo, we believe that the best travel experiences
              come from connecting travelers with trustworthy tour
              operators who know their destinations intimately.
            </p>

            <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)] sm:text-base">
              Our platform brings travelers and local operators
              together in one place, helping people discover authentic
              experiences while making trip planning simpler.
            </p>

          </div>


          <div className="rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--brand-gold-soft)] p-6 shadow-[var(--shadow-sm)] sm:p-8">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)] text-white">
              <MapPinned className="h-6 w-6" />
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
              Built for Pakistan
            </p>

            <p className="mt-2 text-xl font-semibold text-[color:var(--brand-primary)]">
              From mountains to coastlines.
            </p>

            <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
              Explore destinations and experiences across Pakistan
              through one travel platform.
            </p>

          </div>

        </section>


        {/* ====================================================
            WHY TOURISTO
        ==================================================== */}

        <section className="mb-8">

          <div className="mb-5">

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
              The Touristo Difference
            </p>

            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Why Touristo?
            </h2>

          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <FeatureCard
              icon={ShieldCheck}
              title="Trusted operators"
              description="Connect with tour operators and hosts through a dedicated travel platform."
            />

            <FeatureCard
              icon={MapPinned}
              title="Pakistan experiences"
              description="Discover destinations and curated travel experiences across the country."
            />

            <FeatureCard
              icon={Sparkles}
              title="Simpler planning"
              description="Search destinations, explore packages and use smart trip-planning tools."
            />

            <FeatureCard
              icon={Headphones}
              title="Travel support"
              description="Stay connected with your hosts and keep important trip information together."
            />

            <FeatureCard
              icon={Leaf}
              title="Responsible travel"
              description="Support local tourism and discover the diverse landscapes and culture of Pakistan."
            />

            <FeatureCard
              icon={Compass}
              title="One travel platform"
              description="Explore, compare and plan your journey without jumping between multiple services."
            />

          </div>

        </section>


        {/* ====================================================
            OUR STORY
        ==================================================== */}

        <section className="mb-8 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-6 shadow-[var(--shadow-sm)] sm:p-8">

          <div className="grid gap-8 md:grid-cols-[0.35fr_0.65fr]">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
                Our Story
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                A simple idea.
              </h2>

            </div>


            <div className="space-y-4 text-sm leading-7 text-[color:var(--text-secondary)] sm:text-base">

              <p>
                Founded in 2023, Touristo emerged from a simple idea:
                to make travel in Pakistan safer, easier and more
                meaningful.
              </p>

              <p>
                The platform was created around the need for a reliable
                place where travelers can discover destinations and
                connect with local operators offering travel services.
              </p>

              <p>
                Touristo continues to evolve as a platform for
                discovering Pakistan and planning memorable journeys.
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            CTA
        ==================================================== */}

        <section className="overflow-hidden rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] shadow-[var(--shadow-md)]">

          <div className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
                Start exploring
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Your next journey starts here.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--text-secondary)]">
                Explore destinations and discover experiences
                waiting across Pakistan.
              </p>

            </div>


            <Link
              to="/destinations"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--brand-primary-hover)] hover:shadow-[var(--shadow-md)]"
            >
              Explore Destinations
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

          </div>

        </section>

      </div>

    </div>
  );
};

export default AboutScreen;