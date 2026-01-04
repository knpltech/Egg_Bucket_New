import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const API_URL = import.meta.env.VITE_API_URL;

export default function ViewerData() {
  const [dailySales, setDailySales] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [neccRates, setNeccRates] = useState([]);
  const [damages, setDamages] = useState([]);
  const [digitalPayments, setDigitalPayments] = useState([]);
  const [cashPayments, setCashPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [salesRes, outletsRes, neccRes, damagesRes, digitalRes, cashRes] = await Promise.all([
          fetch(`${API_URL}/dailysales/all`),
          fetch(`${API_URL}/outlets/all`),
          fetch(`${API_URL}/neccrate/all`),
          fetch(`${API_URL}/daily-damage/all`),
          fetch(`${API_URL}/digital-payments/all`),
          fetch(`${API_URL}/cash-payments/all`),
        ]);
        setDailySales(await salesRes.json());
        setOutlets(await outletsRes.json());
        setNeccRates(await neccRes.json());
        setDamages(await damagesRes.json());
        setDigitalPayments(await digitalRes.json());
        setCashPayments(await cashRes.json());
      } catch (err) {
        // Handle error
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-eggBg flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-4">Viewer Data Overview</h1>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Daily Sales</h2>
                <pre className="bg-white p-4 rounded shadow overflow-x-auto">{JSON.stringify(dailySales, null, 2)}</pre>
              </section>
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Outlets</h2>
                <pre className="bg-white p-4 rounded shadow overflow-x-auto">{JSON.stringify(outlets, null, 2)}</pre>
              </section>
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">NECC Rates</h2>
                <pre className="bg-white p-4 rounded shadow overflow-x-auto">{JSON.stringify(neccRates, null, 2)}</pre>
              </section>
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Daily Damages</h2>
                <pre className="bg-white p-4 rounded shadow overflow-x-auto">{JSON.stringify(damages, null, 2)}</pre>
              </section>
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Digital Payments</h2>
                <pre className="bg-white p-4 rounded shadow overflow-x-auto">{JSON.stringify(digitalPayments, null, 2)}</pre>
              </section>
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Cash Payments</h2>
                <pre className="bg-white p-4 rounded shadow overflow-x-auto">{JSON.stringify(cashPayments, null, 2)}</pre>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
