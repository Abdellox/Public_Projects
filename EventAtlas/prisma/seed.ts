import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Music", slug: "music", icon: "music", color: "#8b5cf6" },
  { name: "Sports", slug: "sports", icon: "trophy", color: "#22c55e" },
  { name: "Business", slug: "business", icon: "briefcase", color: "#3b82f6" },
  { name: "Technology", slug: "technology", icon: "cpu", color: "#6366f1" },
  { name: "Education", slug: "education", icon: "graduation-cap", color: "#f59e0b" },
  { name: "Food and Drink", slug: "food-and-drink", icon: "utensils", color: "#ef4444" },
  { name: "Arts and Culture", slug: "arts-and-culture", icon: "palette", color: "#ec4899" },
  { name: "Festivals", slug: "festivals", icon: "party-popper", color: "#f97316" },
  { name: "Networking", slug: "networking", icon: "users", color: "#14b8a6" },
  { name: "Health and Wellness", slug: "health-and-wellness", icon: "heart", color: "#06b6d4" },
  { name: "Family and Children", slug: "family-and-children", icon: "baby", color: "#a855f7" },
  { name: "Travel", slug: "travel", icon: "plane", color: "#0ea5e9" },
  { name: "Nightlife", slug: "nightlife", icon: "moon", color: "#7c3aed" },
  { name: "Free Events", slug: "free-events", icon: "gift", color: "#10b981" },
  { name: "Other", slug: "other", icon: "calendar", color: "#6b7280" },
];

const COUNTRIES = [
  { name: "United States", code: "US", slug: "united-states", emoji: "🇺🇸", latitude: 39.83, longitude: -98.58 },
  { name: "France", code: "FR", slug: "france", emoji: "🇫🇷", latitude: 46.23, longitude: 2.21 },
  { name: "United Kingdom", code: "GB", slug: "united-kingdom", emoji: "🇬🇧", latitude: 55.38, longitude: -3.44 },
  { name: "Germany", code: "DE", slug: "germany", emoji: "🇩🇪", latitude: 51.17, longitude: 10.45 },
  { name: "Japan", code: "JP", slug: "japan", emoji: "🇯🇵", latitude: 36.2, longitude: 138.25 },
  { name: "Australia", code: "AU", slug: "australia", emoji: "🇦🇺", latitude: -25.27, longitude: 133.78 },
  { name: "Canada", code: "CA", slug: "canada", emoji: "🇨🇦", latitude: 56.13, longitude: -106.35 },
  { name: "Brazil", code: "BR", slug: "brazil", emoji: "🇧🇷", latitude: -14.24, longitude: -51.93 },
  { name: "UAE", code: "AE", slug: "uae", emoji: "🇦🇪", latitude: 23.42, longitude: 53.85 },
  { name: "India", code: "IN", slug: "india", emoji: "🇮🇳", latitude: 20.59, longitude: 78.96 },
];

