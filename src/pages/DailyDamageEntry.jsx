import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function DailyDamageEntry() {
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

    let total = 0;

    Object.keys(values).forEach((area) => {
      total += Number(values[area]) || 0;
    });

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/damages/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          outlets: values,
          quantity: total,
          remarks: "Outlet-wise damage entry",
        }),
      });

      if (!response.ok) {
        alert("Failed to save damage entry");
        return;
      }

      alert("Damage entry saved successfully ✅");
      navigate("/admin/damages");
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
          Daily Damage Entry
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

          {/* Outlet Grid */}
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
                    min="0"
                    value={values[area] || ""}
                    onChange={(e) =>
                      handleChange(area, e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter damaged quantity"
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
