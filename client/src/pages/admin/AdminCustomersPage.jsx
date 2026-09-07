import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function AdminCustomersPage() {
  const { allUsers = [] } = useOutletContext() || {};

  const clientUsersList = allUsers.filter(u => u.role === 'customer');

  return (
    <div className="bg-[#12141A] border border-white/10 rounded-lg p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-cinzel text-lg font-bold text-[#F5F5F0] uppercase">
            Customer & Client Directory
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Displaying all registered customer accounts
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-md text-xs font-bold uppercase">
          Clients: {clientUsersList.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-bold tracking-widest text-[#E0B094] uppercase">
              <th className="py-3 px-4">Client Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Orders</th>
              <th className="py-3 px-4">Total Spent</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {clientUsersList.map((client) => (
              <tr key={client.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-medium text-[#F5F5F0] flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-white/10 text-gray-300 font-bold flex items-center justify-center text-xs">
                    {client.name.charAt(0)}
                  </div>
                  <span>{client.name}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-400">{client.email}</td>
                <td className="py-3.5 px-4">{client.orders}</td>
                <td className="py-3.5 px-4 font-medium text-gray-200">{client.spent}</td>
                <td className="py-3.5 px-4 text-gray-400">{client.joined}</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="text-gray-400 hover:text-[#E0B094] transition-colors font-medium text-[11px]">View Orders</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
