export default function DailyTable({rows}) {
  const totals = {
      aecs: rows.reduce((s, r) => s + r.aecs, 0),
      bande: rows.reduce((s, r) => s + r.bande, 0),
      hosa: rows.reduce((s, r) => s + r.hosa, 0),
      singa: rows.reduce((s, r) => s + r.singa, 0),
      kudlu: rows.reduce((s, r) => s + r.kudlu, 0),
    };

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  return (
    <div className="bg-white ml-4 rounded-xl shadow p-6">
      <table className="w-full h-15 text-left ">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-2 px-4">Date</th>
            <th className="py-2 px-4">AECS Layout</th>
            <th className="py-2 px-4">Bandepalya</th>
            <th className="py-2 px-4">Hosa Road</th>
            <th className="py-2 px-4">Singasandra</th>
            <th className="py-2 px-4">Kudlu Gate</th>
            <th className="py-2 px-4">Total</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b h-15">
              <td className="py-2 px-4">{row.date}</td>
              <td className="py-2 px-4">{row.aecs}</td>
              <td className="py-2 px-4">{row.bande}</td>
              <td className="py-2 px-4">{row.hosa}</td>
              <td className="py-2 px-4">{row.singa}</td>
              <td className="py-2 px-4">{row.kudlu}</td>
              <td className="py-2 px-4 font-semibold text-orange-600">{row.total}</td>
            </tr>
          ))}

          {/* ⭐ COLUMN TOTAL ROW (GRAND TOTAL) */}
          <tr className="bg-orange-50 font-semibold text-orange-700">
            <td className="py-3 px-4">Grand Total</td>
            <td className="py-3 px-4">{totals.aecs}</td>
            <td className="py-3 px-4">{totals.bande}</td>
            <td className="py-3 px-4">{totals.hosa}</td>
            <td className="py-3 px-4">{totals.singa}</td>
            <td className="py-3 px-4">{totals.kudlu}</td>
            <td className="py-3 px-4 text-orange-800">{grandTotal}</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-4 text-sm text-gray-500">
        Showing {rows.length}
      </p>
    </div>
  );
}
