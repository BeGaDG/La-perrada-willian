import type { Product, Order } from './types';

export const products: Product[] = [
  {
    id: 'hotdog-clasico',
    name: 'Perro Clásico',
    description: 'Salchicha, pan fresco, papas trituradas y nuestras salsas caseras.',
    price: 8000,
    category: 'Perros Calientes',
    imageUrl: 'https://picsum.photos/seed/hotdog1/600/400',
    imageHint: 'hot dog'
  },
  {
    id: 'hotdog-especial',
    name: 'Perro Especial',
    description: 'Todo lo del clásico, más tocineta crujiente y queso derretido.',
    price: 12000,
    category: 'Perros Calientes',
    imageUrl: 'https://picsum.photos/seed/hotdog2/600/400',
    imageHint: 'hot dog sausage'
  },
  {
    id: 'hotdog-gratinado',
    name: 'Perro Gratinado',
    description: 'Una capa generosa de queso mozzarella gratinado sobre tu perro especial.',
    price: 15000,
    category: 'Perros Calientes',
    imageUrl: 'https://picsum.photos/seed/hotdog3/600/400',
    imageHint: 'hot dog cheese'
  },
  {
    id: 'burger-sencilla',
    name: 'Hamburguesa Sencilla',
    description: 'Carne de res, lechuga, tomate, y salsas en pan artesanal.',
    price: 10000,
    category: 'Hamburguesas',
    imageUrl: 'https://picsum.photos/seed/burger1/600/400',
    imageHint: 'hamburger'
  },
  {
    id: 'burger-doble',
    name: 'Hamburguesa Doble',
    description: 'Doble carne, doble queso, tocineta, y vegetales frescos.',
    price: 18000,
    category: 'Hamburguesas',
    imageUrl: 'https://picsum.photos/seed/burger2/600/400',
    imageHint: 'double cheeseburger'
  },
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    description: 'Refrescante bebida gaseosa para acompañar tu comida.',
    price: 3000,
    category: 'Bebidas',
    imageUrl: 'https://picsum.photos/seed/soda1/600/400',
    imageHint: 'soda can'
  },
  {
    id: 'jugo-natural',
    name: 'Jugo Natural',
    description: 'Jugo de frutas de temporada, hecho al momento. Maracuyá o Mora.',
    price: 5000,
    category: 'Bebidas',
    imageUrl: 'https://picsum.photos/seed/juice1/600/400',
    imageHint: 'juice glass'
  },
  {
    id: 'salchipapa',
    name: 'Salchipapa',
    description: 'Crujientes papas a la francesa con trozos de salchicha y salsas.',
    price: 9000,
    category: 'Otros',
    imageUrl: 'https://picsum.photos/seed/fries1/600/400',
    imageHint: 'french fries'
  }
];

export let orders: Order[] = [
  {
    id: 'order-1672531200000',
    userId: 'user-123',
    items: [
      { productId: 'hotdog-especial', quantity: 2, price: 12000 },
      { productId: 'coca-cola', quantity: 2, price: 3000 }
    ],
    total: 30000,
    status: 'COMPLETADO',
    createdAt: new Date('2023-01-01T12:00:00Z')
  },
  {
    id: 'order-1672617600000',
    userId: 'user-456',
    items: [
      { productId: 'burger-doble', quantity: 1, price: 18000 }
    ],
    total: 18000,
    status: 'EN_COCINA',
    createdAt: new Date('2023-01-02T12:00:00Z')
  },
  {
    id: 'order-1672704000000',
    userId: 'user-123',
    items: [
      { productId: 'salchipapa', quantity: 1, price: 9000 },
      { productId: 'jugo-natural', quantity: 1, price: 5000 }
    ],
    total: 14000,
    status: 'PAGADO',
    createdAt: new Date()
  }
];
