import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function DigitalPaymentEntry() {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  // Load outlets (same as main page logic)
  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const res = await fetch(`${API_URL}/outlets/all`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setOutlets(data);

          const initial = {};
          data.forEach((o) => {
            const area = o.area || o;
            initial[area] = "";
          });

          setValues(initial);
        }
      } catch (err) {
        console.error("Error loading outlets:", err);
      }
    };

    loadOutlets();
  }, []);

  const handleChange = (area, value) => {
    setValues((prev) => ({
      ...prev,
      [area]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      alert("Please select date");
      return;
    }

    const outletAmounts = {};
    outlets.forEach((o) => {
      const area = o.area || o;
      outletAmounts[area] = Number(values[area]) || 0;
    });

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/digital-payments/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          outlets: outletAmounts,
        }),
      });

      const data = await response.json();
      console.log("Digital Payment Save Response:", data);

      if (!response.ok) {
        alert(data.message || "Failed to save digital payment");
        return;
      }

      alert("Digital Payment added successfully ✅");

      navigate("/admin/digital-payments");

    } catch (err) {
      console.error(err);
      alert("Error saving digital payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eggBg px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Digital Payment Entry
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

          {/* Outlet Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {outlets.map((o) => {
              const area = o.area || o;
              return (
                <div key={area}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {area}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={values[area] || ""}
                    onChange={(e) =>
                      handleChange(area, e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter amount"
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
