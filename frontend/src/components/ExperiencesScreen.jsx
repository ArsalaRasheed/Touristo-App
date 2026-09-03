import React from 'react';
import { Link } from 'react-router-dom';

const ExperiencesScreen = () => {
  // Sample experience categories
  const experiences = [
    {
      id: 1,
      name: "Mountain Adventures",
      description: "Trekking, climbing, and scenic views",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 24
    },
    {
      id: 2,
      name: "Cultural Tours",
      description: "Historical sites and local traditions",
      image: "https://images.unsplash.com/photo-1597944356808-424870f8e6f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 18
    },
    {
      id: 3,
      name: "Coastal Getaways",
      description: "Beaches and seaside relaxation",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 12
    },
    {
      id: 4,
      name: "Wildlife Safaris",
      description: "Nature reserves and animal watching",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 8
    },
    {
      id: 5,
      name: "Food & Culinary",
      description: "Local cuisine and cooking classes",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 15
    },
    {
      id: 6,
      name: "Adventure Sports",
      description: "Paragliding, rafting, and more",
      image: "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      count: 10
    }
  ];

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[color:var(--text-primary)]">Curated Experiences</h1>
        <p className="text-[color:var(--text-secondary)] mb-8">Find your next adventure</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map(experience => (
            <Link to={`/search?category=${experience.name}`} key={experience.id}>
              <div className="bg-[color:var(--surface-primary)] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group border border-[color:var(--border-primary)]">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={experience.image} 
                    alt={experience.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-[color:var(--text-primary)]">{experience.name}</h3>
                      <p className="text-[color:var(--text-secondary)]">{experience.description}</p>
                    </div>
                    <span className="bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] px-2 py-1 rounded-full text-xs font-bold">
                      {experience.count}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperiencesScreen;