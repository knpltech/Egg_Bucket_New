import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function CashPaymentEntry() {
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  // Load outlets
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

  // Fetch cash payment entries
  useEffect(() => {
    const fetchEntries = async () => {
      setEntriesLoading(true);
      try {
        const res = await fetch(`${API_URL}/cash-payments/all`);
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        setEntries([]);
      } finally {
        setEntriesLoading(false);
      }
    };
    fetchEntries();
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
      const key = o.id || o.name || o.area || o;
      outletAmounts[key] = Number(values[key]) || 0;
    });

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/cash-payments/add`, {
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
      console.log("Cash Payment Save Response:", data);

      if (!response.ok) {
        alert(data.message || "Failed to save cash payment");
        return;
      }

      alert("Cash Payment added successfully ✅");

      navigate("/admin/cash-payments");

    } catch (err) {
      console.error(err);
      alert("Error saving cash payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eggBg px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Cash Payment Entry
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
              const key = o.id || o.name || o.area || o;
              const label = o.name || o.area || o.id || o;
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={values[key] || ""}
                    onChange={(e) =>
                      handleChange(key, e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter cash amount"
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
      {/* Display cash payment entries */}
      <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Cash Payment Entries</h2>
        {entriesLoading ? (
          <div>Loading entries...</div>
        ) : entries.length === 0 ? (
          <div>No entries found.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  {outlets.map((o) => {
                    const label = o.name || o.area || o.id || o;
                    return (
                      <th key={label} className="px-4 py-2">{label}</th>
                    );
                  })}
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const total = Object.values(entry.outlets || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);
                  return (
                    <tr key={entry.id || entry._id}>
                      <td className="px-4 py-2">{entry.date}</td>
                      {outlets.map((o) => {
                        const key = o.id || o.name || o.area || o;
                        return (
                          <td key={key} className="px-4 py-2">{entry.outlets?.[key] ?? 0}</td>
                        );
                      })}
                      <td className="px-4 py-2 text-right font-semibold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