const CITIES_DATA: Record<string, { name: string; slug: string; lat: number; lng: number }[]> = {
  US: [
    { name: "New York", slug: "new-york", lat: 40.71, lng: -74.01 },
    { name: "Los Angeles", slug: "los-angeles", lat: 34.05, lng: -118.24 },
    { name: "Chicago", slug: "chicago", lat: 41.88, lng: -87.63 },
    { name: "Miami", slug: "miami", lat: 25.76, lng: -80.19 },
    { name: "San Francisco", slug: "san-francisco", lat: 37.77, lng: -122.42 },
  ],
  FR: [
    { name: "Paris", slug: "paris", lat: 48.86, lng: 2.35 },
    { name: "Lyon", slug: "lyon", lat: 45.76, lng: 4.84 },
    { name: "Nice", slug: "nice", lat: 43.71, lng: 7.26 },
  ],
  GB: [
    { name: "London", slug: "london", lat: 51.51, lng: -0.13 },
    { name: "Manchester", slug: "manchester", lat: 53.48, lng: -2.24 },
    { name: "Edinburgh", slug: "edinburgh", lat: 55.95, lng: -3.19 },
  ],
  DE: [
    { name: "Berlin", slug: "berlin", lat: 52.52, lng: 13.41 },
    { name: "Munich", slug: "munich", lat: 48.14, lng: 11.58 },
    { name: "Hamburg", slug: "hamburg", lat: 53.55, lng: 9.99 },
  ],
  JP: [
    { name: "Tokyo", slug: "tokyo", lat: 35.68, lng: 139.65 },
    { name: "Osaka", slug: "osaka", lat: 34.69, lng: 135.5 },
    { name: "Kyoto", slug: "kyoto", lat: 35.01, lng: 135.77 },
  ],
  AU: [
    { name: "Sydney", slug: "sydney", lat: -33.87, lng: 151.21 },
    { name: "Melbourne", slug: "melbourne", lat: -37.81, lng: 144.96 },
  ],
  CA: [
    { name: "Toronto", slug: "toronto", lat: 43.65, lng: -79.38 },
    { name: "Vancouver", slug: "vancouver", lat: 49.28, lng: -123.12 },
  ],
  BR: [
    { name: "São Paulo", slug: "sao-paulo", lat: -23.55, lng: -46.63 },
    { name: "Rio de Janeiro", slug: "rio-de-janeiro", lat: -22.91, lng: -43.17 },
  ],
  AE: [
    { name: "Dubai", slug: "dubai", lat: 25.2, lng: 55.27 },
  ],
  IN: [
    { name: "Mumbai", slug: "mumbai", lat: 19.08, lng: 72.88 },
    { name: "Delhi", slug: "delhi", lat: 28.7, lng: 77.1 },
  ],
};

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(10 + Math.floor(Math.random() * 12), Math.random() > 0.5 ? 0 : 30, 0, 0);
  return d;
}

function endDate(start: Date): Date {
  const d = new Date(start);
  d.setHours(d.getHours() + 2 + Math.floor(Math.random() * 4));
  return d;
}

