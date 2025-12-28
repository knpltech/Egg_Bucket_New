import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";

const DistributorList = () => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const res = await fetch("/api/admin/all-distributors");
        const data = await res.json();
        setDistributors(Array.isArray(data) ? data : []);
      } catch {
        setDistributors([]);
      }
      setLoading(false);
    };
    fetchDistributors();
  }, []);

  return (
    <div className="min-h-screen bg-eggBg px-4 py-6 md:px-8">
      <Topbar />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 mt-6">
        <h1 className="text-2xl font-bold mb-4">Distributors</h1>
        {loading ? (
          <div>Loading...</div>
        ) : distributors.length === 0 ? (
          <div>No distributors found.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500">
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {distributors.map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{d.fullName}</td>
                  <td className="px-4 py-3">{d.username}</td>
                  <td className="px-4 py-3">{d.phone}</td>
                  <td className="px-4 py-3">{Array.isArray(d.roles) ? d.roles.join(", ") : d.roles}</td>
                  <td className="px-4 py-3">{d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleString() : (d.createdAt ? new Date(d.createdAt.seconds ? d.createdAt.seconds * 1000 : d.createdAt).toLocaleString() : "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DistributorList;
