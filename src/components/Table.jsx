export default function NeccTableSection({rows,
  fromDate,
  toDate,
  setFromDate,
  setToDate,}) {
  
    const downloadCSV = (data) => {
      if (data.length === 0) {
        alert("No data to download");
        return;
      }

      const header = ["Date", "Rate", "Remarks"];
      const rows = data.map(row => [
        row.date,
        row.rate,
        row.remarks
      ]);

      let csvContent =
        "data:text/csv;charset=utf-8," +
        [header, ...rows].map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "necc_rate_data.csv");
      document.body.appendChild(link);
      link.click();
    };


    const setLastWeek = (setFromDate, setToDate) => {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);

      setFromDate(lastWeek.toISOString().split("T")[0]);
      setToDate(today.toISOString().split("T")[0]);
    };

    const setLastMonth = (setFromDate, setToDate) => {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);

      setFromDate(lastMonth.toISOString().split("T")[0]);
      setToDate(today.toISOString().split("T")[0]);
    };


  return (
    <div className="pt-10"> 
      {/* 🟠 Title */}
      <h1 className="text-2xl font-bold mb-6">NECC Rate</h1>

      {/* 🟠 Filters */}
      <div className='flex justify-between items-center gap-3 mb-6'>
        <div className='flex gap-5 ml-4'>
          <input type='date' value={fromDate}
            onChange={(e) => setFromDate(e.target.value)} className="border rounded-lg p-2" />
          <input type='date' value={toDate}
            onChange={(e) => setToDate(e.target.value)}className="border rounded-lg p-2" />
        </div>
        <div className='flex gap-5 mr-4'>
          <button className="border px-4 py-2 rounded-lg bg-orange-600 text-white" onClick={() => downloadCSV(rows)}>
            Download Data
          </button>

          <button onClick={() => setLastWeek(setFromDate, setToDate)} className="border px-4 py-2 rounded-lg bg-orange-600 text-white">
            Last week
          </button>

          <button onClick={() => setLastMonth(setFromDate, setToDate)} className="border px-4 py-2 rounded-lg">
            Last month
          </button>
        </div>
        
      </div>

      {/* 🟠 Table */}
      <table className="w-full bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100 text-left text-gray-700">
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">NECC Rate</th>
            <th className="py-3 px-4">Remarks</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-6 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b">
                <td className="py-3 px-4">{row.date}</td>
                <td className="py-3 px-4">{row.rate}</td>
                <td className="py-3 px-4">{row.remarks}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
