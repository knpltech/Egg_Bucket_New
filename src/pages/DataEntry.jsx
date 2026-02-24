import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DataEntry() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const areas = [
    "AECS Layout",
    "Hosa Road",
    "Singasandra",
    "Malleswaram",
    "Haralur Road",
    "Chandapura",
    "Bommasandra",
    "Sainagar",
  ];

  return (
    <div className="min-h-screen bg-eggBg px-6 py-10">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Egg Bucket
        </h1>
        <p className="text-gray-500 mt-2">
          Enter the daily data for selected area
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md text-center">

        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Data Entry
        </h2>

        <button
          onClick={() => setShowPopup(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition"
        >
          Select Area
        </button>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-80 shadow-lg">

            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Select Area
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() =>
                    navigate("/admin/area-entry", {
                      state: { area },
                    })
                  }
                  className="w-full text-left px-3 py-2 border rounded-lg hover:bg-orange-50 transition"
                >
                  {area}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 w-full bg-gray-200 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
