import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('AdminPass123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create test user
  const userPassword = await bcrypt.hash('UserPass123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@ecommerce.com' },
    update: {},
    create: {
      email: 'user@ecommerce.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      emailVerified: true,
      isActive: true,
      preferences: {
        create: {
          theme: 'light',
          notifications: true,
          emailNotifications: true,
          currency: 'USD',
          language: 'en',
        },
      },
    },
  });
  console.log(`✅ Test user created: ${user.email}`);

  // Create sample products
  const categories = [
    'smartphones',
    'laptops',
    'fragrances',
    'skincare',
    'groceries',
    'home-decoration',
    'furniture',
    'tops',
    'womens-dresses',
    'womens-shoes',
    'mens-shirts',
    'mens-shoes',
    'mens-watches',
    'womens-watches',
    'womens-bags',
    'womens-jewellery',
    'sunglasses',
    'automotive',
    'motorcycle',
    'lighting',
  ];

  const sampleProducts = [
    {
      title: 'iPhone 15 Pro',
      description: 'The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
      price: 999.99,
      discountPercentage: 5,
      thumbnail: 'https://picsum.photos/seed/iphone15/400/400',
      images: [
        'https://picsum.photos/seed/iphone15-1/800/800',
        'https://picsum.photos/seed/iphone15-2/800/800',
      ],
      category: 'smartphones',
      brand: 'Apple',
      rating: 4.8,
      stock: 50,
    },
    {
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Premium Android smartphone with S Pen, 200MP camera, and AI features.',
      price: 1199.99,
      discountPercentage: 10,
      thumbnail: 'https://picsum.photos/seed/s24ultra/400/400',
      images: [
        'https://picsum.photos/seed/s24ultra-1/800/800',
        'https://picsum.photos/seed/s24ultra-2/800/800',
      ],
      category: 'smartphones',
      brand: 'Samsung',
      rating: 4.7,
      stock: 35,
    },
    {
      title: 'MacBook Pro 16"',
      description: 'Powerful laptop with M3 Max chip, 36GB RAM, and stunning Liquid Retina XDR display.',
      price: 2499.99,
      discountPercentage: 0,
      thumbnail: 'https://picsum.photos/seed/macbookpro/400/400',
      images: [
        'https://picsum.photos/seed/macbookpro-1/800/800',
        'https://picsum.photos/seed/macbookpro-2/800/800',
      ],
      category: 'laptops',
      brand: 'Apple',
      rating: 4.9,
      stock: 20,
    },
    {
      title: 'Dell XPS 15',
      description: 'Ultra-thin laptop with Intel Core i9, NVIDIA RTX 4070, and 4K OLED display.',
      price: 1899.99,
      discountPercentage: 15,
      thumbnail: 'https://picsum.photos/seed/dellxps/400/400',
      images: [
        'https://picsum.photos/seed/dellxps-1/800/800',
        'https://picsum.photos/seed/dellxps-2/800/800',
      ],
      category: 'laptops',
      brand: 'Dell',
      rating: 4.6,
      stock: 25,
    },
    {
      title: 'Chanel No. 5',
      description: 'Timeless feminine fragrance with floral aldehydic notes.',
      price: 135.00,
      discountPercentage: 0,
      thumbnail: 'https://picsum.photos/seed/chanel5/400/400',
      images: ['https://picsum.photos/seed/chanel5-1/800/800'],
      category: 'fragrances',
      brand: 'Chanel',
      rating: 4.9,
      stock: 100,
    },
    {
      title: 'La Mer Moisturizing Cream',
      description: 'Luxurious moisturizer with Miracle Broth for radiant, youthful skin.',
      price: 380.00,
      discountPercentage: 0,
      thumbnail: 'https://picsum.photos/seed/lamer/400/400',
      images: ['https://picsum.photos/seed/lamer-1/800/800'],
      category: 'skincare',
      brand: 'La Mer',
      rating: 4.7,
      stock: 40,
    },
    {
      title: 'Organic Avocados (6 pack)',
      description: 'Fresh, organic Hass avocados perfect for guacamole or toast.',
      price: 8.99,
      discountPercentage: 10,
      thumbnail: 'https://picsum.photos/seed/avocados/400/400',
      images: ['https://picsum.photos/seed/avocados-1/800/800'],
      category: 'groceries',
      brand: 'Organic Farms',
      rating: 4.5,
      stock: 200,
    },
    {
      title: 'Modern Leather Sofa',
      description: 'Elegant 3-seater leather sofa with solid wood frame.',
      price: 1299.99,
      discountPercentage: 20,
      thumbnail: 'https://picsum.photos/seed/sofa/400/400',
      images: [
        'https://picsum.photos/seed/sofa-1/800/800',
        'https://picsum.photos/seed/sofa-2/800/800',
      ],
      category: 'furniture',
      brand: 'ModernHome',
      rating: 4.6,
      stock: 10,
    },
    {
      title: 'Classic White T-Shirt',
      description: '100% organic cotton t-shirt with perfect fit.',
      price: 29.99,
      discountPercentage: 0,
      thumbnail: 'https://picsum.photos/seed/tshirt/400/400',
      images: ['https://picsum.photos/seed/tshirt-1/800/800'],
      category: 'tops',
      brand: 'BasicWear',
      rating: 4.4,
      stock: 500,
    },
    {
      title: 'Rolex Submariner',
      description: 'Iconic diving watch with automatic movement and ceramic bezel.',
      price: 8999.99,
      discountPercentage: 0,
      thumbnail: 'https://picsum.photos/seed/rolex/400/400',
      images: [
        'https://picsum.photos/seed/rolex-1/800/800',
        'https://picsum.photos/seed/rolex-2/800/800',
      ],
      category: 'mens-watches',
      brand: 'Rolex',
      rating: 4.95,
      stock: 5,
    },
  ];

  for (const productData of sampleProducts) {
    const product = await prisma.product.upsert({
      where: { id: sampleProducts.indexOf(productData) + 1 },
      update: productData,
      create: productData,
    });
    console.log(`✅ Product created: ${product.title}`);
  }

  // Create sample address for test user
  await prisma.userAddress.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user.id,
      label: 'Home',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1-555-0123',
      isDefault: true,
    },
  });
  console.log('✅ Sample address created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
