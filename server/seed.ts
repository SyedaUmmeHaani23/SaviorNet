import { db } from './db';
import {
  users,
  victims,
  rescueTeams,
  shelters,
  disasterPredictions,
  alerts
} from '@shared/schema';

/**
 * Seed the database with initial data for testing
 */
export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Check if we already have data
    const existingTeams = await db.select({ count: { value: rescueTeams.id } }).from(rescueTeams);
    if (existingTeams.length > 0 && existingTeams[0].count.value > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }
    
    // Seed rescue teams
    const seedTeams = [
      {
        name: 'Team Alpha',
        specialization: 'flood',
        status: 'available',
        location: { lat: 16.5062, lng: 80.6480 }, // Vijayawada
        capacity: 10,
        contact: '+91-9876543210'
      },
      {
        name: 'Team Beta',
        specialization: 'earthquake',
        status: 'available',
        location: { lat: 17.6868, lng: 83.2185 }, // Visakhapatnam
        capacity: 8,
        contact: '+91-9876543211'
      },
      {
        name: 'Team Gamma',
        specialization: 'wildfire',
        status: 'available',
        location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
        capacity: 12,
        contact: '+91-9876543212'
      },
      {
        name: 'Team Delta',
        specialization: 'flood',
        status: 'available',
        location: { lat: 16.2359, lng: 80.0496 }, // Guntur
        capacity: 6,
        contact: '+91-9876543213'
      },
      {
        name: 'Team Epsilon',
        specialization: 'medical',
        status: 'available',
        location: { lat: 17.4065, lng: 78.4772 }, // Hyderabad
        capacity: 15,
        contact: '+91-9876543214'
      }
    ];
    
    await db.insert(rescueTeams).values(seedTeams);
    console.log('Successfully seeded rescue teams');
    
    // Seed shelters
    const seedShelters = [
      {
        name: 'Government High School',
        location: { lat: 16.5062, lng: 80.6480 }, // Vijayawada
        capacity: 200,
        currentOccupancy: 0,
        amenities: ['water', 'food', 'medical', 'beds'],
        contactInfo: '+91-9876543210'
      },
      {
        name: 'Community Center',
        location: { lat: 17.6868, lng: 83.2185 }, // Visakhapatnam
        capacity: 150,
        currentOccupancy: 0,
        amenities: ['water', 'food', 'medical'],
        contactInfo: '+91-9876543211'
      },
      {
        name: 'Indoor Stadium',
        location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
        capacity: 500,
        currentOccupancy: 0,
        amenities: ['water', 'food', 'medical', 'beds', 'showers'],
        contactInfo: '+91-9876543212'
      },
      {
        name: 'College Auditorium',
        location: { lat: 16.2359, lng: 80.0496 }, // Guntur
        capacity: 300,
        currentOccupancy: 0,
        amenities: ['water', 'food', 'beds'],
        contactInfo: '+91-9876543213'
      },
      {
        name: 'Exhibition Grounds',
        location: { lat: 17.4065, lng: 78.4772 }, // Hyderabad
        capacity: 1000,
        currentOccupancy: 0,
        amenities: ['water', 'food', 'medical', 'beds', 'showers', 'charging'],
        contactInfo: '+91-9876543214'
      }
    ];
    
    await db.insert(shelters).values(seedShelters);
    console.log('Successfully seeded shelters');
    
    // Seed disaster predictions
    const now = new Date();
    const seedPredictions = [
      {
        disasterType: 'flood',
        region: 'Krishna River Basin',
        riskLevel: 0.8,
        severity: 'high',
        description: 'Expected heavy rainfall in next 24 hours. Recommend evacuation of low-lying areas.',
        predictedTimeframe: '6 hours',
        affectedAreas: ['Vijayawada', 'Rajamundry', 'Krishna Delta'],
        sourceData: { rainfall: '250mm', riverLevel: 'rising' },
        createdAt: now,
        updatedAt: now
      },
      {
        disasterType: 'earthquake',
        region: 'Eastern Ghats',
        riskLevel: 0.45,
        severity: 'medium',
        description: 'Mild tremors detected in Eastern Ghats region. Pattern recognition suggests low probability of major event.',
        predictedTimeframe: '12 hours',
        affectedAreas: ['Vishakhapatnam', 'East Godavari'],
        sourceData: { seismicActivity: '3.5 Richter', historicalPattern: 'Low' },
        createdAt: now,
        updatedAt: now
      },
      {
        disasterType: 'wildfire',
        region: 'Forest Regions',
        riskLevel: 0.65,
        severity: 'medium',
        description: 'Dry conditions and high temperatures increasing wildfire risk in forest areas.',
        predictedTimeframe: '24 hours',
        affectedAreas: ['Nallamala Forest', 'Srisailam'],
        sourceData: { temperature: '38°C', humidity: '15%', windSpeed: '25km/h' },
        createdAt: now,
        updatedAt: now
      }
    ];
    
    await db.insert(disasterPredictions).values(seedPredictions);
    console.log('Successfully seeded disaster predictions');
    
    // Seed alerts
    const seedAlerts = [
      {
        predictionId: 1, // Matches the flood prediction
        title: 'Flood Warning',
        message: 'Expected heavy rainfall in Krishna River Basin. Evacuate low-lying areas immediately.',
        severity: 'critical',
        region: 'Krishna River Basin',
        isActive: true,
        createdAt: now
      },
      {
        predictionId: 2, // Matches the earthquake prediction
        title: 'Earthquake Advisory',
        message: 'Mild tremors detected in Eastern Ghats. Stay alert and be prepared for aftershocks.',
        severity: 'warning',
        region: 'Eastern Ghats',
        isActive: true,
        createdAt: now
      },
      {
        predictionId: 3, // Matches the wildfire prediction
        title: 'Wildfire Risk Alert',
        message: 'High risk of wildfires in forest regions due to dry conditions. Avoid activities that could spark fires.',
        severity: 'warning',
        region: 'Forest Regions',
        isActive: true,
        createdAt: now
      }
    ];
    
    await db.insert(alerts).values(seedAlerts);
    console.log('Successfully seeded alerts');
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}