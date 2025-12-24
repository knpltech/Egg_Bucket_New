import React from 'react'
import { useState } from "react";
import {
  faUser,
  faPhone,
  faLock,
  faKey,
  faChartLine,
  faStore,
  faMoneyBill,
  faWallet,
  faRupee,
  faArrowsSplitUpAndLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Distributorcomp = () => {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const roles = [
    {
      name: "Daily Sales",
      value: "daily_sales",
      icon: faChartLine,
      desc: "Manage daily egg sales records.",
    },
    {
      name: "Outlets",
      value: "outlets",
      icon: faStore,
      desc: "Manage distribution outlets.",
    },
    {
      name: "Digital Payments",
      value: "digital_payments",
      icon: faWallet,
      desc: "Process UPI and card payments.",
    },
    {
      name: "Cash Payments",
      value: "cash_payments",
      icon: faMoneyBill,
      desc: "Log and verify cash transactions.",
    },
    {
      name: "Reports",
      value: "reports",
      icon: faChartLine,
      desc: "View analytics and downloads.",
    },
    {
      name: "Necc-Rate",
      value:"neccrate",
      icon:  faRupee,
      desc: "Average amount of eggs.",
    },
    {
      name: "Damages access",
      value: "Damages_access",
      icon: faArrowsSplitUpAndLeft,
      desc: "Access how many damaged."
    }
  ];

  const handleSubmit = () => {
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Distributor Added:", form);
    alert("Distributor added successfully!");
  };

  return (
    <div className="pt-10 px-20">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold mb-2">Add Distributor</h1>
      <p className="text-gray-600 mb-8">Create a new distributor account and assign module access.</p>

      <div className="bg-white shadow rounded-xl">

        {/* SECTION 1: DISTRIBUTOR DETAILS */}
        <div className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-black-600 pb-3">
            <FontAwesomeIcon icon={faUser} /> Distributor Details
          </h2>

          <div className="grid grid-cols-2 gap-6 mt-4 mb-4">
            <div>
              <label className="text-gray-600 text-sm">Full Name</label>
              <input
                type="text"
                className="border rounded-lg w-full p-2 mt-1"
                placeholder="e.g. John Smith"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-gray-600 text-sm">Phone Number</label>
              <input
                type="tel"
                className="border rounded-lg w-full p-2 mt-1"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ACCOUNT SECURITY */}
        <div className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-black-600">
            <FontAwesomeIcon icon={faLock} /> Account Security
          </h2>

          <div className=" flex flex-col gap-6 mt-4">
            <div>
              <label className="text-gray-600 text-sm">Username</label><br></br>
              <input
                type="text"
                className="border rounded-lg w-120 p-2 mt-1"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className='flex flex-row gap-4'>
                <div >
                    <label className="text-gray-600 text-sm">Password</label><br></br>
                    <input
                        type="password"
                        className="border rounded-lg w-120 p-2 mt-1 "
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                </div>

                <div className='ml-4'>
                    <label className="text-gray-600 text-sm">Confirm Password</label><br></br>
                    <input
                        type="password"
                        className="border rounded-lg w-120 p-2 mt-1"
                        value={form.confirmPassword}
                        onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                        }
                    />
                </div>

            </div>
            
          </div>
        </div>

        {/* SECTION 3: ACCESS ROLE */}
        <div className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-orange-600">
            <FontAwesomeIcon icon={faKey} /> Access Role
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Distributor gets access to exactly one module.
          </p>

          <div className="grid grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.value}
                className={`p-4 rounded-xl border cursor-pointer ${
                  form.role === role.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setForm({ ...form, role: role.value })}
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={role.icon}
                    className={`text-xl ${
                      form.role === role.value ? "text-orange-600" : "text-gray-600"
                    }`}
                  />
                  <span className="font-medium">{role.name}</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">{role.desc}</p>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* SUBMIT BUTTON */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg text-lg font-semibold"
        >
          Add Distributor
        </button>
      </div>

    </div>
  );
}

export default Distributorcomp
