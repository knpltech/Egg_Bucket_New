import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function DailySalesEntry() {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  /* ================= LOAD OUTLETS ================= */
  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const res = await fetch(`${API_URL}/outlets/all`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setOutlets(data);

          const initial = {};
          data.forEach((o) => {
            const key = o.id || o.name || o.area || o;
            initial[key] = "";
          });
          setValues(initial);
        }
      } catch (err) {
        console.error("Error loading outlets:", err);
      }
    };

    loadOutlets();
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (area, value) => {
    setValues((prev) => ({
      ...prev,
      [area]: value,
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      alert("Please select date");
      return;
    }

    const outletAmounts = {};
    let total = 0;

    Object.keys(values).forEach((k) => {
      const v = Number(values[k]) || 0;
      outletAmounts[k] = v;
      total += v;
    });

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/dailysales/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          outlets: outletAmounts,
          total,
        }),
      });

      if (!response.ok) {
        alert("Failed to save sales entry");
        return;
      }

      alert("Daily sales saved successfully ✅");
      navigate("/admin/dailysales");
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eggBg px-6 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-8">

        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Daily Sales Entry
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          {/* Outlet Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {outlets.map((o) => {
              const key = o.id || o.name || o.area || o;
              const label = o.name || o.area || o.id || o;
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={values[key] || ""}
                    onChange={(e) =>
                      handleChange(key, e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter sales quantity"
                  />
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/data-entry")}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {loading ? "Saving..." : "Save Entry"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
