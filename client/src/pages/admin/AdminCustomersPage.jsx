import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function AdminCustomersPage() {
  const { allUsers = [] } = useOutletContext() || {};

  const clientUsersList = allUsers.filter(u => u.role === 'customer');

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 shadow-2xs font-open-sans">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
        <div>
          <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase">
            Customer & Client Directory
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Displaying all registered customer accounts
          </p>
        </div>
        <span className="px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-[4px] text-[10px] font-semibold uppercase">
          Clients: {clientUsersList.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 bg-slate-50 uppercase">
              <th className="py-2 px-3">Client Name</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Orders</th>
              <th className="py-2 px-3">Total Spent</th>
              <th className="py-2 px-3">Joined</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {clientUsersList.map((client) => (
              <tr key={client.id} className="bg-white hover:bg-amber-50/40 transition-colors">
                <td className="py-2 px-3 font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center text-[11px]">
                    {client.name.charAt(0)}
                  </div>
                  <span>{client.name}</span>
                </td>
                <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{client.email}</td>
                <td className="py-2 px-3 font-medium text-slate-800">{client.orders}</td>
                <td className="py-2 px-3 font-semibold text-slate-900">{client.spent}</td>
                <td className="py-2 px-3 text-slate-600 text-[11px]">{client.joined}</td>
                <td className="py-2 px-3 text-right">
                  <button className="text-amber-800 hover:text-amber-900 hover:underline transition-colors font-semibold text-[10.5px]">View Orders</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
