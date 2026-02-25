import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";

import Topbar from "../components/Topbar";
import Dailyheader from "../components/Dailyheader";
import DailyTable from "../components/DailyTable";
import Weeklytrend from "../components/Weeklytrend";

const API_URL = import.meta.env.VITE_API_URL || "";
const OUTLETS_KEY = "egg_outlets_v1";

/* ================= SAFE ROLE FLAGS ================= */
function safeGetRoleFlags() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return { isAdmin: false, isViewer: false, isDataAgent: false };

    const roles = Array.isArray(user.roles)
      ? user.roles
      : user.role
      ? [user.role]
      : [];

    return {
      isAdmin: user.role === "Admin",
      isViewer: user.role === "Viewer",
      isDataAgent: roles.includes("dataagent"),
    };
  } catch {
    return { isAdmin: false, isViewer: false, isDataAgent: false };
  }
}

const Dailysales = () => {
  const { isAdmin, isViewer, isDataAgent } = safeGetRoleFlags();

  const [rows, setRows] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [outletLoading, setOutletLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editValues, setEditValues] = useState({});

  /* ================= FETCH SALES ================= */
  const fetchSales = useCallback(async () => {
    if (!API_URL) return;

    try {
      const res = await fetch(`${API_URL}/dailysales/all`);
      const json = await res.json();

      if (Array.isArray(json)) {
        setRows(json);
      } else if (json?.success && Array.isArray(json.data)) {
        setRows(json.data);
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  /* ================= LOAD OUTLETS ================= */
  const loadOutlets = useCallback(async () => {
    if (!API_URL) {
      setOutlets([]);
      setOutletLoading(false);
      return;
    }

    setOutletLoading(true);

    try {
      const res = await fetch(`${API_URL}/outlets/all`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setOutlets(data);
        localStorage.setItem(OUTLETS_KEY, JSON.stringify(data));
      } else {
        throw new Error();
      }
    } catch {
      const cached = localStorage.getItem(OUTLETS_KEY);
      setOutlets(cached ? JSON.parse(cached) : []);
    } finally {
      setOutletLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOutlets();
  }, [loadOutlets]);

  /* ================= FILTER ================= */
  const filteredRows = rows
    .filter((r) => r?.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter((row) => {
      if (fromDate && new Date(row.date) < new Date(fromDate)) return false;
      if (toDate && new Date(row.date) > new Date(toDate)) return false;
      return true;
    });

  /* ================= EDIT ================= */
  const handleEditClick = (row) => {
    if (!isAdmin) return;
    setEditRow(row);
    setEditValues({ ...(row.outlets || {}) });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editRow?.id || !API_URL) return;

    const total = Object.values(editValues).reduce(
      (s, v) => s + Number(v || 0),
      0
    );

    try {
      await fetch(`${API_URL}/dailysales/${editRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editRow.date,
          outlets: editValues,
          total,
        }),
      });

      fetchSales();
      setEditModalOpen(false);
    } catch {}
  };

  /* ================= LOADING ================= */
  if (outletLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="bg-eggBg min-h-screen p-6">
      <Topbar />

      {(isAdmin || isViewer || isDataAgent) && (
        <Dailyheader
          dailySalesData={filteredRows}
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          allRows={rows}
        />
      )}

      {(isAdmin || isViewer || isDataAgent) && (
        <DailyTable
          rows={filteredRows}
          outlets={outlets}
          onEdit={isAdmin ? handleEditClick : null}
        />
      )}
      
      {isAdmin && <Weeklytrend rows={rows} />}
    </div>
  );
};

export default Dailysales;