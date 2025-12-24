import line from '../assets/linegraph.png';

export default function Rateanalytics() {
  return (
    <div className="mt-10 ">
      <h1 className="text-2xl font-bold mb-6">NECC Rate Analytics</h1>

      <div className="grid gap-6 ml-4"
           style={{ gridTemplateColumns: "1.3fr 0.5fr 0.5fr" }}>
        
        {/* Chart */}
        <div className="bg-white shadow rounded-xl p-6 h-35 flex items-center justify-center">
          <p>The sales graph of eggs</p>
        </div>

        {/* Card 1 */}
        <div className="bg-white shadow rounded-xl text-center item-center">
          <h2 className="text-gray-600 mt-3">Weekly Average</h2>
          <h1 className="text-4xl font-bold m-2 text-orange-600">₹5.45</h1>
          <p className="text-gray-500">Past 7 days</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow rounded-xl text-center item-center">
          <h2 className="text-gray-600 mt-3">Weekly Average</h2>
          <h1 className="text-4xl font-bold m-2 text-orange-600">₹5.38</h1>
          <p className="text-gray-500">Past 30 days</p>
        </div>
      </div>
    </div>
  );
}
