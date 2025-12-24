  import React from 'react'
  import WeeklyTrendGraph from "../assets/weeklyTrend.jpg";


  const Weeklytrend = () => {
     return (
    <div className="bg-white h-80 shadow rounded-xl p-4 mt-8">
      <h2 className="text-gray-600 text-center text-sm">Weekly Trend</h2>

      <h1 className="text-3xl font-bold text-center text-orange-600 mt-2">10.5k</h1>
      <p className="text-sm text-gray-500 text-center">avg/day</p>

      {/* Graph Image */}
      <div className="mt-4 flex justify-center">
        <img
          src={WeeklyTrendGraph}
          alt="Weekly trend graph"
          className="h-45 w-full object-absolute"
        />
      </div>
    </div>
  );
  }

  export default Weeklytrend
