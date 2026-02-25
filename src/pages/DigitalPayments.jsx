import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
const API_URL = import.meta.env.VITE_API_URL;
import { getRoleFlags } from "../utils/role";

const STORAGE_KEY = "egg_outlets_v1";

const formatCurrencyTwoDecimals = (value) => {
  if (value == null || isNaN(value)) return "₹0.00";
  return "₹" + Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDateDMY = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDisplayDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export default function DigitalPayments() {
  const { isAdmin, isViewer, isDataAgent } = getRoleFlags();

  const filterFromRef = useRef(null);
  const filterToRef = useRef(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState({});
  const [editValues, setEditValues] = useState({});
  const [rows, setRows] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [isEditSaving, setIsEditSaving] = useState(false);

  /* ================= LOAD OUTLETS ================= */
  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const res = await fetch(`${API_URL}/outlets/all`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setOutlets(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      } catch {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setOutlets(JSON.parse(saved));
      }
    };
    loadOutlets();
  }, []);

  /* ================= FETCH PAYMENTS ================= */
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${API_URL}/digital-payments/all`);
        const data = await res.json();
        setRows(
          Array.isArray(data)
            ? data.map((d) => ({ id: d.id || d._id, ...d }))
            : []
        );
      } catch {
        setRows([]);
      }
    };
    fetchPayments();
  }, []);

  /* ================= FILTER LOGIC ================= */
  const filteredRows = useMemo(() => {
    const sorted = [...rows].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    return sorted.filter((row) => {
      if (filterFrom && new Date(row.date) < new Date(filterFrom))
        return false;
      if (filterTo && new Date(row.date) > new Date(filterTo))
        return false;
      return true;
    });
  }, [rows, filterFrom, filterTo]);

  /* ================= COLUMN TOTALS ================= */
  const columnTotals = useMemo(() => {
    const totals = {};
    outlets.forEach((o) => {
      const key = o.id || o.name || o.area || o;
      totals[key] = filteredRows.reduce(
        (sum, r) => sum + (r.outlets?.[key] ? Number(r.outlets[key]) : 0),
        0
      );
    });

    totals.grandTotal = filteredRows.reduce(
      (sum, r) =>
        sum +
        (typeof r.totalAmount === "number"
          ? r.totalAmount
          : Object.values(r.outlets || {}).reduce(
              (s, v) => s + (Number(v) || 0),
              0
            )),
      0
    );

    return totals;
  }, [filteredRows, outlets]);

  /* ================= EDIT ================= */
  const handleEditClick = (row) => {
    if (!isAdmin) return;
    setEditRow(row);
    setEditValues({ ...(row.outlets || {}) });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editRow.id) return alert("No ID found.");

    const updatedOutlets = {};
    outlets.forEach((o) => {
      const key = o.id || o.name || o.area || o;
      updatedOutlets[key] = Number(editValues[key]) || 0;
    });

    setIsEditSaving(true);
    try {
      const res = await fetch(
        `${API_URL}/digital-payments/${editRow.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: editRow.date,
            outlets: updatedOutlets,
          }),
        }
      );

      if (!res.ok) return alert("Update failed");

      const refresh = await fetch(
        `${API_URL}/digital-payments/all`
      );
      const data = await refresh.json();
      setRows(
        Array.isArray(data)
          ? data.map((d) => ({ id: d.id || d._id, ...d }))
          : []
      );

      setEditModalOpen(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsEditSaving(false);
    }
  };

  /* ================= DOWNLOAD ================= */
  const downloadExcel = () => {
    if (!filteredRows.length) return alert("No data");

      const data = filteredRows.map((row) => {
      const obj = { Date: row.date };
      outlets.forEach((o) => {
        const key = o.id || o.name || o.area || o;
        const label = o.name || o.area || o.id || o;
        obj[label] = row.outlets?.[key] ?? 0;
      });
      obj.Total = row.totalAmount;
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Digital Payments");
    XLSX.writeFile(wb, "Digital_Payments_Report.xlsx");
  };

  return (
    <div className="min-h-screen bg-eggBg px-4 py-6 md:px-8 flex flex-col">
      {(isAdmin || isViewer || isDataAgent) && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">
                Digital Payments
              </h1>
              <p className="text-sm text-gray-500">
                Report view only
              </p>
            </div>
            <button
              onClick={downloadExcel}
              className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm"
            >
              Download Data
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Table */}
          <div className="overflow-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Date
                  </th>
                  {outlets.map((o) => {
                      const label = o.name || o.area || o.id || o;
                      return (
                        <th key={label} className="px-4 py-3">
                          {label.toUpperCase()}
                        </th>
                      );
                    })}
                  <th className="px-4 py-3 text-right">
                    TOTAL
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-right">
                      Edit
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      {formatDisplayDate(row.date)}
                    </td>
                    {outlets.map((o) => {
                      const key = o.id || o.name || o.area || o;
                      return (
                        <td key={key} className="px-4 py-3">
                          {formatCurrencyTwoDecimals(
                            row.outlets?.[key]
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrencyTwoDecimals(
                        row.totalAmount
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          className="text-blue-600 text-xs"
                          onClick={() =>
                            handleEditClick(row)
                          }
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Modal */}
          {editModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white p-6 rounded-xl w-96">
                <h2 className="mb-4 font-semibold">
                  Edit {formatDisplayDate(editRow.date)}
                </h2>

                {outlets.map((o) => {
                  const key = o.id || o.name || o.area || o;
                  const label = o.name || o.area || o.id || o;
                  return (
                    <div key={key} className="mb-3">
                      <label className="text-xs">
                        {label}
                      </label>
                      <input
                        type="number"
                        value={editValues[key] || ""}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  );
                })}

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() =>
                      setEditModalOpen(false)
                    }
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-4 py-2 bg-orange-500 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
