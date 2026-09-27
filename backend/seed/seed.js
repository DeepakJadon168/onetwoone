// This script seeds sample data (1 admin + 1 test user + a realistic vehicle catalog) into the database.
// Run with: node seed/seed.js
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Coupon = require("../models/Coupon"); // User/Vehicle require ke saath

dotenv.config();
connectDB();

const run = async () => {
  try {
    await User.deleteMany({ email: { $in: ["admin@onetoone.com", "customer@onetoone.com"] } });
    await Vehicle.deleteMany({});

    await User.create({
      name: "Admin",
      email: "admin@onetoone.com",
      phone: "9999999999",
      password: "admin123",
      role: "admin",
    });

    await User.create({
      name: "Test Customer",
      email: "customer@onetoone.com",
      phone: "9888888888",
      password: "customer123",
      role: "user",
    });

    await Coupon.deleteMany({});
    await Coupon.insertMany([
      { code: "FIRST50", discountPercent: 50, minAmount: 0 },
      { code: "WEEKEND10", discountPercent: 10, minAmount: 300 },
      { code: "INDORE20", discountPercent: 20, minAmount: 500 },
    ]);

    await Vehicle.insertMany([
      {
        name: "Activa 6G",
        brand: "Honda",
        type: "Scooty",
        imageUrl: "https://loremflickr.com/600/400/scooter,honda?lock=101",
        pricePerHour: 40,
        pricePerDay: 350,
        location: "Vijay Nagar, Indore",
        description: "Sabse popular scooty — halki, chalane me aasaan, aur mileage bhi zabardast. Daily commute ke liye best.",
        fuelType: "Petrol",
        seats: 2,
        rating: 4.6,
        numReviews: 128,
        features: ["Helmet Included", "Free Delivery", "Low Fuel Cost"],
      },
      {
        name: "Jupiter 125",
        brand: "TVS",
        type: "Scooty",
        imageUrl: "https://loremflickr.com/600/400/scooter,tvs?lock=102",
        pricePerHour: 38,
        pricePerDay: 320,
        location: "Palasia, Indore",
        description: "Spacious footboard aur smooth ride, college students me favourite.",
        fuelType: "Petrol",
        seats: 2,
        rating: 4.4,
        numReviews: 76,
        features: ["Helmet Included", "USB Charging"],
      },
      {
        name: "Ather 450X",
        brand: "Ather",
        type: "Scooty",
        imageUrl: "https://loremflickr.com/600/400/electric,scooter?lock=103",
        pricePerHour: 55,
        pricePerDay: 480,
        location: "Rajwada, Indore",
        description: "Full electric scooty — zero pollution, super smooth aur fast acceleration.",
        fuelType: "Electric",
        seats: 2,
        rating: 4.8,
        numReviews: 54,
        features: ["Fast Charging", "App Connected", "Eco Friendly"],
      },
      {
        name: "Pulsar 150",
        brand: "Bajaj",
        type: "Bike",
        imageUrl: "https://loremflickr.com/600/400/motorcycle,bajaj?lock=104",
        pricePerHour: 60,
        pricePerDay: 500,
        location: "Vijay Nagar, Indore",
        description: "Sporty look aur strong engine, long highway rides ke liye perfect.",
        fuelType: "Petrol",
        seats: 2,
        rating: 4.5,
        numReviews: 92,
        features: ["Helmet Included", "Highway Ready"],
      },
      {
        name: "Royal Enfield Classic 350",
        brand: "Royal Enfield",
        type: "Bike",
        imageUrl: "https://loremflickr.com/600/400/royalenfield,motorcycle?lock=105",
        pricePerHour: 90,
        pricePerDay: 900,
        location: "MG Road, Indore",
        description: "Thumping engine sound, road trips aur photoshoots ke liye No.1 choice.",
        fuelType: "Petrol",
        seats: 2,
        rating: 4.9,
        numReviews: 141,
        features: ["Helmet Included", "Premium Bike", "Weekend Special"],
      },
      {
        name: "KTM Duke 200",
        brand: "KTM",
        type: "Bike",
        imageUrl: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600&q=80",
        pricePerHour: 85,
        pricePerDay: 800,
        location: "Bhawarkuan, Indore",
        description: "Powerful naked street bike, thrill lovers ke liye best.",
        fuelType: "Petrol",
        seats: 2,
        rating: 4.7,
        numReviews: 63,
        features: ["Helmet Included", "Sporty Ride"],
      },
      {
        name: "Swift Dzire",
        brand: "Maruti Suzuki",
        type: "Car",
        imageUrl: "https://loremflickr.com/600/400/motorcycle,ktm?lock=106",
        pricePerHour: 150,
        pricePerDay: 1800,
        location: "Palasia, Indore",
        description: "Comfortable sedan, family outings ya business trips dono ke liye ideal.",
        fuelType: "Petrol",
        seats: 5,
        rating: 4.5,
        numReviews: 87,
        features: ["AC", "Music System", "Free Delivery"],
      },
      {
        name: "Hyundai Creta",
        brand: "Hyundai",
        type: "Car",
        imageUrl: "https://loremflickr.com/600/400/sedan,car?lock=107",
        pricePerHour: 220,
        pricePerDay: 2800,
        location: "Vijay Nagar, Indore",
        description: "Premium SUV feel, long family trips ke liye comfortable aur spacious.",
        fuelType: "Diesel",
        seats: 5,
        rating: 4.8,
        numReviews: 45,
        features: ["AC", "Sunroof", "Premium SUV"],
      },
      {
        name: "Tata Nexon EV",
        brand: "Tata",
        type: "Car",
        imageUrl: "https://images.unsplash.com/photo-1617654112368-307921291f42?w=600&q=80",
        pricePerHour: 200,
        pricePerDay: 2500,
        location: "Rajwada, Indore",
        description: "Electric SUV — chalane ka running cost bahut kam, city drives ke liye perfect.",
        fuelType: "Electric",
        seats: 5,
        rating: 4.6,
        numReviews: 29,
        features: ["AC", "Electric", "Eco Friendly"],
      },
      {
        name: "Access 125",
        brand: "Suzuki",
        type: "Scooty",
        imageUrl: "https://loremflickr.com/600/400/suv,car?lock=108", 
        pricePerHour: 40,
        pricePerDay: 340,
        location: "Bhawarkuan, Indore",
        description: "Stylish aur powerful 125cc engine, office commute ke liye great.",
        fuelType: "Petrol",
        seats: 2,
        rating: 4.3,
        numReviews: 38,
        features: ["Helmet Included"],
      },
    ]);

    console.log("Seed data inserted successfully!");
    console.log("Admin login    -> email: admin@onetoone.com    | password: admin123");
    console.log("Customer login -> email: customer@onetoone.com | password: customer123");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
