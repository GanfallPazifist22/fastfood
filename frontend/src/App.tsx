import { useEffect, useState } from "react";
import "./App.css";

type MenuItem = {
  name: string;
  price: number;
};

type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

type FoodStock = {
  name: string;
  quantity: number;
};

const TAX_RATE = 0.07;

function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [foodStock, setFoodStock] = useState<FoodStock[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  // Fetch menu, orders, and food stock
  useEffect(() => {
    fetch("http://localhost:3000/menu")
      .then((res) => res.json())
      .then(setMenu)
      .catch(() => setError("Failed to load menu."));

    fetch("http://localhost:3000/orders")
      .then((res) => res.json())
      .then(setOrders)
      .catch(() => {});

    fetch("http://localhost:3000/foods")
      .then((res) => res.json())
      .then(setFoodStock)
      .catch(() => console.log("Failed to load food stock"));
  }, []);

  // Add item to cart
  const addToCart = () => {
    if (!selectedItem || quantity < 1) return;

    const stockItem = foodStock.find((f) => f.name === selectedItem);
    if (!stockItem || quantity > stockItem.quantity) {
      setError(`Only ${stockItem?.quantity || 0} ${selectedItem} available`);
      return;
    }

    const item = menu.find((m) => m.name === selectedItem);
    if (!item) return;

    setCart((prev) => {
      const exists = prev.find((c) => c.name === selectedItem);
      if (exists) {
        return prev.map((c) =>
          c.name === selectedItem
            ? { ...c, quantity: c.quantity + quantity }
            : c
        );
      }
      return [...prev, { name: item.name, price: item.price, quantity }];
    });

    setSelectedItem("");
    setQuantity(1);
    setError("");
  };

  const removeFromCart = (name: string) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
  };

  const editCartItem = (name: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.name === name ? { ...item, quantity: qty } : item))
    );
  };

  // Place order
  const handleOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");
    setConfirmation("");

    try {
      const orderBody = {
        items: cart.map((c) => ({ name: c.name, quantity: c.quantity, price: c.price })),
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        paymentMethod: "Cash",
      };

  const res = await fetch("http://localhost:3000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderBody),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");

      // Update stock in UI
      setFoodStock((prev) =>
        prev.map((f) => {
          const cartItem = cart.find((c) => c.name === f.name);
          return cartItem ? { ...f, quantity: f.quantity - cartItem.quantity } : f;
        })
      );

      setConfirmation("Order placed!");
      setCart([]);

      const ordersRes = await fetch("http://localhost:3001/orders");
      const ordersData = await ordersRes.json();
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="container">
      <h1>🍔 FastFood Order</h1>

      {/* Menu */}
      <div>
        <h2>Add to Cart</h2>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="" disabled>
            Select item
          </option>
          {menu.map((item) => {
            const stockItem = foodStock.find((f) => f.name === item.name);
            const disabled = stockItem?.quantity === 0;
            return (
              <option key={item.name} value={item.name} disabled={disabled}>
                {item.name} {disabled ? "(Sold out)" : ""}
              </option>
            );
          })}
        </select>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button onClick={addToCart}>Add</button>
      </div>

      {/* Food stock */}
      <div>
        <h2>Current Food Stock</h2>
        <ul>
          {foodStock.map((f) => (
            <li key={f.name}>
              {f.name}: {f.quantity} remaining
            </li>
          ))}
        </ul>
      </div>

      {/* Cart */}
      <div>
        <h2>Cart</h2>
        {cart.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item.name}>
                {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => editCartItem(item.name, Number(e.target.value))}
                />
                <button onClick={() => removeFromCart(item.name)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <div>
          Subtotal: ${subtotal.toFixed(2)} | Tax: ${tax.toFixed(2)} | Total: ${total.toFixed(2)}
        </div>
        <button onClick={handleOrder} disabled={loading || cart.length === 0}>
          {loading ? "Ordering..." : "Place Order"}
        </button>
        {confirmation && <p>{confirmation}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {/* Orders */}
      <div>
        <h2>Orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <ul>
            {orders.map((o, idx) => (
              <li key={idx}>
                {o.items.map(
                  (i: any) =>
                    `${i.quantity} x ${i.name} ($${(i.price * i.quantity).toFixed(2)}) `
                )}
                | Total: ${o.total.toFixed(2)} | Payment: {o.paymentMethod}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
