import { useState, useMemo, useEffect, useCallback } from "react";
import { getRoleFlags } from "../utils/role";
import * as XLSX from "xlsx";
import DailyTable from "../components/DailyTable";

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = "egg_outlets_v1";

/* ================= UTIL FUNCTIONS ================= */

const formatDateDMY = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

/* ================================================= */

export default function CashPayments() {
  const { isAdmin, isViewer, isDataAgent } = getRoleFlags();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState({});
  const [editValues, setEditValues] = useState({});
  const [outlets, setOutlets] = useState([]);
  const [rows, setRows] = useState([]);
  const [rangeType, setRangeType] = useState("thisMonth");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [isEditSaving, setIsEditSaving] = useState(false);

  /* ================= LOAD OUTLETS ================= */

  const loadOutlets = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadOutlets();
  }, [loadOutlets]);

  /* ================= FETCH CASH PAYMENTS ================= */

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${API_URL}/cash-payments/all`);
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
    const now = new Date();
    let from = null;
    let to = null;

    if (rangeType === "thisMonth") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (rangeType === "lastMonth") {
      const lastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      from = lastMonth;
      to = new Date(
        lastMonth.getFullYear(),
        lastMonth.getMonth() + 1,
        0
      );
    } else if (
      rangeType === "custom" &&
      customFrom &&
      customTo
    ) {
      from = new Date(customFrom);
      to = new Date(customTo);
    }

    const filtered =
      !from || !to
        ? rows
        : rows.filter((row) => {
            const d = new Date(row.date);
            return d >= from && d <= to;
          });

    return filtered.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [rows, rangeType, customFrom, customTo]);

  /* ================= EDIT ================= */

  const handleEditClick = (row) => {
    if (!isAdmin) return;
    setEditRow(row);
    setEditValues({ ...row.outlets });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editRow.id) return alert("No ID found.");

    const totalAmount = Object.values(editValues).reduce(
      (s, v) => s + (Number(v) || 0),
      0
    );

    setIsEditSaving(true);

    try {
      const res = await fetch(
        `${API_URL}/cash-payments/${editRow.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: editRow.date,
            outlets: editValues,
            totalAmount,
          }),
        }
      );

      if (!res.ok) return alert("Update failed");

      const refresh = await fetch(
        `${API_URL}/cash-payments/all`
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

  /* ================= EXPORT ================= */

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
    XLSX.utils.book_append_sheet(wb, ws, "Cash Payments");
    XLSX.writeFile(wb, "Cash_Payments_Report.xlsx");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-eggBg px-4 py-6 md:px-8">
      {(isAdmin || isViewer || isDataAgent) && (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Cash Payments
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Report View Only
              </p>
            </div>

            <button
              onClick={downloadExcel}
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white"
            >
              Export Report
            </button>
          </div>

          {/* FILTER BUTTONS */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setRangeType("thisMonth")}
              className={`rounded-full px-4 py-2 text-sm border ${
                rangeType === "thisMonth"
                  ? "bg-orange-500 text-white"
                  : "bg-white"
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => setRangeType("lastMonth")}
              className={`rounded-full px-4 py-2 text-sm border ${
                rangeType === "lastMonth"
                  ? "bg-orange-500 text-white"
                  : "bg-white"
              }`}
            >
              Last Month
            </button>

            <button
              onClick={() => setRangeType("custom")}
              className={`rounded-full px-4 py-2 text-sm border ${
                rangeType === "custom"
                  ? "bg-orange-500 text-white"
                  : "bg-white"
              }`}
            >
              Custom
            </button>

            {rangeType === "custom" && (
              <>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) =>
                    setCustomFrom(e.target.value)
                  }
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) =>
                    setCustomTo(e.target.value)
                  }
                  className="border rounded px-3 py-2 text-sm"
                />
              </>
            )}
          </div>

          {/* TABLE */}
          <DailyTable
            rows={filteredRows}
            outlets={outlets}
            onEdit={handleEditClick}
            showRupee={true}
          />

          {/* EDIT MODAL */}
          {editModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="font-semibold mb-4">
                  Edit Cash Payment ({editRow.date})
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
                        min="0"
                        step="1"
                        value={editValues[key] ?? 0}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [key]: Number(e.target.value),
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
