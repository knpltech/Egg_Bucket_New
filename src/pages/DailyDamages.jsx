const API_URL = import.meta.env.VITE_API_URL;
import { useState, useEffect, useRef, useCallback } from "react";
import { useDamage } from "../context/DamageContext";
import * as XLSX from "xlsx";
import { getRoleFlags } from "../utils/role";

function formatDateDMY(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateDisplay(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export default function DailyDamages() {
  const { isAdmin, isViewer, isDataAgent } = getRoleFlags();
  const { damages, setDamages } = useDamage();

  const fromCalendarRef = useRef(null);
  const toCalendarRef = useRef(null);

  const [outlets, setOutlets] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const STORAGE_KEY = "egg_outlets_v1";

  // Fetch damages
  useEffect(() => {
    const fetchDamages = async () => {
      try {
        const res = await fetch(`${API_URL}/daily-damage/all`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // normalize to rows with `outlets` map similar to other reports
          setDamages(
            data.map((d) => ({
              id: d.id,
              date: d.date,
              outlets: d.damages || {},
              total: d.total || 0,
            }))
          );
        }
      } catch (e) {
        console.error("Failed fetching damages", e);
      }
    };
    fetchDamages();
  }, [setDamages]);

  // Load outlets
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

  // Filter logic
  const filteredData = damages
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter((d) => {
      if (fromDate && new Date(d.date) < new Date(fromDate)) return false;
      if (toDate && new Date(d.date) > new Date(toDate)) return false;
      return true;
    });

  const downloadExcel = () => {
    if (!filteredData.length) return alert("No data available");
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Damages");
    XLSX.writeFile(wb, "Daily_Damages_Report.xlsx");
  };

  return (
    <div className="min-h-screen bg-eggBg px-4 py-6 md:px-8">
      {(isAdmin || isViewer || isDataAgent) && (
        <>
          {/* Header */}
          <div className="max-w-7xl mx-auto mb-6 flex justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                Daily Damages Report
              </h1>
              <p className="text-sm text-gray-500">
                Track egg damages per outlet and date.
              </p>
            </div>

            <button
              onClick={downloadExcel}
              className="rounded-full bg-orange-500 px-4 py-2 text-white text-sm"
            >
              Download Excel
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          {/* Table */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-max">
                <thead>
                  <tr className="bg-orange-100 text-sm">
                    <th className="p-3 text-left">Date</th>
                    {outlets.map((o) => {
                      const key = o.id || o.name || o.area || o;
                      const label = o.name || o.area || o.id || o;
                      return (
                        <th key={key} className="p-3 text-center">
                          {label}
                        </th>
                      );
                    })}
                    <th className="p-3 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((d, i) => (
                    <tr key={i} className="border-t text-sm">
                      <td className="p-3">{formatDateDisplay(d.date)}</td>
                      {outlets.map((o) => {
                        const key = o.id || o.name || o.area || o;
                        return (
                          <td key={key} className="p-3 text-center">
                            {Number(d.outlets?.[key] || 0)}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center font-bold text-orange-600">
                        {Number(d.total || 0)}
                      </td>
                    </tr>
                  ))}

                  {/* Grand Total */}
                  <tr className="bg-orange-50 font-semibold text-orange-700">
                    <td className="p-3">Grand Total</td>
                    {outlets.map((o) => {
                      const key = o.id || o.name || o.area || o;
                      const total = filteredData.reduce(
                        (sum, d) => sum + Number(d.outlets?.[key] || 0),
                        0
                      );
                      return (
                        <td key={key} className="p-3 text-center">
                          {total}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      {filteredData.reduce(
                        (sum, d) => sum + Number(d.total || 0),
                        0
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
