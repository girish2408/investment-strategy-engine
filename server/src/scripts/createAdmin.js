import chromaService from '../services/chromaService.js';

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const adminExists = await chromaService.getUserByEmail('admin@example.com');
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await chromaService.createUser(
      'admin@example.com',
      'admin123',
      'admin'
    );

    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    console.log('Please change the password after first login');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Run the script
createAdminUser(); 