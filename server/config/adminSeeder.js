import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('[Seeding] Admin user not found. Seeding database...');
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'System',
        email: adminEmail,
        phone: '0000000000',
        password: 'admin123', // Automatically hashed by the pre-save hook
        role: 'admin'
      });

      await adminUser.save();
      console.log('[Seeding] Admin user successfully seeded (admin@gmail.com / admin123)');
    } else {
      console.log('[Seeding] Admin user already exists. Skipping seeder.');
    }

    const categoryCount = await mongoose.connection.models.Category?.countDocuments() || 0;
    if (categoryCount === 0) {
      console.log('[Seeding] Seeding default categories...');
      const Category = mongoose.connection.models.Category;
      if (Category) {
        await Category.insertMany([
          { name: 'Grains', description: 'Wheat, Rice, Barley, Maize, and Millet crops.', rateRange: '₹2,000 - ₹8,000/qtl' },
          { name: 'Vegetables', description: 'Fresh potatoes, onions, tomatoes, and leafy green products.', rateRange: '₹1,000 - ₹4,000/qtl' },
          { name: 'Fruits', description: 'Apples, mangoes, citrus fruits, and seasonal orchards.', rateRange: '₹5,000 - ₹15,000/qtl' },
          { name: 'Oilseeds', description: 'Mustard seeds, soybeans, sunflower, and groundnut raw stocks.', rateRange: '₹4,500 - ₹7,500/qtl' },
        ]);
        console.log('[Seeding] Default categories successfully seeded.');
      }
    }

  } catch (error) {
    console.error(`[Seeding Error] Failed to seed admin user: ${error.message}`);
  }
};

export default seedAdmin;
