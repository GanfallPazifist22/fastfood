// src/OrderMenu.tsx
import { useState } from "react";

interface Item {
  id: number;
  name: string;
  price: number;
  quantity?: number; // optional for cart items
}

export default function OrderMenu() {
  const [cart, setCart] = useState<Item[]>([]);

  const menu: Item[] = [
    { id: 1, name: "Cola", price: 20 },
    { id: 2, name: "French Fries", price: 30 },
    { id: 3, name: "Hamburger", price: 50 },
  ];

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const incrementQty = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      )
    );
  };

  const decrementQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) }
            : item
        )
        .filter((item) => item.quantity && item.quantity > 0)
    );
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price * (item.quantity || 1)),
    0
  );

  return (
    <div className="p-8 bg-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6">📋 Order Menu</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menu.map((item) => (
          <div
            key={item.id}
            className="p-4 border rounded-2xl shadow-md flex flex-col items-center"
          >
            <h3 className="text-xl font-semibold">{item.name}</h3>
            <p className="text-gray-600">{item.price}฿</p>
            <button
              onClick={() => addToCart(item)}
              className="mt-3 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 border-t">
        <h3 className="text-2xl font-semibold mb-2">🛒 Cart</h3>
        {cart.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <ul>
            {cart.map((c) => (
              <li key={c.id} className="flex items-center gap-4 mb-2">
                <span>
                  {c.name} - {c.price}฿ x {c.quantity}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => decrementQty(c.id)}
                    className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <button
                    onClick={() => incrementQty(c.id)}
                    className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(c.id)}
                    className="px-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {cart.length > 0 && (
          <div className="mt-4 font-semibold">Total: {totalPrice}฿</div>
        )}
      </div>
    </div>
  );
}
