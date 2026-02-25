import { useEffect, useState, useMemo } from "react";

const API = import.meta.env.VITE_API_URL;

export default function DataEntry() {
  const [outlets, setOutlets] = useState([]);
  const [outlet, setOutlet] = useState("");
  const [outletInactiveMsg, setOutletInactiveMsg] = useState("");
  const [outletInactive, setOutletInactive] = useState(false);
  const [date, setDate] = useState("");

  const [neccrate, setNeccrate] = useState("");
  const [neccrateLocked, setNeccrateLocked] = useState(false);

  const [salesLocked, setSalesLocked] = useState(false);
  const [damagesLocked, setDamagesLocked] = useState(false);
  const [cashLocked, setCashLocked] = useState(false);
  const [digitalLocked, setDigitalLocked] = useState(false);

  const [sales, setSales] = useState("");
  const [damages, setDamages] = useState("");
  const [cash, setCash] = useState("");
  const [digital, setDigital] = useState("");

  /* ================= LOAD OUTLETS ================= */
  useEffect(() => {
    fetch(`${API}/outlets/all`)
      .then(res => res.json())
      .then(data => {
        // DO NOT filter – show all outlets
        setOutlets(data || []);
      })
      .catch(() => setOutlets([]));
  }, []);

  /* ================= LOAD EXISTING ENTRY FOR OUTLET+DATE ================= */
  useEffect(() => {
    if (!outlet || !date) return;

    const normalize = d => {
      try {
        // prefer YYYY-MM-DD
        const n = new Date(d);
        if (!isNaN(n.getTime())) return n.toISOString().slice(0, 10);
      } catch (e) {}
      return String(d).slice(0, 10);
    };

    const checkCollections = async () => {
      try {
        const [salesRes, cashRes, digitalRes, damagesRes, neccRes] = await Promise.all([
          fetch(`${API}/dailysales/all`),
          fetch(`${API}/cash-payments/all`),
          fetch(`${API}/digital-payments/all`),
          fetch(`${API}/daily-damage/all`),
          fetch(`${API}/neccrate/all`),
        ]);

        const [salesData, cashData, digitalData, damagesData, neccData] = await Promise.all([
          salesRes.ok ? salesRes.json() : [],
          cashRes.ok ? cashRes.json() : [],
          digitalRes.ok ? digitalRes.json() : [],
          damagesRes.ok ? damagesRes.json() : [],
          neccRes.ok ? neccRes.json() : [],
        ]);

        const target = normalize(date);

        // Daily Sales
        const foundSales = (Array.isArray(salesData) ? salesData : []).find(doc => {
          const docDate = normalize(doc.date || doc.createdAt);
          return docDate === target && doc.outlets && (doc.outlets[outlet] !== undefined);
        });
        if (foundSales) {
          setSales(foundSales.outlets[outlet]);
          setSalesLocked(true);
        } else {
          setSales("");
          setSalesLocked(false);
        }

        // Cash Payments
        const foundCash = (Array.isArray(cashData) ? cashData : []).find(doc => {
          const docDate = normalize(doc.date || doc.createdAt);
          return docDate === target && doc.outlets && (doc.outlets[outlet] !== undefined);
        });
        if (foundCash) {
          setCash(foundCash.outlets[outlet]);
          setCashLocked(true);
        } else {
          setCash("");
          setCashLocked(false);
        }

        // Digital Payments
        const foundDigital = (Array.isArray(digitalData) ? digitalData : []).find(doc => {
          const docDate = normalize(doc.date || doc.createdAt);
          return docDate === target && doc.outlets && (doc.outlets[outlet] !== undefined);
        });
        if (foundDigital) {
          setDigital(foundDigital.outlets[outlet]);
          setDigitalLocked(true);
        } else {
          setDigital("");
          setDigitalLocked(false);
        }

        // Daily Damages
        const foundDamages = (Array.isArray(damagesData) ? damagesData : []).find(doc => {
          const docDate = normalize(doc.date || doc.createdAt);
          return docDate === target && doc.damages && (doc.damages[outlet] !== undefined);
        });
        if (foundDamages) {
          setDamages(foundDamages.damages[outlet]);
          setDamagesLocked(true);
        } else {
          setDamages("");
          setDamagesLocked(false);
        }

        // NECC Rate
        // necc collection might store rate per-outlet or global; attempt to detect both
        let foundNecc = null;
        const neccArr = Array.isArray(neccData) ? neccData : [];
        // try per-outlet structure
        foundNecc = neccArr.find(doc => {
          const docDate = normalize(doc.date || doc.createdAt);
          return docDate === target && ((doc.outlet && doc.outlet === outlet) || (doc.outlets && doc.outlets[outlet] !== undefined) || (doc.rate !== undefined && doc.outlet === outlet));
        });

        // fallback: any rate for date
        if (!foundNecc) {
          foundNecc = neccArr.find(doc => normalize(doc.date || doc.createdAt) === target && doc.rate !== undefined);
        }

        if (foundNecc) {
          // prefer doc.outlets[outlet] -> doc.rate
          const val = (foundNecc.outlets && foundNecc.outlets[outlet] !== undefined)
            ? foundNecc.outlets[outlet]
            : foundNecc.rate || "";
          setNeccrate(val);
          setNeccrateLocked(true);
        } else {
          setNeccrate("");
          setNeccrateLocked(false);
        }

      } catch (err) {
        console.error("Error checking existing entries:", err);
        // reset locks on error
        setSalesLocked(false);
        setCashLocked(false);
        setDigitalLocked(false);
        setDamagesLocked(false);
        setNeccrateLocked(false);
        }
    };

    checkCollections();
  }, [outlet, date]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!outlet || !date) {
      alert("Please select outlet and date");
      return;
    }

    // We'll post to individual collection endpoints for any unlocked fields
    const tasks = [];

    try {
      // NECC rate
      if (!neccrateLocked && neccrate !== "") {
        tasks.push(fetch(`${API}/neccrate/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, outlet, rate: Number(neccrate) }),
        }));
      }

      // Daily Sales
      if (!salesLocked && sales !== "") {
        tasks.push(fetch(`${API}/dailysales/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, outlets: { [outlet]: Number(sales) }, total: Number(sales) }),
        }));
      }

      // Daily Damages
      if (!damagesLocked && damages !== "") {
        tasks.push(fetch(`${API}/daily-damage/add-daily-damage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, damages: { [outlet]: Number(damages) }, total: Number(damages) }),
        }));
      }

      // Cash
      if (!cashLocked && cash !== "") {
        tasks.push(fetch(`${API}/cash-payments/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, outlets: { [outlet]: Number(cash) } }),
        }));
      }

      // Digital
      if (!digitalLocked && digital !== "") {
        tasks.push(fetch(`${API}/digital-payments/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, outlets: { [outlet]: Number(digital) } }),
        }));
      }

      const results = await Promise.all(tasks);
      for (const r of results) {
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(txt || "Failed to save one of the entries");
        }
      }

      alert("Data saved successfully ✅");

      // lock any fields we just saved
      if (!neccrateLocked && neccrate !== "") setNeccrateLocked(true);
      if (!salesLocked && sales !== "") setSalesLocked(true);
      if (!damagesLocked && damages !== "") setDamagesLocked(true);
      if (!cashLocked && cash !== "") setCashLocked(true);
      if (!digitalLocked && digital !== "") setDigitalLocked(true);

      // clear unlocked inputs
      if (!salesLocked) setSales("");
      if (!damagesLocked) setDamages("");
      if (!cashLocked) setCash("");
      if (!digitalLocked) setDigital("");

    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to submit data");
    }
  };

  // Derived numeric values and live calculations
  const salesNum = Number(sales) || 0;
  const neccNum = Number(neccrate) || 0;
  const digitalNum = Number(digital) || 0;
  const cashNum = Number(cash) || 0;
  const damagesNum = Number(damages) || 0;

  const totalAmount = useMemo(() => +(salesNum * neccNum).toFixed(2), [salesNum, neccNum]);
  const totalRecv = useMemo(() => +(digitalNum + cashNum), [digitalNum, cashNum]);
  const closingBalance = useMemo(() => +(totalRecv - totalAmount), [totalRecv, totalAmount]);

  const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-eggBg p-18">
      <div className="min-h-screen bg-eggBg flex items-center justify-center px-4">
        <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow">
          <h2 className="text-4xl font-bold mb-6 mb-4 text-center text-orange-700">Common Data Entry</h2>

        {/* Outlet Dropdown */}
        <label className="block text-2xl font-medium text-orange-500 mb-1">Oulets</label>
        <select
          className="w-full border p-3 rounded-lg mb-3 bg-eggWhite focus:outline-none focus:ring-2 focus:ring-orange-200"
          value={outlet}
          onChange={e => {
            const val = e.target.value;
            const selected = outlets.find(o => (o.id || o.name || o.area || o) === val);
            if (selected && selected.status === 'Inactive') {
              // allow selection but mark inactive and disable inputs
              setOutlet(val);
              setOutletInactive(true);
              setOutletInactiveMsg('Selected outlet is inactive — all fields are disabled');
              return;
            }
            setOutletInactive(false);
            setOutletInactiveMsg("");
            setOutlet(val);
          }}
        >
          <option value="">Select Outlet</option>

          {outlets.map(o => {
            const name = o.name || o.area || o.id;
            const status = o.status || "Active";

            return (
              <option key={o.id || name} value={o.id || name}>
                {name} ({status})
              </option>
            );
          })}
        </select>
        {outletInactiveMsg && <div className="text-sm text-red-600 mb-3">{outletInactiveMsg}</div>}

        {/* Date */}
        <div className="mb-4">
          <label className="block text-2xl font-medium text-orange-500 mb-1">Date</label>
          <input
            type="date"
            className={`w-full border p-3 rounded-lg ${outletInactive ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={date}
            disabled={outletInactive}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Neccrate */}
        <div className="mb-5">
            <label className="block text-2xl font-medium text-orange-500 mb-1">NECC Rate</label>
            <input
              type="number"
              step="0.01"
              placeholder="Neccrate"
              className={`w-full border p-3 rounded-lg ${neccrateLocked || outletInactive ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-orange-200"}`}
              value={neccrate}
              disabled={neccrateLocked || outletInactive}
              onChange={e => setNeccrate(e.target.value)}
            />
            {neccrateLocked && <div className="text-sm text-green-700 mt-1">Already entered</div>}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-2xl font-medium text-orange-500 mb-1">Daily Sales</label>
            <input
              type="number"
              placeholder="Daily Sales"
              className={`w-full border p-3 rounded-lg ${salesLocked || outletInactive ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-orange-200"}`}
              value={sales}
              disabled={salesLocked || outletInactive}
              onChange={e => setSales(e.target.value)}
            />
            {salesLocked && <div className="text-sm text-green-700 mt-1">Already entered</div>}
          </div>

          <div>
            <label className="block text-2xl font-medium text-orange-500 mb-1">Daily Damages</label>
            <input
              type="number"
              placeholder="Daily Damages"
              className={`w-full border p-3 rounded-lg ${damagesLocked || outletInactive ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-orange-200"}`}
              value={damages}
              disabled={damagesLocked || outletInactive}
              onChange={e => setDamages(e.target.value)}
            />
            {damagesLocked && <div className="text-sm text-green-700 mt-1">Already entered</div>}
          </div>

          <div>
            <label className="block text-2xl font-medium text-orange-500 mb-1">Cash Payment</label>
            <input
              type="number"
              placeholder="Cash Payment"
              className={`w-full border p-3 rounded-lg ${cashLocked || outletInactive ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-orange-200"}`}
              value={cash}
              disabled={cashLocked || outletInactive}
              onChange={e => setCash(e.target.value)}
            />
            {cashLocked && <div className="text-sm text-green-700 mt-1">Already entered</div>}
          </div>

          <div>
            <label className="block text-2xl font-medium text-orange-500 mb-1">Digital Payment</label>
            <input
              type="number"
              placeholder="Digital Payment"
              className={`w-full border p-3 rounded-lg ${digitalLocked || outletInactive ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-orange-200"}`}
              value={digital}
              disabled={digitalLocked || outletInactive}
              onChange={e => setDigital(e.target.value)}
            />
            {digitalLocked && <div className="text-sm text-green-700 mt-1">Already entered</div>}
          </div>
        </div>

        <div className="mt-5">
          <div className="bg-eggWhite p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Total Amount</div>
                <div className="text-xl font-semibold text-gray-800">{formatCurrency(totalAmount)}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Total Received</div>
                <div className="text-xl font-semibold text-gray-800">{formatCurrency(totalRecv)}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Closing Balance</div>
                <div className={`text-xl font-semibold ${closingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>{closingBalance < 0 ? '- ' : ''}{formatCurrency(Math.abs(closingBalance))}</div>
              </div>
            </div>

            <div className="mt-3 flex justify-center items-center gap-4">
              <div className="w-24 h-24 flex items-center justify-center">
                <svg viewBox="0 0 32 32" className="w-16 h-16">
                  <circle r="16" cx="16" cy="16" fill="#fff4e6" />
                  { (digitalNum + cashNum) > 0 ? (
                    <g>
                      <path d={(() => {
                        const total = digitalNum + cashNum;
                        const angle = (digitalNum / total) * 2 * Math.PI;
                        const x = 16 + 16 * Math.cos(-Math.PI/2 + angle);
                        const y = 16 + 16 * Math.sin(-Math.PI/2 + angle);
                        const large = angle > Math.PI ? 1 : 0;
                        return `M16 0 A16 16 0 ${large} 1 ${x} ${y} L16 16 Z`;
                      })()} fill="#ffb88c" />
                      <path d={(() => {
                        const total = digitalNum + cashNum;
                        const angle = (digitalNum / total) * 2 * Math.PI;
                        const x = 16 + 16 * Math.cos(-Math.PI/2 + angle);
                        const y = 16 + 16 * Math.sin(-Math.PI/2 + angle);
                        return `M${x} ${y} A16 16 0 0 1 16 0 L16 16 Z`;
                      })()} fill="#ff7518" opacity="0.95" />
                    </g>
                  ) : (
                    <circle r="10" cx="16" cy="16" fill="#fff4e6" />
                  )}
                </svg>
              </div>

              <div>
                <div className="text-sm">Digital: <span className="font-semibold">{formatCurrency(digitalNum)}</span></div>
                <div className="text-sm">Cash: <span className="font-semibold">{formatCurrency(cashNum)}</span></div>
                <div className="text-sm">Damages: <span className="font-semibold text-red-600">{damagesNum}</span></div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {(() => {
              const canSubmit = (!neccrateLocked && neccrate !== "") || (!salesLocked && sales !== "") || (!damagesLocked && damages !== "") || (!cashLocked && cash !== "") || (!digitalLocked && digital !== "");
              return (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || outletInactive}
                  className={`w-full py-3 bg-orange-500 rounded-lg mt-3 ${(!canSubmit || outletInactive) ? 'bg-gray-300 text-white-600 cursor-not-allowed' : 'bg-orange-500 text-white shadow-md'}`}>
                  {outletInactive ? 'Outlet Inactive' : 'Submit'}
                </button>
              );
            })()}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}