import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AreaEntry() {
  const location = useLocation();
  const navigate = useNavigate();

  const area = location.state?.area || "Unknown Area";

  const [date, setDate] = useState("");
  const [damage, setDamage] = useState("");
  const [necc, setNecc] = useState("");
  const [sales, setSales] = useState("");
  const [cash, setCash] = useState("");
  const [digital, setDigital] = useState("");
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState(0);
  const [totalCollection, setTotalCollection] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);

  /* ================= CALCULATE ================= */
  const calculateClosing = () => {
    const salesAmount = (Number(sales) || 0) * (Number(necc) || 0);
    const total = (Number(digital) || 0) + (Number(cash) || 0);
    const closing = total - salesAmount;

    setAmount(salesAmount);
    setTotalCollection(total);
    setClosingBalance(closing);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      alert("Please select date");
      return;
    }

    setLoading(true);

    try {
      if (Number(sales) > 0) {
        await fetch(`${API_URL}/dailysales/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            outlets: { [area]: Number(sales) },
            total: Number(sales),
          }),
        });
      }

      if (Number(necc) > 0) {
        await fetch(`${API_URL}/neccrate/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            rate: Number(necc),
          }),
        });
      }

      if (Number(damage) > 0) {
        await fetch(`${API_URL}/damages/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            quantity: Number(damage),
          }),
        });
      }

      if (Number(digital) > 0) {
        await fetch(`${API_URL}/digital-payments/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            outlets: { [area]: Number(digital) },
          }),
        });
      }

      if (Number(cash) > 0) {
        await fetch(`${API_URL}/cash-payments/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date,
            outlets: { [area]: Number(cash) },
          }),
        });
      }

      alert("Entry Saved Successfully ✅");
      navigate("/admin/dashboard");

    } catch (err) {
      console.error(err);
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eggBg px-6 py-10">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Egg Bucket
        </h1>
        <p className="text-gray-500 mt-2">
          Area Data Entry
        </p>
      </div>

      {/* FORM */}
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Entry Form - {area}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* DATE */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />

          {/* SALES */}
          <input
            type="number"
            placeholder="Sales Quantity"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
          />

          {/* NECC */}
          <input
            type="number"
            step="0.01"
            placeholder="NECC Rate"
            value={necc}
            onChange={(e) => setNecc(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
          />

          {/* DAMAGE */}
          <input
            type="number"
            placeholder="Daily Damage"
            value={damage}
            onChange={(e) => setDamage(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
          />

          {/* DIGITAL */}
          <input
            type="number"
            placeholder="Digital Amount"
            value={digital}
            onChange={(e) => setDigital(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
          />

          {/* CASH */}
          <input
            type="number"
            placeholder="Cash Amount"
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
          />

          {/* CALCULATE BUTTON */}
          <button
            type="button"
            onClick={calculateClosing}
            className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
          >
            Calculate Closing Balance
          </button>

          {/* RESULT DISPLAY */}
          <div className="bg-orange-50 p-4 rounded-lg text-sm space-y-1">
            <p><strong>Amount (Sales × NECC):</strong> ₹ {amount.toFixed(2)}</p>
            <p><strong>Total Collection (Digital + Cash):</strong> ₹ {totalCollection.toFixed(2)}</p>
            <p className="text-lg font-semibold">
              Closing Balance: ₹ {closingBalance.toFixed(2)}
            </p>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg"
          >
            {loading ? "Saving..." : "Submit Entry"}
          </button>

        </form>
      </div>
    </div>
  );
}
