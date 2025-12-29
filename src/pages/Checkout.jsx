export default function Checkout({ cart }) {
  const total = cart.reduce((s, i) => s + i.price, 0);

  const orderWhatsApp = () => {
    const msg = encodeURIComponent(
      `PC HUB LK ORDER\n\n${cart
        .map((i) => `${i.name} - LKR ${i.price}`)
        .join("\n")}\n\nTotal: LKR ${total}`
    );

    window.open(
      "https://wa.me/94771234567?text=" + msg,
      "_blank"
    );
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      {cart.map((c, i) => (
        <p key={i}>
          {c.name} – LKR {c.price.toLocaleString()}
        </p>
      ))}

      <p className="font-bold mt-4">
        Total: LKR {total.toLocaleString()}
      </p>

      <button
        onClick={orderWhatsApp}
        className="bg-green-600 text-white w-full mt-4 py-2 rounded"
      >
        Order via WhatsApp
      </button>
    </div>
  );
}

