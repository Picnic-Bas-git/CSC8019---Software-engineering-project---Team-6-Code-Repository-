//This is a temporary hard-coded menu to enable us to design the frontend cards

const MENU_ITEMS = [
  { id: 'americano', name: 'Americano', image: '/menu/americano.svg', prices: { regular: 1.5, large: 2.0 } },
  {
    id: 'americano_milk',
    name: 'Americano with milk',
    image: '/menu/americano_milk.svg',
    prices: { regular: 2.0, large: 2.5 },
  },
  { id: 'latte', name: 'Latte', image: '/menu/latte.svg', prices: { regular: 2.5, large: 3.0 } },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    image: '/menu/cappuccino.svg',
    prices: { regular: 2.5, large: 3.0 },
  },
  {
    id: 'hot_chocolate',
    name: 'Hot Chocolate',
    image: '/menu/hot_chocolate.svg',
    prices: { regular: 2.0, large: 2.5 },
  },
  { id: 'mocha', name: 'Mocha', image: '/menu/mocha.svg', prices: { regular: 2.5, large: 3.0 } },
  { id: 'water', name: 'Mineral Water', image: '/menu/water.svg', prices: { regular: 1.0 } },
];

export function getMenuItems() {
  return MENU_ITEMS;
}
