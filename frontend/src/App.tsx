// src/App.tsx
import { useEffect, useState } from "react";
import "./App.css";

type MenuItem = {
  name: string;
  price: number;
  image?: string;
  description?: string;
};

type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

const TAX_RATE = 0.07;

function App() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [showMenuPopup, setShowMenuPopup] = useState(false);

  // Load fonts + fetch menu/orders
  useEffect(() => {
    if (!document.getElementById("gothic-font")) {
      const link = document.createElement("link");
      link.id = "gothic-font";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap";
      document.head.appendChild(link);
    }

    // Fetch menu
    fetch("http://localhost:3000/menu")
      .then((res) => res.json())
      .then((data) =>
        setMenu(
          data.map((item: MenuItem) => ({
            ...item,
            image: `/assets/${item.name.replace(/\s/g, "").toLowerCase()}.png`,
            description: `${item.name} is a delicious fast food item.`,
          }))
        )
      )
      .catch(() => setError("Failed to load menu."));

    // Fetch orders
    fetch("http://localhost:3000/orders")
      .then((res) => res.json())
      .then(setOrders)
      .catch(() => {});
  }, []);

  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = () => {
    if (!selectedItem || quantity < 1) return;
    const item = menu.find((m) => m.name === selectedItem);
    if (!item) return;
    setCart((prev) => {
      const exists = prev.find((c) => c.name === selectedItem);
      if (exists) {
        return prev.map((c) =>
          c.name === selectedItem ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prev, { name: item.name, price: item.price, quantity }];
    });
    setSelectedItem("");
    setQuantity(1);
  };

  const removeFromCart = (name: string) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
  };

  const editCartItem = (name: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.name === name ? { ...item, quantity: qty } : item))
    );
  };

  const handleOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError("");
    setConfirmation("");

    try {
      const orderBody = {
        items: cart.map(c => ({ name: c.name, quantity: c.quantity })),
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

      setConfirmation("Order placed!");
      setCart([]);

      // Refresh order history
      const ordersRes = await fetch("http://localhost:3000/orders");
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

  const modalClass = showModal ? "modal show" : "modal";

  return (
    <div className="container" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <h1>🍔 FastFood Order</h1>

      {/* Menu popup */}
      {showMenuPopup && (
        <div className="modal show" onClick={() => setShowMenuPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Menu</h2>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredMenu.map((item) => (
              <div key={item.name}>
                <img
                  src={item.image}
                  alt={item.name}
                  onClick={() => {
                    setModalItem(item);
                    setShowModal(true);
                  }}
                  onError={(e) => ((e.target as HTMLImageElement).src = "/assets/default.png")}
                  style={{ width: 80, height: 80, cursor: "pointer" }}
                />
                <div>{item.name} - ${item.price}</div>
              </div>
            ))}
            <button onClick={() => setShowMenuPopup(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Order section */}
      <div>
        <h2>Add to Cart</h2>
        <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
          <option value="" disabled>
            Select item
          </option>
          {menu.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button onClick={addToCart}>Add</button>
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

      {/* Order history */}
      <div>
        <h2>Orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <ul>
            {orders.map((o, idx) => (
              <li key={idx}>
                {o.items.map((i: any) => {
                  const menuItem = menu.find(m => m.name === i.name);
                  const price = menuItem ? menuItem.price : 0;
                  return (
                    <span key={i.name}>
                      {i.quantity} x {i.name} (${(price * i.quantity).toFixed(2)}){" "}
                    </span>
                  );
                })}
                {" | "} Total: ${o.total.toFixed(2)} | Payment: {o.paymentMethod}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal for item */}
      {showModal && modalItem && (
        <div className={modalClass} onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <img src={modalItem.image} alt={modalItem.name} />
            <h3>{modalItem.name}</h3>
            <p>{modalItem.description}</p>
            <p>Price: ${modalItem.price}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
