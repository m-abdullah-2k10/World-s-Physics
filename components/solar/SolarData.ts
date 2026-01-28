
export interface PlanetData {
  id: string;
  name: string;
  color: string;
  size: number; // Relative radius
  distance: number; // Distance from Sun
  speed: number; // Orbit speed
  description: string;
  stats: {
    mass: string;
    gravity: string;
    temp: string;
    diameter: string;
    moons: string;
    day: string;
    year: string;
  };
}

export const PLANETS_DATA: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#94a3b8',
    size: 0.8,
    distance: 10,
    speed: 1.5,
    description: 'The smallest planet in our solar system and closest to the Sun. It zips around the Sun faster than any other planet.',
    stats: { 
      mass: '0.33 x 10^24 kg', 
      gravity: '3.7 m/s²', 
      temp: '167°C',
      diameter: '4,879 km',
      moons: '0',
      day: '59 Earth days',
      year: '88 Earth days'
    }
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#fde047',
    size: 1.5,
    distance: 15,
    speed: 1.2,
    description: 'Spins in the opposite direction to most planets and is the hottest planet due to its thick atmosphere.',
    stats: { 
      mass: '4.87 x 10^24 kg', 
      gravity: '8.87 m/s²', 
      temp: '464°C',
      diameter: '12,104 km',
      moons: '0',
      day: '243 Earth days',
      year: '225 Earth days'
    }
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#3b82f6',
    size: 1.6,
    distance: 22,
    speed: 1.0,
    description: 'Our home planet, the only place we know of so far that’s inhabited by living things.',
    stats: { 
      mass: '5.97 x 10^24 kg', 
      gravity: '9.8 m/s²', 
      temp: '15°C',
      diameter: '12,742 km',
      moons: '1',
      day: '24 hours',
      year: '365 days'
    }
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#ef4444',
    size: 1.1,
    distance: 30,
    speed: 0.8,
    description: 'A dusty, cold, desert world with a very thin atmosphere. It is known as the Red Planet.',
    stats: { 
      mass: '0.64 x 10^24 kg', 
      gravity: '3.71 m/s²', 
      temp: '-65°C',
      diameter: '6,779 km',
      moons: '2',
      day: '24.6 hours',
      year: '687 days'
    }
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#d97706',
    size: 4.5,
    distance: 45,
    speed: 0.5,
    description: 'More than twice as massive as all the other planets combined. The Great Red Spot is a centuries-old storm.',
    stats: { 
      mass: '1898 x 10^24 kg', 
      gravity: '24.79 m/s²', 
      temp: '-110°C',
      diameter: '139,820 km',
      moons: '95',
      day: '9.9 hours',
      year: '11.9 Earth years'
    }
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#fcd34d',
    size: 3.8,
    distance: 65,
    speed: 0.4,
    description: 'Adorned with a dazzling, complex system of icy rings. It is a gas giant made mostly of hydrogen and helium.',
    stats: { 
      mass: '568 x 10^24 kg', 
      gravity: '10.44 m/s²', 
      temp: '-140°C',
      diameter: '116,460 km',
      moons: '146',
      day: '10.7 hours',
      year: '29.4 Earth years'
    }
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#22d3ee',
    size: 2.5,
    distance: 85,
    speed: 0.3,
    description: 'Rotates at a nearly 90-degree angle from the plane of its orbit. It has a blue-green color from methane.',
    stats: { 
      mass: '86.8 x 10^24 kg', 
      gravity: '8.69 m/s²', 
      temp: '-195°C',
      diameter: '50,724 km',
      moons: '28',
      day: '17 hours',
      year: '84 Earth years'
    }
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#3b82f6',
    size: 2.4,
    distance: 105,
    speed: 0.2,
    description: 'The first planet located through mathematical calculations. Dark, cold, and whipped by supersonic winds.',
    stats: { 
      mass: '102 x 10^24 kg', 
      gravity: '11.15 m/s²', 
      temp: '-200°C',
      diameter: '49,244 km',
      moons: '16',
      day: '16 hours',
      year: '165 Earth years'
    }
  }
];