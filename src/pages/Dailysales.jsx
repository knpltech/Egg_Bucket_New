import React from 'react'
import * as XLSX from 'xlsx';
import Topbar from '../components/Topbar'
import Dailyheader from '../components/Dailyheader'
import DailyTable from '../components/DailyTable'
import Dailyentryform from '../components/Dailyentryform'
import Weeklytrend from '../components/Weeklytrend'
import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react';

const DEFAULT_OUTLETS = [
  "AECS Layout",
  "Bandepalya",
  "Hosa Road",
  "Singasandra",
  "Kudlu Gate",
];

const STORAGE_KEY = "egg_outlets_v1";

const Dailysales = () => {

  const [rows,setRows]=useState([]);
  const [isLoaded, setIsLoaded]= useState(false);
  const [outlets, setOutlets] = useState(DEFAULT_OUTLETS);
  
  useEffect(()=>{
    const loadOutletsFromLocal = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedOutlets = JSON.parse(saved);
        const outletAreas = savedOutlets.map((o) => o.area);
        const required = DEFAULT_OUTLETS;
        const hasAllRequired = required.every((r) => outletAreas.includes(r));
        setOutlets(hasAllRequired ? outletAreas : DEFAULT_OUTLETS);
      } else {
        setOutlets(DEFAULT_OUTLETS);
      }
    };

    loadOutletsFromLocal();

    const onUpdate = (e) => {
      const areas = (e && e.detail) || null;
      if (Array.isArray(areas)) {
        setOutlets(areas);
      } else {
        loadOutletsFromLocal();
      }
    };

    window.addEventListener('egg:outlets-updated', onUpdate);

    const onStorage = (evt) => {
      if (evt.key === STORAGE_KEY) onUpdate();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('egg:outlets-updated', onUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  
  useEffect(()=>{
    const savedDate= localStorage.getItem("dailySales");
    if(savedDate){
      setRows(JSON.parse(savedDate));
    }
    setIsLoaded(true);
  },[]);

  useEffect(()=>{
    if(isLoaded){
      localStorage.setItem("dailySales", JSON.stringify(rows))
    }
  },[rows,isLoaded]);

  const blockeddates=rows.map(row=> row.date);

  const addrow=(newrow)=>{
    setRows(prev => [newrow, ...prev]);
  }

  // Sort rows by date ascending (oldest to newest)
  const sortedRows = [...rows].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Download as Excel (robust for both possible row structures)
  const handleDownload = () => {
    if (!sortedRows.length) {
      alert('No data to export!');
      return;
    }
    // Try to handle both {date, outlets, total} and flat {date, ...outlet, total}
    const data = sortedRows.map(row => {
      const obj = { Date: row.date };
      if (row.outlets && typeof row.outlets === 'object') {
        outlets.forEach(o => obj[o] = row.outlets[o] ?? 0);
      } else {
        outlets.forEach(o => obj[o] = row[o] ?? 0);
      }
      obj.Total = row.total ?? row.Total ?? 0;
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Sales');
    XLSX.writeFile(wb, 'Daily_Sales_Report.xlsx');
  };

  return (
    <div className='flex'>
      <div className='bg-[#F8F6F2] min-h-screen p-6 w-340'>

      <Topbar/>
        <Dailyheader onDownload={handleDownload}/>
        {/* Removed left-side Download Excel button */}
      <DailyTable rows={sortedRows} outlets={outlets}/>
      <div className="grid grid-cols-3 gap-6 mt-10">

        {/* Entry Form (biggest block) */}
        <div className="col-span-2">
          <Dailyentryform addrow={addrow} blockeddates={blockeddates} rows={sortedRows} outlets={outlets}/>
        </div>

        <div className="flex flex-col">
          {/* Weekly Trend */}
          <Weeklytrend />
        </div>

      </div>
    </div>
    </div>
  )
}

export default Dailysales
