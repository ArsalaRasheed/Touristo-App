import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Mountain,
  Landmark,
  Waves,
  Trees,
  Utensils,
  Bike,
  Sparkles
} from 'lucide-react';

const experiences = [
  {
    id: 'mountain-adventures',
    name: 'Mountain Adventures',
    description: 'Trekking, hiking and unforgettable mountain landscapes.',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=85',
    icon: Mountain
  },
  {
    id: 'cultural-tours',
    name: 'Cultural Tours',
    description: 'Discover history, heritage and local traditions.',
    image:
      'https://images.unsplash.com/photo-1597944356808-424870f8e6f5?auto=format&fit=crop&w=1000&q=85',
    icon: Landmark
  },
  {
    id: 'coastal-getaways',
    name: 'Coastal Getaways',
    description: 'Relax by the sea and explore Pakistan’s coastline.',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85',
    icon: Waves
  },
  {
    id: 'wildlife-safaris',
    name: 'Wildlife Safaris',
    description: 'Explore nature, forests and scenic outdoor landscapes.',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=85',
    icon: Trees
  },
  {
    id: 'food-culinary',
    name: 'Food & Culinary',
    description: 'Taste authentic regional food and discover local flavors.',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=85',
    icon: Utensils
  },
  {
    id: 'adventure-sports',
    name: 'Adventure Sports',
    description: 'Add adrenaline to your journey with outdoor activities.',
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1000&q=85',
    icon: Bike
  }
];

const ExperiencesScreen = () => {
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">

        {/* Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--accent-primary)] mb-3">
            <Sparkles size={17} />
            CURATED FOR TRAVELERS
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Discover Experiences
          </h1>

          <p className="text-[color:var(--text-secondary)] text-base sm:text-lg leading-7">
            Explore different ways to experience Pakistan — from mountain
            adventures and cultural discoveries to coastal escapes and local
            cuisine.
          </p>
        </div>

        {/* Experience grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {experiences.map((experience) => {
            const Icon = experience.icon;

            return (
              <Link
                key={experience.id}
                to={`/experiences/${experience.id}`}
                className="group block"
              >
                <article className="overflow-hidden rounded-2xl bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={experience.image}
                      alt={experience.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                      <Icon size={20} />
                    </div>

                    <div className="absolute bottom-4 left-5 right-5">
                      <h2 className="text-xl font-bold text-white">
                        {experience.name}
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-sm text-[color:var(--text-secondary)] leading-6 min-h-[48px]">
                      {experience.description}
                    </p>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-[color:var(--border-primary)]">
                      <span className="text-sm font-semibold text-[color:var(--accent-primary)]">
                        Explore experience
                      </span>

                      <span className="w-9 h-9 rounded-full bg-[color:var(--accent-primary)]/10 flex items-center justify-center text-[color:var(--accent-primary)] group-hover:bg-[color:var(--accent-primary)] group-hover:text-[color:var(--nav-text)] transition">
                        <ArrowRight size={17} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExperiencesScreen;