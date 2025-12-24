import { useEffect, useState } from "react";

/* ---------------- CALENDAR LOGIC (INSIDE ENTRYFORM) ---------------- */

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function EntryCalendar({ rows, selectedDate, onSelectDate }) {
  const today = new Date();
  const initial = selectedDate ? new Date(selectedDate) : today;

  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [viewYear, setViewYear] = useState(initial.getFullYear());

  useEffect(() => {
    if (!selectedDate) return;
    const d = new Date(selectedDate);
    if (!Number.isNaN(d.getTime())) {
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  }, [selectedDate]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const hasEntry = (iso) =>
    rows.some((row) => row.date === iso);

  const isoOf = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const weeks = [];
  let day = 1 - firstDay;

  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let i = 0; i < 7; i++, day++) {
      week.push(day < 1 || day > daysInMonth ? null : day);
    }
    weeks.push(week);
  }

  return (
    <div className="w-72 rounded-2xl border bg-white shadow-xl p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() =>
            setViewMonth((m) => (m === 0 ? 11 : m - 1))
          }
        >
          ‹
        </button>

        <div className="flex gap-2">
          <select
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            className="text-xs border rounded px-1"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m.slice(0, 3)}
              </option>
            ))}
          </select>

          <select
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            className="text-xs border rounded px-1"
          >
            {Array.from({ length: 7 }, (_, i) => viewYear - 3 + i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>
        </div>

        <button
          onClick={() =>
            setViewMonth((m) => (m === 11 ? 0 : m + 1))
          }
        >
          ›
        </button>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {weeks.flat().map((d, i) => {
          if (!d) return <div key={i} />;

          const iso = isoOf(viewYear, viewMonth, d);
          const selected = iso === selectedDate;
          const exists = hasEntry(iso);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(iso)}
              className="flex flex-col items-center"
            >
              <div
                className={`h-7 w-7 flex items-center justify-center rounded-full ${
                  selected
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {d}
              </div>

              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  exists ? "bg-red-500" : "bg-green-400"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- ENTRY FORM ---------------- */

const Entryform = ({ addRow, blockedDates, rows }) => {
  const [date, setDate] = useState("");
  const [rate, setRate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!date || !rate) {
      alert("Date and Rate are required");
      return;
    }

    if (blockedDates.includes(date)) {
      alert("Data for this date already exists!");
      return;
    }

    addRow({
      date,
      rate: `₹${rate} per egg`,
      remarks: remarks || "—",
    });

    setDate("");
    setRate("");
    setRemarks("");
  };

  return (
    <div className="mt-10 pb-10">
      <h1 className="text-2xl font-bold mb-6">NECC Rate Entry Form</h1>

      <div className="bg-white shadow rounded-xl p-6 ml-4 flex items-start gap-4 relative">

        {/* DATE (CUSTOM CALENDAR) */}
        <div className="relative">
          <p className="mb-2">Date</p>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="border rounded-lg p-2 w-55 text-left bg-white"
          >
            {date || "Select date"}
          </button>

          {open && (
            <div className="absolute z-30 bottom-full mt-2">
              <EntryCalendar
                rows={rows}
                selectedDate={date}
                onSelectDate={(iso) => {
                  setDate(iso);
                  setOpen(false);
                }}
              />
            </div>
          )}

          {date && (
            <p
              className={`mt-1 text-sm ${
                blockedDates.includes(date)
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {blockedDates.includes(date)
                ? "Date already exists"
                : "Date available"}
            </p>
          )}
        </div>

        {/* RATE */}
        <div>
          <p className="mb-2">NECC Rate (₹)</p>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="border rounded-lg p-2 w-55"
          />
        </div>

        {/* REMARKS */}
        <div>
          <p className="mb-2">Remarks (optional)</p>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="border rounded-lg p-2 w-150"
          />
        </div>

        {/* SAVE */}
        <button
          onClick={handleSubmit}
          className="bg-orange-600 h-10 px-6 rounded-xl mt-8 text-white font-semibold"
        >
          Save Data
        </button>
      </div>
    </div>
  );
};

export default Entryform;
