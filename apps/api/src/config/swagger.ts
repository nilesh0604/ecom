import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: `
## E-Commerce Backend API

A comprehensive RESTful API for an e-commerce platform built with Node.js, Express, TypeScript, and Prisma.

### Features
- **Authentication**: JWT-based authentication with refresh tokens
- **Products**: Full product catalog with search, filtering, and categories
- **Cart**: Shopping cart management with guest cart support
- **Orders**: Complete order lifecycle management
- **Payments**: Stripe payment integration
- **Wishlist**: Product wishlist functionality
- **User Management**: Profile, addresses, and preferences

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.ecommerce.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            phone: { type: 'string', example: '+1234567890' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
            isActive: { type: 'boolean', example: true },
            emailVerified: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'SecureP@ss123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            phone: { type: 'string', example: '+1234567890' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'SecureP@ss123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                refreshToken: { type: 'string', example: 'refresh_token_here' },
                expiresAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },

        // Product schemas
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Wireless Headphones' },
            description: { type: 'string', example: 'High-quality wireless headphones' },
            price: { type: 'number', format: 'decimal', example: 99.99 },
            discountPercentage: { type: 'number', format: 'decimal', example: 10.0 },
            thumbnail: { type: 'string', example: 'https://example.com/image.jpg' },
            images: { type: 'array', items: { type: 'string' } },
            category: { type: 'string', example: 'electronics' },
            brand: { type: 'string', example: 'Sony' },
            rating: { type: 'number', format: 'decimal', example: 4.5 },
            stock: { type: 'integer', example: 100 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['title', 'description', 'price', 'category', 'brand'],
          properties: {
            title: { type: 'string', example: 'Wireless Headphones' },
            description: { type: 'string', example: 'High-quality wireless headphones' },
            price: { type: 'number', example: 99.99 },
            discountPercentage: { type: 'number', example: 10.0 },
            thumbnail: { type: 'string', example: 'https://example.com/image.jpg' },
            images: { type: 'array', items: { type: 'string' } },
            category: { type: 'string', example: 'electronics' },
            brand: { type: 'string', example: 'Sony' },
            stock: { type: 'integer', example: 100 },
          },
        },
        ProductList: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                total: { type: 'integer', example: 100 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                totalPages: { type: 'integer', example: 5 },
              },
            },
          },
        },

        // Cart schemas
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 2 },
            product: { $ref: '#/components/schemas/Product' },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clh123abc' },
            userId: { type: 'integer', nullable: true },
            sessionId: { type: 'string', nullable: true },
            items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
            subtotal: { type: 'number', example: 199.98 },
            itemCount: { type: 'integer', example: 2 },
          },
        },
        AddToCartRequest: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'integer', example: 1 },
            quantity: { type: 'integer', minimum: 1, example: 1 },
          },
        },

        // Order schemas
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clh456def' },
            userId: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
            subtotal: { type: 'number', example: 199.98 },
            tax: { type: 'number', example: 16.00 },
            shipping: { type: 'number', example: 5.99 },
            total: { type: 'number', example: 221.97 },
            currency: { type: 'string', example: 'USD' },
            trackingNumber: { type: 'string', nullable: true },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            address: { $ref: '#/components/schemas/ShippingAddress' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 2 },
            price: { type: 'number', example: 99.99 },
            total: { type: 'number', example: 199.98 },
            product: { $ref: '#/components/schemas/Product' },
          },
        },
        ShippingAddress: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            address: { type: 'string', example: '123 Main St' },
            city: { type: 'string', example: 'New York' },
            state: { type: 'string', example: 'NY' },
            zipCode: { type: 'string', example: '10001' },
            country: { type: 'string', example: 'USA' },
            phone: { type: 'string', example: '+1234567890' },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['shippingAddress'],
          properties: {
            shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
            notes: { type: 'string', example: 'Leave at door' },
          },
        },

        // Payment schemas
        PaymentIntent: {
          type: 'object',
          properties: {
            clientSecret: { type: 'string', example: 'pi_xxx_secret_xxx' },
            paymentIntentId: { type: 'string', example: 'pi_xxx' },
          },
        },
        CreatePaymentRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'number', example: 99.99 },
            currency: { type: 'string', example: 'usd' },
            orderId: { type: 'string', example: 'clh456def' },
          },
        },

        // Wishlist schemas
        WishlistItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            product: { $ref: '#/components/schemas/Product' },
          },
        },

        // Common schemas
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'An error occurred' },
                code: { type: 'string', example: 'ERROR_CODE' },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 5 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
              },
            },
          },
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: { message: 'Resource not found', code: 'NOT_FOUND' },
              },
            },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: { message: 'Validation failed', code: 'VALIDATION_ERROR' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Wishlist', description: 'Wishlist management' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
