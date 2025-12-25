import React from "react";

function formatDisplayDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

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
    <div className="overflow-hidden rounded-2xl bg-eggWhite shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-gray-500">
              <th className="min-w-[130px] px-4 py-3">Date</th>
              <th className="px-4 py-3 whitespace-nowrap">AECS Layout</th>
              <th className="px-4 py-3 whitespace-nowrap">Bandepalya</th>
              <th className="px-4 py-3 whitespace-nowrap">Hosa Road</th>
              <th className="px-4 py-3 whitespace-nowrap">Singasandra</th>
              <th className="px-4 py-3 whitespace-nowrap">Kudlu Gate</th>
              <th className="px-4 py-3 whitespace-nowrap text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={`text-xs text-gray-700 md:text-sm ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3">
                  {formatDisplayDate(row.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{row.aecs}</td>
                <td className="whitespace-nowrap px-4 py-3">{row.bande}</td>
                <td className="whitespace-nowrap px-4 py-3">{row.hosa}</td>
                <td className="whitespace-nowrap px-4 py-3">{row.singa}</td>
                <td className="whitespace-nowrap px-4 py-3">{row.kudlu}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-orange-600">
                  {row.total}
                </td>
              </tr>
            ))}

            {/* ⭐ COLUMN TOTAL ROW (GRAND TOTAL) */}
            <tr className="bg-orange-50 font-semibold text-orange-700">
              <td className="whitespace-nowrap px-4 py-3">Grand Total</td>
              <td className="whitespace-nowrap px-4 py-3">{totals.aecs}</td>
              <td className="whitespace-nowrap px-4 py-3">{totals.bande}</td>
              <td className="whitespace-nowrap px-4 py-3">{totals.hosa}</td>
              <td className="whitespace-nowrap px-4 py-3">{totals.singa}</td>
              <td className="whitespace-nowrap px-4 py-3">{totals.kudlu}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-orange-800">
                {grandTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer below table */}
      <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-xs md:flex-row md:items-center md:justify-between">
        <p className="text-gray-500">Showing {rows.length} records</p>
      </div>
    </div>
  );
}