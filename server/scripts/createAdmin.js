const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@chatbot.com' });
    if (!existingAdmin) {
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        username: 'Admin',
        email: 'admin@chatbot.com',
        password: adminPassword,
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin user created: admin@chatbot.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Check if regular user already exists
    const existingUser = await User.findOne({ email: 'user@chatbot.com' });
    if (!existingUser) {
      // Create regular user
      const userPassword = await bcrypt.hash('user123', 10);
      const regularUser = new User({
        username: 'User',
        email: 'user@chatbot.com',
        password: userPassword,
        role: 'user'
      });
      await regularUser.save();
      console.log('✅ Regular user created: user@chatbot.com / user123');
    } else {
      console.log('ℹ️ Regular user already exists');
    }

    console.log('\n🎉 User setup complete!');
    console.log('Admin credentials: admin@chatbot.com / admin123');
    console.log('User credentials: user@chatbot.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

createUsers();
