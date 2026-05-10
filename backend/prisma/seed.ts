import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10);

  // 1. Create Users
  console.log('Seeding users...');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@traveloop.com' },
    update: {},
    create: {
      email: 'admin@traveloop.com',
      name: 'System Admin',
      password: hashedPassword,
      isAdmin: true,
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@traveloop.com' },
    update: {},
    create: {
      email: 'demo@traveloop.com',
      name: 'Demo Traveler',
      password: hashedPassword,
      profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    },
  });

  const users = [
    { name: 'Sarah Jenkins', email: 'sarah@example.com' },
    { name: 'Michael Chen', email: 'michael@example.com' },
    { name: 'Emma Wilson', email: 'emma@example.com' },
    { name: 'David Smith', email: 'david@example.com' },
    { name: 'Lisa Rodriguez', email: 'lisa@example.com' },
    { name: 'James Taylor', email: 'james@example.com' },
    { name: 'Anna Mueller', email: 'anna@example.com' },
    { name: 'Robert Brown', email: 'robert@example.com' },
    { name: 'Sophie Martin', email: 'sophie@example.com' },
    { name: 'Kevin Park', email: 'kevin@example.com' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        ...u,
        password: hashedPassword,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name.replace(' ', '')}`,
      },
    });
  }

  // 2. Create Trips for Demo User
  console.log('Seeding trips and activities...');

  // Trip 1: European Adventure
  const euroTrip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'European Adventure',
      description: 'A grand tour across the most iconic cities of Europe: Paris, Rome, and Barcelona.',
      startDate: new Date('2026-06-15'),
      endDate: new Date('2026-06-25'),
      totalBudget: 3500,
      coverImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200',
      activities: {
        create: [
          { title: 'Eiffel Tower Sunrise', location: 'Paris, France', date: new Date('2026-06-15'), startTime: '06:00', duration: 120, cost: 50, category: 'Sightseeing' },
          { title: 'Louvre Museum Tour', location: 'Paris, France', date: new Date('2026-06-15'), startTime: '10:00', duration: 180, cost: 25, category: 'Culture' },
          { title: 'Le Marais Food Walk', location: 'Paris, France', date: new Date('2026-06-16'), startTime: '12:00', duration: 150, cost: 80, category: 'Food' },
          { title: 'Seine River Cruise', location: 'Paris, France', date: new Date('2026-06-16'), startTime: '20:00', duration: 90, cost: 40, category: 'Relaxation' },
          { title: 'Arrival in Rome', location: 'Rome, Italy', date: new Date('2026-06-18'), startTime: '11:00', duration: 60, cost: 0, category: 'Transport' },
          { title: 'Colosseum Private Tour', location: 'Rome, Italy', date: new Date('2026-06-19'), startTime: '09:00', duration: 180, cost: 120, category: 'Culture' },
          { title: 'Pasta Making Class', location: 'Rome, Italy', date: new Date('2026-06-19'), startTime: '17:00', duration: 180, cost: 95, category: 'Food' },
          { title: 'Vatican Museums', location: 'Vatican City', date: new Date('2026-06-20'), startTime: '08:00', duration: 240, cost: 30, category: 'Culture' },
          { title: 'Tapas Crawl', location: 'Barcelona, Spain', date: new Date('2026-06-22'), startTime: '19:00', duration: 240, cost: 70, category: 'Food' },
          { title: 'Sagrada Familia Visit', location: 'Barcelona, Spain', date: new Date('2026-06-23'), startTime: '10:00', duration: 120, cost: 35, category: 'Sightseeing' },
          { title: 'Park Guell Exploration', location: 'Barcelona, Spain', date: new Date('2026-06-23'), startTime: '15:00', duration: 120, cost: 15, category: 'Nature' },
        ]
      },
      notes: {
        create: [
          { content: 'Remember to book the train from Paris to Rome in advance!' },
          { content: 'Keep physical copies of passports and insurance documents.' }
        ]
      },
      checklists: {
        create: [
          { item: 'Passport', category: 'Documents', isPacked: true },
          { item: 'Universal Adapter', category: 'Electronics', isPacked: true },
          { item: 'Comfortable Walking Shoes', category: 'Clothing', isPacked: false },
          { item: 'First Aid Kit', category: 'Medications', isPacked: false },
        ]
      }
    }
  });

  // Trip 2: Tokyo Explorer
  await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'Tokyo Explorer',
      description: 'Diving deep into the neon-lit streets and ancient temples of Tokyo.',
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-15'),
      totalBudget: 2000,
      coverImage: 'https://images.unsplash.com/photo-1540959733332-e94e1bf32f38?q=80&w=1200',
      activities: {
        create: [
          { title: 'Shibuya Crossing & Hachiko', location: 'Shibuya, Tokyo', date: new Date('2026-09-10'), startTime: '10:00', duration: 60, cost: 0, category: 'Sightseeing' },
          { title: 'Robot Restaurant Show', location: 'Shinjuku, Tokyo', date: new Date('2026-09-10'), startTime: '19:00', duration: 90, cost: 85, category: 'Nightlife' },
          { title: 'Tsukiji Outer Market Breakfast', location: 'Tsukiji, Tokyo', date: new Date('2026-09-11'), startTime: '07:00', duration: 120, cost: 45, category: 'Food' },
          { title: 'TeamLab Borderless', location: 'Odaiba, Tokyo', date: new Date('2026-09-11'), startTime: '13:00', duration: 180, cost: 35, category: 'Culture' },
          { title: 'Akihabara Electronics Town', location: 'Akihabara, Tokyo', date: new Date('2026-09-12'), startTime: '14:00', duration: 240, cost: 0, category: 'Shopping' },
          { title: 'Senso-ji Temple', location: 'Asakusa, Tokyo', date: new Date('2026-09-13'), startTime: '09:00', duration: 120, cost: 0, category: 'Culture' },
        ]
      }
    }
  });

  // Trip 3: Bali Retreat
  await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'Bali Retreat',
      description: 'A perfect mix of yoga, surfing, and exploring the lush jungles of Ubud.',
      startDate: new Date('2026-11-20'),
      endDate: new Date('2026-11-27'),
      totalBudget: 1500,
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200',
      activities: {
        create: [
          { title: 'Sunrise Yoga in Ubud', location: 'Ubud, Bali', date: new Date('2026-11-20'), startTime: '06:30', duration: 90, cost: 15, category: 'Relaxation' },
          { title: 'Monkey Forest Sanctuary', location: 'Ubud, Bali', date: new Date('2026-11-21'), startTime: '10:00', duration: 120, cost: 10, category: 'Nature' },
          { title: 'Tegalalang Rice Terraces', location: 'Ubud, Bali', date: new Date('2026-11-21'), startTime: '14:00', duration: 120, cost: 5, category: 'Nature' },
          { title: 'Surfing Lessons in Canggu', location: 'Canggu, Bali', date: new Date('2026-11-23'), startTime: '09:00', duration: 180, cost: 40, category: 'Adventure' },
          { title: 'Sunset at Uluwatu Temple', location: 'Uluwatu, Bali', date: new Date('2026-11-25'), startTime: '17:00', duration: 120, cost: 20, category: 'Culture' },
        ]
      }
    }
  });

  // 3. Create Notifications for Demo User
  console.log('Seeding notifications...');
  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, title: 'Welcome to Traveloop!', message: 'Start planning your next adventure today.', type: 'welcome' },
      { userId: demoUser.id, title: 'Trip Reminder', message: 'Your European Adventure starts in just 30 days!', type: 'trip' },
      { userId: demoUser.id, title: 'Budget Tip', message: 'Consider booking Paris activities now to save up to 20%.', type: 'budget' },
    ]
  });

  console.log('✅ Seed data successfully created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
