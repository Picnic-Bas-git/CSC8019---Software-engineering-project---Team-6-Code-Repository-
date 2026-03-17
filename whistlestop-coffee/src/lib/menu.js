//This is a temporary hard-coded menu to enable us to design the frontend cards

const MENU_ITEMS = [
  { id: 'americano', name: 'Americano', prices: { regular: 1.5, large: 2.0 } },
  {
    id: 'americano_milk',
    name: 'Americano with milk',
    prices: { regular: 2.0, large: 2.5 },
  },
  { id: 'latte', name: 'Latte', prices: { regular: 2.5, large: 3.0 } },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    prices: { regular: 2.5, large: 3.0 },
  },
  {
    id: 'hot_chocolate',
    name: 'Hot Chocolate',
    prices: { regular: 2.0, large: 2.5 },
  },
  { id: 'mocha', name: 'Mocha', prices: { regular: 2.5, large: 3.0 } },
  { id: 'water', name: 'Mineral Water', prices: { regular: 1.0 } },
];

export function getMenuItems() {
  return MENU_ITEMS;
}
