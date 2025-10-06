import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🗑️  Cleaning database...');
    
    // Delete all data in correct order (respecting foreign key constraints)
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleaned successfully');
    
    console.log('👤 Creating admin user...');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@dermatouch.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@dermatouch.com');
    console.log('🔑 Password: admin123');
    
    console.log('🎉 Database reset completed!');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();