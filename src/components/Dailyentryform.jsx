import React, { useState } from "react";

/* ---------------- CALENDAR (INLINE) ---------------- */

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function DailyCalendar({ selectedDate, onSelect, blockedDates }) {
  const today = new Date();
  const baseDate = selectedDate ? new Date(selectedDate) : today;

  const [month, setMonth] = useState(baseDate.getMonth());
  const [year, setYear] = useState(baseDate.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const buildISO = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const weeks = [];
  let day = 1 - firstDay;

  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let i = 0; i < 7; i++, day++) {
      row.push(day < 1 || day > daysInMonth ? null : day);
    }
    weeks.push(row);
  }

  return (
    <div className="w-72 rounded-xl bg-white shadow-lg border p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => setMonth(m => (m === 0 ? 11 : m - 1))}>‹</button>
        <span className="font-semibold text-sm">
          {MONTHS[month]} {year}
        </span>
        <button onClick={() => setMonth(m => (m === 11 ? 0 : m + 1))}>›</button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 text-xs text-gray-400 text-center mb-1">
        {WEEK_DAYS.map(d => <span key={d}>{d}</span>)}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            if (!d) return <div key={`${wi}-${di}`} />;

            const iso = buildISO(d);
            const blocked = blockedDates.includes(iso);
            const selected = iso === selectedDate;

            return (
              <button
                key={`${wi}-${di}`}
                disabled={blocked}
                onClick={() => !blocked && onSelect(iso)}
                className="flex flex-col items-center"
              >
                <div
                  className={`h-7 w-7 flex items-center justify-center rounded-full
                    ${selected ? "bg-orange-500 text-white" : "hover:bg-gray-100"}
                    ${blocked ? "text-gray-400" : "text-gray-700"}`}
                >
                  {d}
                </div>
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    blocked ? "bg-red-500" : "bg-green-500"
                  }`}
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------- DAILY ENTRY FORM ---------------- */

const Dailyentryform = ({ addrow, blockeddates }) => {
  const [date, setDate] = useState("");
  const [openCal, setOpenCal] = useState(false);

  const [aecs, setAecs] = useState("");
  const [bande, setBande] = useState("");
  const [hosa, setHosa] = useState("");
  const [singa, setSinga] = useState("");
  const [kudlu, setKudlu] = useState("");

  const handleSubmit = () => {
    if (!date) return alert("Date is required");
    if (blockeddates.includes(date))
      return alert("Entry for this date already exists");

    if (!aecs || !bande || !hosa || !singa || !kudlu)
      return alert("All fields are required");

    addrow({
      date,
      aecs: +aecs,
      bande: +bande,
      hosa: +hosa,
      singa: +singa,
      kudlu: +kudlu,
      total: +aecs + +bande + +hosa + +singa + +kudlu,
    });

    setDate("");
    setAecs(""); setBande(""); setHosa(""); setSinga(""); setKudlu("");
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 m-6">
      <h1 className="text-xl font-bold mb-4">Daily Sales Entry</h1>

      {/* DATE PICKER */}
      <div className="relative mb-4">
        <label className="text-gray-600 text-sm">Select Date</label>

        <button
          type="button"
          onClick={() => setOpenCal(o => !o)}
          className="w-full border rounded-lg p-2 mt-1 text-left bg-white"
        >
          {date || "dd-mm-yyyy"}
        </button>

        {/* Calendar ABOVE */}
        {openCal && (
          <div className="absolute z-30 bottom-full mb-2">
            <DailyCalendar
              selectedDate={date}
              blockedDates={blockeddates}
              onSelect={(iso) => {
                setDate(iso);
                setOpenCal(false);
              }}
            />
          </div>
        )}

        {/* Status */}
        <p className={`mt-1 text-sm h-5 ${
          date && blockeddates.includes(date)
            ? "text-red-600"
            : "text-green-600"
        }`}>
          {date
            ? blockeddates.includes(date)
              ? "Date already exists"
              : "Date available"
            : ""}
        </p>
      </div>

      {/* INPUTS */}
      <div className="grid grid-cols-3 gap-4">
        <input className="border p-2 rounded" placeholder="AECS" value={aecs} onChange={e=>setAecs(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Bandepalya" value={bande} onChange={e=>setBande(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Hosa Road" value={hosa} onChange={e=>setHosa(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Singasandra" value={singa} onChange={e=>setSinga(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Kudlu Gate" value={kudlu} onChange={e=>setKudlu(e.target.value)} />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
};

export default Dailyentryform;
