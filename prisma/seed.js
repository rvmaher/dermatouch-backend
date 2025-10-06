import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dermatouch.com' },
    update: {},
    create: {
      email: 'admin@dermatouch.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@dermatouch.com' },
    update: {},
    create: {
      email: 'user@dermatouch.com',
      password: userPassword,
      role: 'USER',
    },
  });

  // Create categories
  const categories = [
    {
      name: 'Skincare',
      description: 'Premium skincare products for all skin types',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    },
    {
      name: 'Sunscreen',
      description: 'Sun protection products with SPF',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    },
    {
      name: 'Anti-Aging',
      description: 'Advanced anti-aging solutions',
      image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
    },
    {
      name: 'Moisturizers',
      description: 'Hydrating creams and lotions',
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400',
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    createdCategories.push(created);
  }

  // Create products
  const products = [
    {
      title: 'Vitamin C Serum',
      description: 'Brightening vitamin C serum with antioxidants',
      price: 2499.99,
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
      sku: 'VIT-C-001',
      stock: 50,
      categoryId: createdCategories[0].id,
    },
    {
      title: 'SPF 50 Sunscreen',
      description: 'Broad spectrum sun protection',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      sku: 'SUN-50-001',
      stock: 75,
      categoryId: createdCategories[1].id,
    },
    {
      title: 'Retinol Night Cream',
      description: 'Anti-aging night cream with retinol',
      price: 3499.99,
      image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
      sku: 'RET-NC-001',
      stock: 30,
      categoryId: createdCategories[2].id,
    },
    {
      title: 'Hyaluronic Acid Moisturizer',
      description: 'Deep hydrating moisturizer',
      price: 1899.99,
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400',
      sku: 'HYA-MOI-001',
      stock: 60,
      categoryId: createdCategories[3].id,
    },
    {
      title: 'Niacinamide Serum',
      description: 'Pore minimizing serum with niacinamide',
      price: 1799.99,
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
      sku: 'NIA-SER-001',
      stock: 45,
      categoryId: createdCategories[0].id,
    },
    {
      title: 'Gentle Face Cleanser',
      description: 'Mild cleanser for sensitive skin',
      price: 999.99,
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
      sku: 'GEN-CLE-001',
      stock: 80,
      categoryId: createdCategories[0].id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log('✅ Database seeding completed!');
  console.log(`👤 Admin user: admin@dermatouch.com / admin123`);
  console.log(`👤 Test user: user@dermatouch.com / user123`);
  console.log(`📦 Created ${categories.length} categories`);
  console.log(`🛍️ Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
