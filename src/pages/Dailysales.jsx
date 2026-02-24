const API_URL = import.meta.env.VITE_API_URL;

import React, { useState, useEffect, useCallback } from "react";
import { getRoleFlags } from "../utils/role";
import * as XLSX from "xlsx";

import Topbar from "../components/Topbar";
import Dailyheader from "../components/Dailyheader";
import DailyTable from "../components/DailyTable";
import Weeklytrend from "../components/Weeklytrend";

const OUTLETS_KEY = "egg_outlets_v1";

const Dailysales = () => {
  const { isAdmin, isViewer, isDataAgent } = getRoleFlags();

  const [rows, setRows] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [outletLoading, setOutletLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState({});
  const [editValues, setEditValues] = useState({});

  /* ================= FETCH SALES ================= */
  const fetchSales = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/dailysales/all`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setRows(data.map(d => ({ id: d.id || d._id, ...d })));
      } else if (data.success && Array.isArray(data.data)) {
        setRows(data.data.map(d => ({ id: d.id || d._id, ...d })));
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    fetchSales();
    const interval = setInterval(fetchSales, 30000);
    return () => clearInterval(interval);
  }, [fetchSales]);

  /* ================= LOAD OUTLETS ================= */
  const loadOutlets = useCallback(async () => {
    setOutletLoading(true);
    try {
      const res = await fetch(`${API_URL}/outlets/all`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setOutlets(data);
        localStorage.setItem(OUTLETS_KEY, JSON.stringify(data));
      } else {
        throw new Error();
      }
    } catch {
      const saved = localStorage.getItem(OUTLETS_KEY);
      if (saved) {
        setOutlets(JSON.parse(saved));
      } else {
        setOutlets([]);
      }
    } finally {
      setOutletLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOutlets();
  }, [loadOutlets]);

  /* ================= FILTER ================= */
  const filteredRows = [...rows]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter(row => {
      if (fromDate && new Date(row.date) < new Date(fromDate)) return false;
      if (toDate && new Date(row.date) > new Date(toDate)) return false;
      return true;
    });

  /* ================= EDIT ================= */
  const handleEditClick = (row) => {
    if (!isAdmin) return;

    setEditRow(row);
    setEditValues({ ...row.outlets });
    setEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditRow({});
    setEditValues({});
  };

  const handleEditSave = async () => {
    if (!editRow.id) return alert("No ID found.");

    const total = Object.values(editValues).reduce(
      (s, v) => s + (Number(v) || 0),
      0
    );

    try {
      const res = await fetch(`${API_URL}/dailysales/${editRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editRow.date,
          outlets: editValues,
          total,
        }),
      });

      if (!res.ok) return alert("Failed to update");

      await fetchSales();
      handleEditCancel();
    } catch (err) {
      alert("Error updating: " + err.message);
    }
  };

  /* ================= LOADING ================= */
  if (outletLoading) {
    return (
      <div className="bg-eggBg min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff7518]" />
      </div>
    );
  }

  return (
    <div className="bg-eggBg min-h-screen p-6">
      <Topbar />

      {/* 🔥 ENTRY FORM REMOVED */}

      {/* ================= HEADER ================= */}
      {(isAdmin || isViewer || isDataAgent) && outlets.length > 0 && (
        <Dailyheader
          dailySalesData={filteredRows}
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          allRows={rows}
        />
      )}

      {/* ================= TABLE ================= */}
      {(isAdmin || isViewer || isDataAgent) && outlets.length > 0 && (
        <DailyTable
          rows={filteredRows}
          outlets={outlets}
          onEdit={isAdmin ? handleEditClick : null}
        />
      )}

      {/* ================= EDIT MODAL ================= */}
      {isAdmin && editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl p-6 min-w-[320px] max-h-[80vh] overflow-y-auto">
            <h2 className="font-semibold mb-4 text-lg">
              Edit Daily Sales ({editRow.date})
            </h2>

            <div className="space-y-3">
              {outlets.map(o => {
                const area = o.area || o;
                return (
                  <div key={area} className="flex items-center gap-2">
                    <label className="w-32 text-xs font-medium">
                      {area}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editValues[area] ?? 0}
                      onChange={(e) =>
                        setEditValues(p => ({
                          ...p,
                          [area]: Number(e.target.value),
                        }))
                      }
                      className="flex-1 border rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 bg-gray-200 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= WEEKLY TREND ================= */}
      {isAdmin && outlets.length > 0 && (
        <div className="mt-10">
          <Weeklytrend rows={rows} />
        </div>
      )}
    </div>
  );
};

export default Dailysales;