async function main() {
  console.log("🗑️  Cleaning database...");
  await prisma.notification.deleteMany();
  await prisma.eventReport.deleteMany();
  await prisma.eventReminder.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizerProfile.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("📂 Creating categories...");
  for (const cat of CATEGORIES) {
    await prisma.category.create({ data: cat });
  }

  console.log("🌍 Creating countries...");
  const countryRecords: Record<string, string> = {};
  for (const c of COUNTRIES) {
    const rec = await prisma.country.create({ data: c });
    countryRecords[c.code] = rec.id;
  }

  console.log("🏙️  Creating cities...");
  const cityRecords: { id: string; countryId: string }[] = [];
  for (const [code, cities] of Object.entries(CITIES_DATA)) {
    for (const city of cities) {
      const rec = await prisma.city.create({
        data: {
          name: city.name,
          slug: city.slug,
          latitude: city.lat,
          longitude: city.lng,
          countryId: countryRecords[code],
        },
      });
      cityRecords.push({ id: rec.id, countryId: countryRecords[code] });
    }
  }

  console.log("👤 Creating demo users...");
  const hash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: { name: "Admin", email: "admin@eventatlas.com", password: hash, role: "ADMIN" },
  });
  const organizerUser = await prisma.user.create({
    data: { name: "EventPro Organizer", email: "organizer@eventatlas.com", password: hash, role: "ORGANIZER" },
  });
  await prisma.user.create({
    data: { name: "Jane User", email: "user@eventatlas.com", password: hash, role: "USER" },
  });

  console.log("🏢 Creating organizer profile...");
  const orgProfile = await prisma.organizerProfile.create({
    data: {
      userId: organizerUser.id,
      name: "EventPro Productions",
      description: "Leading event organizer bringing amazing experiences to cities worldwide.",
      website: "https://eventpro.example.com",
      email: "info@eventpro.example.com",
      approved: true,
    },
  });

  const categories = await prisma.category.findMany();
  const allCities = await prisma.city.findMany({ include: { country: true } });

  const EVENTS = [
    { title: "Summer Jazz Festival", desc: "An evening of smooth jazz under the stars featuring world-renowned artists.", cat: "music" },
    { title: "Tech Startup Summit 2025", desc: "Connect with founders, investors, and innovators shaping the future of technology.", cat: "technology" },
    { title: "Marathon de Paris", desc: "Join thousands of runners in one of the world's most iconic marathon routes.", cat: "sports" },
    { title: "Global Business Forum", desc: "Industry leaders share insights on the future of global trade and commerce.", cat: "business" },
    { title: "Japanese Tea Ceremony Workshop", desc: "Learn the ancient art of Japanese tea preparation in an authentic setting.", cat: "arts-and-culture" },
    { title: "Street Food Festival", desc: "Taste dishes from over 30 countries at the biggest street food event of the year.", cat: "food-and-drink" },
    { title: "New Year's Eve Gala", desc: "Ring in the new year with live music, dancing, and a spectacular fireworks show.", cat: "festivals" },
    { title: "AI & Machine Learning Conference", desc: "Deep dive into the latest advances in artificial intelligence and machine learning.", cat: "technology" },
    { title: "Sunrise Yoga on the Beach", desc: "Start your day with a calming yoga session as the sun rises over the ocean.", cat: "health-and-wellness" },
    { title: "Startup Networking Night", desc: "Informal networking event for startup founders, developers, and designers.", cat: "networking" },
    { title: "Family Fun Day at the Park", desc: "A day of games, performances, and activities for the whole family to enjoy.", cat: "family-and-children" },
    { title: "Indie Music Showcase", desc: "Discover the hottest indie bands and solo artists in an intimate venue.", cat: "music" },
    { title: "Digital Marketing Masterclass", desc: "Learn proven strategies for growing your business through digital marketing.", cat: "education" },
    { title: "Rooftop Cocktail Evening", desc: "Enjoy craft cocktails with stunning city views at this exclusive rooftop event.", cat: "nightlife" },
    { title: "Free Coding Workshop", desc: "Learn to code from scratch in this completely free hands-on workshop.", cat: "free-events" },
    { title: "Art Exhibition: Modern Visions", desc: "Explore contemporary artworks from emerging artists around the world.", cat: "arts-and-culture" },
    { title: "Soccer Tournament", desc: "Amateur soccer teams compete in this exciting weekend tournament.", cat: "sports" },
    { title: "Wellness Retreat Weekend", desc: "Escape the city for a weekend of meditation, nature walks, and healthy eating.", cat: "health-and-wellness" },
    { title: "Travel Photography Workshop", desc: "Master the art of travel photography with professional tips and field practice.", cat: "travel" },
    { title: "Community Volunteer Day", desc: "Join your neighbors in giving back to the community through hands-on projects.", cat: "free-events" },
  ];

  console.log("📅 Creating events...");
  for (let i = 0; i < EVENTS.length; i++) {
    const e = EVENTS[i];
    const cat = categories.find((c) => c.slug === e.cat) || categories[0];
    const city = allCities[i % allCities.length];
    const start = daysFromNow(3 + Math.floor(Math.random() * 60));
    const end = endDate(start);
    const isFree = e.cat === "free-events" || Math.random() > 0.7;
    const statuses = ["PUBLISHED", "PUBLISHED", "PUBLISHED", "PENDING", "DRAFT"];

    await prisma.event.create({
      data: {
        title: e.title,
        slug: `${e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}-${i}`,
        shortDescription: e.desc,
        fullDescription: `${e.desc}\n\nJoin us for an unforgettable experience. This event brings together people from all walks of life to celebrate, learn, and connect. Don't miss out on this incredible opportunity to be part of something special.`,
        coverImage: `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop`,
        categoryId: cat.id,
        organizerId: orgProfile.id,
        countryId: city.countryId,
        cityId: city.id,
        venueName: `${city.name} Convention Center`,
        address: `123 Main Street, ${city.name}`,
        latitude: (city.latitude ?? 0) + (Math.random() - 0.5) * 0.05,
        longitude: (city.longitude ?? 0) + (Math.random() - 0.5) * 0.05,
        startDate: start,
        startTime: `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`,
        endDate: end,
        endTime: `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`,
        timeZone: "UTC",
        price: isFree ? 0 : Math.floor(Math.random() * 150) + 10,
        currency: "USD",
        isFree,
        contactEmail: "events@eventpro.example.com",
        isIndoor: Math.random() > 0.4,
        status: statuses[i % statuses.length],
        isFeatured: i < 4,
        viewCount: Math.floor(Math.random() * 500) + 50,
        source: "manual",
      },
    });
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
