const { query } = require('../config/database');

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  try {
    console.log('Seeding database with initial data...');
    
    // Create some example users (if they don't exist)
    const users = [
      {
        name: 'Pakistan Travel Experts',
        email: 'paktravel@example.com',
        password: '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', // Hashed 'password123'
        phone: '+92 300 1234567',
        role: 'host'
      },
      {
        name: 'Northern Adventures',
        email: 'northadventures@example.com',
        password: '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', // Hashed 'password123'
        phone: '+92 300 1234568',
        role: 'host'
      },
      {
        name: 'Hunza Valley Tours',
        email: 'hunzatours@example.com',
        password: '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', // Hashed 'password123'
        phone: '+92 300 1234569',
        role: 'host'
      },
      {
        name: 'Swat Tourism',
        email: 'swattourism@example.com',
        password: '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', // Hashed 'password123'
        phone: '+92 300 1234570',
        role: 'host'
      },
      {
        name: 'Coastal Adventures',
        email: 'coastaladv@example.com',
        password: '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', // Hashed 'password123'
        phone: '+92 300 1234571',
        role: 'host'
      },
      {
        name: 'Mountain Expeditions',
        email: 'mountainexp@example.com',
        password: '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', // Hashed 'password123'
        phone: '+92 300 1234572',
        role: 'host'
      },
      {
        name: 'Historical Heritage Tours',
        email: 'histtours@example.com',
        password: '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', // Hashed 'password123'
        phone: '+92 300 1234573',
        role: 'host'
      },
      {
        name: 'Naran Kaghan Explorer',
        email: 'naranexplorer@example.com',
        password: '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', // Hashed 'password123'
        phone: '+92 300 1234574',
        role: 'host'
      },
      {
        name: 'Babusar Top Adventures',
        email: 'babusartop@example.com',
        password: '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', // Hashed 'password123'
        phone: '+92 300 1234575',
        role: 'host'
      }
    ];
    
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [userData.email]);
      if (existingUser.rows.length === 0) {
        await query(`
          INSERT INTO users (name, email, password_hash, phone, role, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [userData.name, userData.email, userData.password, userData.phone, userData.role]);
        console.log(`Created user: ${userData.name}`);
      } else {
        console.log(`User already exists: ${userData.name}`);
      }
    }
    
    // Create some example hosts (if they don't exist)
    const hosts = [
      {
        user_id: 1, // Pakistan Travel Experts
        company_name: 'Pakistan Travel Experts',
        description: 'Specializing in cultural tours across Pakistan with experienced guides.',
        location: 'Islamabad',
        license_number: 'PTE-2024-001'
      },
      {
        user_id: 2, // Northern Adventures
        company_name: 'Northern Adventures',
        description: 'Expert mountain and trekking tours in the northern areas of Pakistan.',
        location: 'Gilgit',
        license_number: 'NA-2024-002'
      },
      {
        user_id: 3, // Hunza Valley Tours
        company_name: 'Hunza Valley Tours',
        description: 'Premium tours in the beautiful Hunza Valley and surrounding areas.',
        location: 'Hunza',
        license_number: 'HVT-2024-003'
      },
      {
        user_id: 4, // Swat Tourism
        company_name: 'Swat Tourism',
        description: 'Explore the stunning landscapes and rich culture of Swat Valley.',
        location: 'Swat',
        license_number: 'ST-2024-004'
      },
      {
        user_id: 5, // Coastal Adventures
        company_name: 'Coastal Adventures',
        description: 'Maritime adventures along the beautiful coastlines of Pakistan.',
        location: 'Karachi',
        license_number: 'CA-2024-005'
      },
      {
        user_id: 6, // Mountain Expeditions
        company_name: 'Mountain Expeditions',
        description: 'Challenging expeditions to the highest peaks of Pakistan.',
        location: 'Skardu',
        license_number: 'ME-2024-006'
      },
      {
        user_id: 7, // Historical Heritage Tours
        company_name: 'Historical Heritage Tours',
        description: 'Guided tours of historical sites including Lahore Fort and Badshahi Mosque.',
        location: 'Lahore',
        license_number: 'HHT-2024-007'
      },
      {
        user_id: 8, // Naran Kaghan Explorer
        company_name: 'Naran Kaghan Explorer',
        description: 'Scenic tours through the breathtaking Naran and Kaghan valleys.',
        location: 'Mansehra',
        license_number: 'NKE-2024-008'
      },
      {
        user_id: 9, // Babusar Top Adventures
        company_name: 'Babusar Top Adventures',
        description: 'Adventure tours to the scenic Babusar Top pass.',
        location: 'Babusar Top',
        license_number: 'BTA-2024-009'
      }
    ];
    
    for (const hostData of hosts) {
      // Check if host already exists
      const existingHost = await query('SELECT id FROM hosts WHERE user_id = $1', [hostData.user_id]);
      if (existingHost.rows.length === 0) {
        await query(`
          INSERT INTO hosts (user_id, company_name, description, location, license_number, verified, rating_score)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [hostData.user_id, hostData.company_name, hostData.description, hostData.location, hostData.license_number, true, (Math.random() * 2 + 3).toFixed(2)]);
        console.log(`Created host: ${hostData.company_name}`);
      } else {
        console.log(`Host already exists: ${hostData.company_name}`);
      }
    }
    
    // Create all required destinations with detailed information
    const destinations = [
      { name: 'Hunza Valley', category: 'mountains', history: 'Rich cultural heritage with ancient settlements', culture: 'Blend of Burushaski and Wakhi cultures', famous_spots: 'Altit Fort, Baltit Fort, Rakaposhi View Point', famous_food: 'Thukpa soup, apricot dishes', latitude: 36.2887, longitude: 74.6116 },
      { name: 'Skardu', category: 'mountains', history: 'Historical gateway to Central Asia', culture: 'Influenced by Tibetan and Central Asian traditions', famous_spots: 'Skardu Fort, Shangrila Resort, K2 Base Camp views', famous_food: 'Chapli kababs, local trout', latitude: 35.3191, longitude: 75.5653 },
      { name: 'Swat Valley', category: 'valley', history: 'Ancient Buddhist center known as "Swat of Happiness"', culture: 'Pashtun culture with Buddhist influences', famous_spots: 'Malam Jaba, Usho, Marghazar', famous_food: 'Peshawari karahi, chapli kababs', latitude: 34.8611, longitude: 72.5781 },
      { name: 'Naran', category: 'valley', history: 'Valley along the Kunhar River', culture: 'Blend of Punjabi and Kashmiri influences', famous_spots: 'Lake Saiful Muluk, Babusar Top, Shogran', famous_food: 'Trout fish, seasonal fruits', latitude: 34.7644, longitude: 73.3444 },
      { name: 'Babusar Top', category: 'mountains', history: 'High mountain pass connecting Mansehra to Gilgit', culture: 'Mountain communities with unique dialects', famous_spots: 'Babusar Pass, Seo Soo Pass, Alpine lakes', famous_food: 'Local mountain cuisine, dairy products', latitude: 35.8500, longitude: 74.1000 },
      { name: 'Lahore', category: 'historical', history: 'Mughal capital with over 1000 years of history', culture: 'Cradle of Pakistani culture and arts', famous_spots: 'Badshahi Mosque, Lahore Fort, Wazir Khan Mosque', famous_food: 'Lahori daal, seekh kababs, kulfi', latitude: 31.5546, longitude: 74.3572 },
      { name: 'Mohenjo-daro', category: 'historical', history: 'Indus Valley Civilization archaeological site', culture: 'Ancient urban civilization', famous_spots: 'Great Bath, Stupa, Museum', famous_food: 'Sindhi cuisine', latitude: 27.3371, longitude: 68.1475 },
      { name: 'Gwadar', category: 'coastal', history: 'Ancient port city with strategic importance', culture: 'Baloch coastal traditions', famous_spots: 'Gwadar Port, Astola Island, Hingol National Park', famous_food: 'Fresh seafood, Balochi pulao', latitude: 25.1258, longitude: 66.7885 }
    ];
    
    for (const destData of destinations) {
      // Check if destination already exists
      const existingDest = await query('SELECT id FROM destinations WHERE name = $1', [destData.name]);
      if (existingDest.rows.length === 0) {
        await query(`
          INSERT INTO destinations (name, category, history, culture, famous_spots, famous_food, latitude, longitude)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [destData.name, destData.category, destData.history, destData.culture, destData.famous_spots, destData.famous_food, destData.latitude, destData.longitude]);
        console.log(`Created destination: ${destData.name}`);
      } else {
        console.log(`Destination already exists: ${destData.name}`);
      }
    }
    
    // Create packages for all destinations
    const packages = [
      { host_id: 1, destination_id: 1, title: 'Hunza Cultural Heritage Tour', price: 45000, duration_days: 5, location: 'Hunza Valley', destination: 'Hunza Valley', description: 'Explore the rich cultural heritage of Hunza Valley with visits to ancient forts and traditional villages.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: '2-6 people', inclusions: ['Accommodation for 4 nights', 'Meals as per itinerary', 'Airport transfers', 'Professional guide', 'Transportation during tour'], exclusions: ['International flights', 'Personal expenses', 'Travel insurance', 'Visa fees'], itinerary: [{ day: 1, title: 'Arrival in Islamabad', description: 'Arrive at Islamabad airport and transfer to hotel. Briefing about the tour.' }, { day: 2, title: 'Drive to Karimabad', description: 'Morning drive to Karimabad with stops at scenic viewpoints. Visit Altit Fort.' }, { day: 3, title: 'Baltit Fort and Local Culture', description: 'Visit Baltit Fort, explore traditional markets, and meet local artisans.' }, { day: 4, title: 'Attabad Lake and Passu Cones', description: 'Scenic drive to Attabad Lake and Passu Cones for photography and hiking.' }, { day: 5, title: 'Return to Islamabad', description: 'Morning drive back to Islamabad with lunch en route. Departure or extension to other destinations.' }] },
      { host_id: 2, destination_id: 2, title: 'Skardu Mountain Adventure', price: 65000, duration_days: 6, location: 'Skardu', destination: 'Skardu', description: 'Experience the majestic mountains of Skardu with views of K2 and other peaks.', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: '2-8 people', inclusions: ['Accommodation for 5 nights', 'All meals', 'Airport transfers', 'Local guide', 'Transportation', 'Camping equipment'], exclusions: ['Flights to Skardu', 'Personal climbing gear', 'Tips for staff', 'Bar bills'], itinerary: [{ day: 1, title: 'Arrival in Islamabad', description: 'Arrive in Islamabad, briefing session and overnight stay.' }, { day: 2, title: 'Fly to Skardu', description: 'Morning flight to Skardu, check-in to hotel, acclimatization walk.' }, { day: 3, title: 'Shangrila Resort', description: 'Visit Shangrila Resort, enjoy the beautiful lake and learn about the history.' }, { day: 4, title: 'K2 Base Camp View', description: 'Scenic drive to K2 base camp viewpoint for spectacular mountain views.' }, { day: 5, title: 'Deosai Plains', description: 'Drive to Deosai Plains, highest plateau in the world with beautiful wildflowers.' }, { day: 6, title: 'Return to Islamabad', description: 'Morning flight back to Islamabad, departure or onward journey.' }] },
      { host_id: 3, destination_id: 1, title: 'Hunza Luxury Experience', price: 65000, duration_days: 7, location: 'Hunza Valley', destination: 'Hunza Valley', description: 'Luxury tour with premium accommodations and exclusive experiences in Hunza.', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: 'Up to 5 people', inclusions: ['Luxury accommodation for 6 nights', 'All meals with local cuisine', 'Private transportation', 'Professional guide', 'Cultural experiences', 'Spa treatments'], exclusions: ['International flights', 'Personal shopping', 'Additional activities', 'Alcoholic beverages'], itinerary: [{ day: 1, title: 'Arrival in Islamabad', description: 'Arrive at Islamabad airport, welcome dinner at local restaurant.' }, { day: 2, title: 'Drive to Karimabad', description: 'Comfortable drive to Karimabad with luxury lodge check-in.' }, { day: 3, title: 'Altit and Baltit Forts', description: 'Visit ancient forts with expert historian guide, afternoon at leisure.' }, { day: 4, title: 'Attabad Lake', description: 'Visit Attabad Lake for boating and photography, luxury lunch by the lake.' }, { day: 5, title: 'Passu Cones and Village', description: 'Visit Passu Cones and interact with locals, evening cultural program.' }, { day: 6, title: 'Hunza Cultural Day', description: 'Full day of cultural activities, cooking class, village visit.' }, { day: 7, title: 'Return Journey', description: 'Morning drive back to Islamabad, departure.' }] },
      { host_id: 4, destination_id: 3, title: 'Swat Valley Trekking Adventure', price: 38000, duration_days: 4, location: 'Swat Valley', destination: 'Swat Valley', description: 'Trek through the beautiful Swat Valley with stops at historical sites and scenic locations.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: '2-6 people', inclusions: ['Accommodation for 3 nights', 'All meals', 'Transportation', 'Professional trekking guide', 'Basic trekking equipment'], exclusions: ['Flights to Islamabad', 'Personal gear', 'Travel insurance', 'Tips'], itinerary: [{ day: 1, title: 'Arrival in Islamabad', description: 'Arrive in Islamabad, overnight stay before journey to Swat.' }, { day: 2, title: 'Drive to Mingora', description: 'Morning drive to Mingora, visit Swat Museum and Marghazar.' }, { day: 3, title: 'Malam Jaba Trek', description: 'Full day trek to Malam Jaba with beautiful views of valley.' }, { day: 4, title: 'Return to Islamabad', description: 'Morning drive back to Islamabad, departure.' }] },
      { host_id: 5, destination_id: 8, title: 'Gwadar Coastal Adventure', price: 42000, duration_days: 4, location: 'Gwadar', destination: 'Gwadar', description: 'Explore the beautiful coastal city of Gwadar with maritime adventures and seafood experiences.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: '2-6 people', inclusions: ['Hotel accommodation for 3 nights', 'All meals featuring local seafood', 'Boat trips', 'City tour', 'Transportation'], exclusions: ['Flights to Karachi', 'Personal expenses', 'Water sports', 'Shopping'], itinerary: [{ day: 1, title: 'Arrival in Gwadar', description: 'Arrive in Gwadar, check-in to hotel, welcome dinner.' }, { day: 2, title: 'Gwadar Port Tour', description: 'Visit Gwadar Port and CPEC project sites, learn about development.' }, { day: 3, title: 'Astola Island Excursion', description: 'Full day boat trip to Astola Island, snorkeling and beach activities.' }, { day: 4, title: 'Hingol National Park', description: 'Visit Hingol National Park, mud volcanoes and departure.' }] },
      { host_id: 6, destination_id: 2, title: 'Skardu Mountain Expedition', price: 75000, duration_days: 8, location: 'Skardu', destination: 'Skardu', description: 'Challenging expedition to explore the high peaks around Skardu.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: '2-6 people', inclusions: ['Camping accommodation', 'All meals', 'Transportation', 'Professional mountain guide', 'Climbing equipment', 'Safety gear'], exclusions: ['Flights to Islamabad', 'Personal climbing gear', 'Travel insurance', 'Emergency evacuation'], itinerary: [{ day: 1, title: 'Arrival in Islamabad', description: 'Arrive in Islamabad, preparation and briefing.' }, { day: 2, title: 'Flight to Skardu', description: 'Morning flight to Skardu, gear check and acclimatization.' }, { day: 3, title: 'Base Camp Approach', description: 'Begin trek to base camp, setting up initial camp.' }, { day: 4, title: 'Advanced Base Camp', description: 'Move to advanced base camp, weather check.' }, { day: 5, title: 'Summit Attempt Day 1', description: 'First summit attempt, overnight at high camp.' }, { day: 6, title: 'Summit Attempt Day 2', description: 'Final summit push and descent to base camp.' }, { day: 7, title: 'Return to Skardu', description: 'Descend to Skardu, celebrate successful expedition.' }, { day: 8, title: 'Return to Islamabad', description: 'Flight back to Islamabad, departure.' }] },
      { host_id: 7, destination_id: 6, title: 'Lahore Historical Tour', price: 25000, duration_days: 2, location: 'Lahore', destination: 'Lahore', description: 'Explore the historical monuments of Lahore including the Badshahi Mosque and Lahore Fort.', image: 'https://images.unsplash.com/photo-1584285417130-12d00386b4fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: '2-6 people', inclusions: ['Hotel accommodation for 1 night', 'Breakfast', 'Transportation', 'Professional guide', 'Entrance fees'], exclusions: ['Flights to Lahore', 'Lunch and dinner', 'Personal expenses', 'Shopping'], itinerary: [{ day: 1, title: 'Lahore Fort and Shalimar Gardens', description: 'Morning visit to Lahore Fort, afternoon at Shalimar Gardens.' }, { day: 2, title: 'Badshahi Mosque and Walled City', description: 'Visit Badshahi Mosque, explore Walled City and Anarkali Bazaar.' }] },
      { host_id: 7, destination_id: 7, title: 'Mohenjo-daro Archaeological Tour', price: 20000, duration_days: 2, location: 'Mohenjo-daro', destination: 'Mohenjo-daro', description: 'Visit the ancient Indus Valley Civilization site of Mohenjo-daro.', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: '2-6 people', inclusions: ['Hotel accommodation for 1 night', 'All meals', 'Transportation', 'Archaeological guide', 'Entrance fees'], exclusions: ['Flights to Karachi', 'Personal expenses', 'Shopping', 'Tips'], itinerary: [{ day: 1, title: 'Drive to Mohenjo-daro', description: 'Morning drive to Mohenjo-daro, check-in to hotel and rest.' }, { day: 2, title: 'Mohenjo-daro Site Tour', description: 'Full day tour of Mohenjo-daro archaeological site with expert guide.' }] },
      { host_id: 8, destination_id: 4, title: 'Naran Kaghan Scenic Tour', price: 35000, duration_days: 4, location: 'Naran', destination: 'Naran', description: 'Scenic tour through the beautiful Naran and Kaghan valleys with lake visits.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: '2-4 people', inclusions: ['Hotel accommodation for 3 nights', 'All meals', 'Transportation', 'Local guide', 'Boat ride at Saiful Muluk'], exclusions: ['Flights to Islamabad', 'Personal expenses', 'Shopping', 'Tips'], itinerary: [{ day: 1, title: 'Drive to Mansehra', description: 'Morning drive to Mansehra, overnight stay.' }, { day: 2, title: 'Drive to Naran', description: 'Morning drive to Naran via Babusar Top, scenic stops.' }, { day: 3, title: 'Saiful Muluk Lake', description: 'Full day at Saiful Muluk Lake, boating and photography.' }, { day: 4, title: 'Return Journey', description: 'Morning drive back to Islamabad via Shogran.' }] },
      { host_id: 9, destination_id: 5, title: 'Babusar Top Adventure', price: 40000, duration_days: 3, location: 'Babusar Top', destination: 'Babusar Top', description: 'Adventure tour to the scenic Babusar Top pass with alpine views.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80', group_size: '2-6 people', inclusions: ['Hotel accommodation for 2 nights', 'All meals', 'Transportation', 'Local guide', 'Photography stops'], exclusions: ['Flights to Islamabad', 'Personal expenses', 'Shopping', 'Tips'], itinerary: [{ day: 1, title: 'Drive to Naran', description: 'Morning drive to Naran with scenic stops.' }, { day: 2, title: 'Babusar Top and Saiful Muluk', description: 'Drive to Babusar Top, visit Saiful Muluk Lake.' }, { day: 3, title: 'Return Journey', description: 'Morning return to Islamabad.' }] }
    ];
    
    for (const pkgData of packages) {
      // Check if package already exists
      const existingPkg = await query('SELECT id FROM packages WHERE title = $1', [pkgData.title]);
      if (existingPkg.rows.length === 0) {
        await query(`
          INSERT INTO packages (host_id, destination_id, title, description, price, duration_days, location, destination, image, inclusions, exclusions, itinerary, group_size)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [pkgData.host_id, pkgData.destination_id, pkgData.title, pkgData.description, pkgData.price, pkgData.duration_days, pkgData.location, pkgData.destination, pkgData.image, pkgData.inclusions ? `{${pkgData.inclusions.join(',')}}` : '{}', pkgData.exclusions ? `{${pkgData.exclusions.join(',')}}` : '{}', pkgData.itinerary ? JSON.stringify(pkgData.itinerary) : null, pkgData.group_size]);
        console.log(`Created package: ${pkgData.title}`);
      } else {
        console.log(`Package already exists: ${pkgData.title}`);
      }
    }

    const reviewerResult = await query("SELECT id FROM users WHERE role = 'traveler' ORDER BY id LIMIT 1");
    let reviewerId = reviewerResult.rows[0]?.id;
    if (!reviewerId) {
      const seededTraveler = await query(`
        INSERT INTO users (name, email, password_hash, phone, role)
        VALUES ($1, $2, $3, $4, 'traveler')
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, ['Demo Traveler', 'demo.traveler@touristo.local', '$2b$10$8K1p/aYpCXpdWhvTpU7.bOdW8Aj2.yb8.zQGX9EoFhJLLvXBYqY7W', '+92 300 0000000']);
      reviewerId = seededTraveler.rows[0]?.id;
    }

    if (reviewerId) {
      const packageResult = await query('SELECT id FROM packages ORDER BY id LIMIT 10');
      for (const packageRow of packageResult.rows) {
        const existingReview = await query(
          'SELECT id FROM reviews WHERE user_id = $1 AND package_id = $2 LIMIT 1',
          [reviewerId, packageRow.id]
        );
        if (existingReview.rows.length === 0) {
          await query(
            'INSERT INTO reviews (user_id, package_id, rating, comment) VALUES ($1, $2, $3, $4)',
            [reviewerId, packageRow.id, 5, 'A well-organized trip with helpful local guidance.']
          );
        }
      }
    }
    
    // Create a sample booking for testing
    const existingBooking = await query('SELECT id FROM bookings WHERE user_id = 1 LIMIT 1');
    if (existingBooking.rows.length === 0) {
      await query(`
        INSERT INTO bookings (user_id, package_id, travel_date, travelers, total_price, status)
        VALUES (1, 1, CURRENT_DATE + INTERVAL '30 days', 2, 45000, 'confirmed')
      `);
      console.log('Created sample booking for testing');
    } else {
      console.log('Sample booking already exists');
    }
    
    // Create tour guides for each host
    const tourGuides = [
      // Pakistan Travel Experts (host_id: 1)
      { host_id: 1, name: 'Ali Khan', photo: 'https://randomuser.me/api/portraits/men/32.jpg', specialty: 'Cultural Historian', rating: 4.7 },
      { host_id: 1, name: 'Fatima Ahmed', photo: 'https://randomuser.me/api/portraits/women/44.jpg', specialty: 'Local Customs Specialist', rating: 4.8 },
      { host_id: 1, name: 'Hassan Raza', photo: 'https://randomuser.me/api/portraits/men/22.jpg', specialty: 'Language Guide (Urdu/Pashto)', rating: 4.5 },
      
      // Northern Adventures (host_id: 2)
      { host_id: 2, name: 'Ahmed Shah', photo: 'https://randomuser.me/api/portraits/men/67.jpg', specialty: 'Trekking Expert', rating: 4.9 },
      { host_id: 2, name: 'Sara Malik', photo: 'https://randomuser.me/api/portraits/women/68.jpg', specialty: 'Wildlife Photographer', rating: 4.6 },
      { host_id: 2, name: 'Kamran Tariq', photo: 'https://randomuser.me/api/portraits/men/77.jpg', specialty: 'Mountaineering Guide', rating: 4.8 },
      
      // Hunza Valley Tours (host_id: 3)
      { host_id: 3, name: 'Naveed Hussain', photo: 'https://randomuser.me/api/portraits/men/23.jpg', specialty: 'Altitude Specialist', rating: 4.7 },
      { host_id: 3, name: 'Zeenat Bibi', photo: 'https://randomuser.me/api/portraits/women/33.jpg', specialty: 'Cultural Storyteller', rating: 4.9 },
      { host_id: 3, name: 'Omar Farooq', photo: 'https://randomuser.me/api/portraits/men/45.jpg', specialty: 'Family-Friendly Tours', rating: 4.4 },
      
      // Swat Tourism (host_id: 4)
      { host_id: 4, name: 'Tariq Mahmood', photo: 'https://randomuser.me/api/portraits/men/55.jpg', specialty: 'Historical Sites Expert', rating: 4.6 },
      { host_id: 4, name: 'Ayesha Parveen', photo: 'https://randomuser.me/api/portraits/women/78.jpg', specialty: 'Adventure Sports Guide', rating: 4.7 },
      { host_id: 4, name: 'Irfan Ali', photo: 'https://randomuser.me/api/portraits/men/88.jpg', specialty: 'Photography Tours', rating: 4.5 },
      
      // Coastal Adventures (host_id: 5)
      { host_id: 5, name: 'Farhan Qureshi', photo: 'https://randomuser.me/api/portraits/men/12.jpg', specialty: 'Marine Biology Guide', rating: 4.8 },
      { host_id: 5, name: 'Maria Khan', photo: 'https://randomuser.me/api/portraits/women/26.jpg', specialty: 'Seafood Expert', rating: 4.7 },
      { host_id: 5, name: 'Bilal Saeed', photo: 'https://randomuser.me/api/portraits/men/36.jpg', specialty: 'Beach Activities Coordinator', rating: 4.5 },
      
      // Mountain Expeditions (host_id: 6)
      { host_id: 6, name: 'Rashid Minhas', photo: 'https://randomuser.me/api/portraits/men/47.jpg', specialty: 'Extreme Trekking Expert', rating: 4.9 },
      { host_id: 6, name: 'Hina Zafar', photo: 'https://randomuser.me/api/portraits/women/57.jpg', specialty: 'High Altitude Safety', rating: 4.8 },
      { host_id: 6, name: 'Waqar Yasin', photo: 'https://randomuser.me/api/portraits/men/69.jpg', specialty: 'Glacier Navigation', rating: 4.7 },
      
      // Historical Heritage Tours (host_id: 7)
      { host_id: 7, name: 'Asadullah Baig', photo: 'https://randomuser.me/api/portraits/men/79.jpg', specialty: 'Mughal History Expert', rating: 4.8 },
      { host_id: 7, name: 'Rabia Noor', photo: 'https://randomuser.me/api/portraits/women/89.jpg', specialty: 'Architectural Guide', rating: 4.6 },
      { host_id: 7, name: 'Talha Javaid', photo: 'https://randomuser.me/api/portraits/men/95.jpg', specialty: 'Heritage Conservation', rating: 4.5 },
      
      // Naran Kaghan Explorer (host_id: 8)
      { host_id: 8, name: 'Sohail Ashraf', photo: 'https://randomuser.me/api/portraits/men/59.jpg', specialty: 'Scenic Route Expert', rating: 4.7 },
      { host_id: 8, name: 'Sanaullah Khan', photo: 'https://randomuser.me/api/portraits/women/63.jpg', specialty: 'Nature Photography', rating: 4.6 },
      { host_id: 8, name: 'Imran Shah', photo: 'https://randomuser.me/api/portraits/men/73.jpg', specialty: 'Lake and River Activities', rating: 4.4 },
      
      // Babusar Top Adventures (host_id: 9)
      { host_id: 9, name: 'Zafar Iqbal', photo: 'https://randomuser.me/api/portraits/men/83.jpg', specialty: 'High Pass Specialist', rating: 4.8 },
      { host_id: 9, name: 'Amina Liaquat', photo: 'https://randomuser.me/api/portraits/women/93.jpg', specialty: 'Alpine Ecology Guide', rating: 4.7 },
      { host_id: 9, name: 'Daniyal Aslam', photo: 'https://randomuser.me/api/portraits/men/43.jpg', specialty: 'Winter Sports Guide', rating: 4.5 }
    ];
    
    for (const guideData of tourGuides) {
      // Check if tour guide already exists
      const existingGuide = await query('SELECT id FROM tour_guides WHERE name = $1 AND host_id = $2', [guideData.name, guideData.host_id]);
      if (existingGuide.rows.length === 0) {
        await query(`
          INSERT INTO tour_guides (host_id, name, photo, specialty, rating)
          VALUES ($1, $2, $3, $4, $5)
        `, [guideData.host_id, guideData.name, guideData.photo, guideData.specialty, guideData.rating]);
        console.log(`Created tour guide: ${guideData.name} for host ID: ${guideData.host_id}`);
      } else {
        console.log(`Tour guide already exists: ${guideData.name} for host ID: ${guideData.host_id}`);
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

module.exports = { seedDatabase };