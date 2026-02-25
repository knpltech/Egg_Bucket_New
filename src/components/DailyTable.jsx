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

export default function DailyTable({
  rows = [],
  outlets = [],
  onEdit,
  showRupee = false,
}) {

  /* ================= BUILD OUTLET META ================= */
  // outlets coming from DB: [{ name, area, status }]
  const outletMeta = Array.isArray(outlets)
    ? outlets.map((o) => ({
        key: typeof o === "string" ? o : o.id || o.name || o.area || o,
        label: typeof o === "string" ? o : o.name || o.area || o.id,
        status: o.status || "Active",
      }))
    : [];

  const outletKeys = outletMeta.map((o) => o.key);

  const outletStatusMap = {};
  outletMeta.forEach((o) => {
    outletStatusMap[o.key] = o.status;
  });

  /* ================= TOTAL CALC ================= */
  const totals = {};
  outletKeys.forEach((outletKey) => {
    totals[outletKey] = rows.reduce(
      (s, r) => s + Number(r.outlets?.[outletKey] || 0),
      0
    );
  });

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  /* ================= CURRENCY ================= */
  const formatCurrencyNoDecimals = (value) => {
    if (showRupee) {
      return "₹" + Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      });
    }
    return Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-eggWhite shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-gray-500">
              <th className="min-w-[130px] px-4 py-3">Date</th>

              {outletMeta.map((o, i) => {
                const inactive = outletStatusMap[o.key] === "Inactive";
                return (
                  <th
                    key={o.key + "-" + i}
                    className={`px-4 py-3 whitespace-nowrap ${
                      inactive ? "text-gray-400 line-through" : ""
                    }`}
                  >
                    {o.label.toUpperCase()}
                    {inactive && (
                      <span className="ml-1 text-xs text-red-500">
                        (Inactive)
                      </span>
                    )}
                  </th>
                );
              })}

              <th className="px-4 py-3 whitespace-nowrap text-right">
                Total
              </th>

              {/* Edit column */}
              {typeof window !== "undefined" &&
                localStorage.getItem("user") &&
                (() => {
                  const user = JSON.parse(localStorage.getItem("user"));
                  const isAdmin =
                    user &&
                    (user.role === "Admin" ||
                      (Array.isArray(user.roles) &&
                        user.roles.includes("admin")));
                  if (isAdmin && typeof onEdit === "function")
                    return <th className="px-4 py-3">Edit</th>;
                  return null;
                })()}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.date ? row.date + "-" + idx : idx}
                className={`text-xs text-gray-700 md:text-sm ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3">
                  {formatDisplayDate(row.date)}
                </td>

                {outletMeta.map((o, j) => {
                  const inactive = outletStatusMap[o.key] === "Inactive";
                  return (
                    <td
                      key={o.key + "-" + j}
                      className={`whitespace-nowrap px-4 py-3 ${
                        inactive ? "text-gray-400 bg-gray-50" : ""
                      }`}
                    >
                      {formatCurrencyNoDecimals(
                        row.outlets?.[o.key] ?? 0
                      )}
                    </td>
                  );
                })}

                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-orange-600">
                  {formatCurrencyNoDecimals(row.total)}
                </td>

                {/* Edit button */}
                {typeof window !== "undefined" &&
                  localStorage.getItem("user") &&
                  (() => {
                    const user = JSON.parse(localStorage.getItem("user"));
                    const isAdmin =
                      user &&
                      (user.role === "Admin" ||
                        (Array.isArray(user.roles) &&
                          user.roles.includes("admin")));
                    if (isAdmin && typeof onEdit === "function") {
                      return (
                        <td className="whitespace-nowrap px-4 py-3">
                          <button
                            className="text-blue-600 hover:underline text-xs font-medium"
                            onClick={() => onEdit(row)}
                          >
                            Edit
                          </button>
                        </td>
                      );
                    }
                    return null;
                  })()}
              </tr>
            ))}

            {/* GRAND TOTAL */}
            <tr className="bg-orange-50 font-semibold text-orange-700">
              <td className="whitespace-nowrap px-4 py-3">Grand Total</td>

              {outletKeys.map((outletKey, i) => (
                <td
                  key={outletKey + "-total-" + i}
                  className="whitespace-nowrap px-4 py-3"
                >
                  {formatCurrencyNoDecimals(totals[outletKey])}
                </td>
              ))}

              <td className="whitespace-nowrap px-4 py-3 text-right text-orange-800">
                {formatCurrencyNoDecimals(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-xs md:flex-row md:items-center md:justify-between">
        <p className="text-gray-500">Showing {rows.length} records</p>
      </div>
    </div>
  );
}