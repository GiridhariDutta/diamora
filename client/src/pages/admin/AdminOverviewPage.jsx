import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  UserCheck, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { allUsers = [] } = useOutletContext() || {};

  const adminUsersList = allUsers.filter(u => u.role === 'admin');

  return (
    <>
      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        
        <div className="bg-[#12141A] border border-white/10 rounded-lg p-5 relative overflow-hidden group hover:border-[#E0B094]/50 transition-all shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-[#E0B094] uppercase">Total Revenue</span>
            <div className="p-2 rounded-md bg-[#E0B094]/10 text-[#E0B094]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F5F0] mb-1">$142,850</h3>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% this month
          </span>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-lg p-5 relative overflow-hidden group hover:border-[#E0B094]/50 transition-all shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-[#E0B094] uppercase">Admin Accounts</span>
            <div className="p-2 rounded-md bg-[#E0B094]/10 text-[#E0B094]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F5F0] mb-1">{adminUsersList.length} Admins</h3>
          <span className="text-[11px] text-[#E0B094]">Full System Control</span>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-lg p-5 relative overflow-hidden group hover:border-[#E0B094]/50 transition-all shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-[#E0B094] uppercase">Masterpieces</span>
            <div className="p-2 rounded-md bg-[#E0B094]/10 text-[#E0B094]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F5F0] mb-1">18 Models</h3>
          <span className="text-[11px] text-[#E0B094]">3D Canvas Enabled</span>
        </div>

        <div className="bg-[#12141A] border border-white/10 rounded-lg p-5 relative overflow-hidden group hover:border-[#E0B094]/50 transition-all shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-[#E0B094] uppercase">Total Users</span>
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F5F0] mb-1">{allUsers.length} Users</h3>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Live Firestore Sync
          </span>
        </div>

      </div>

      {/* SYSTEM ACCOUNTS SUMMARY TABLE */}
      <div className="bg-[#12141A] border border-white/10 rounded-lg p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#F5F5F0] uppercase">
              All System Accounts & Users
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Firestore authenticated users and administrators
            </p>
          </div>

          <Link 
            to="/admin/users"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E0B094] to-[#D4AF37] text-[#0C0D10] font-semibold text-xs tracking-wider rounded-md uppercase shadow hover:brightness-110 transition-all shrink-0"
          >
            <UserCheck className="w-4 h-4" />
            <span>Manage Admin Users ({adminUsersList.length})</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-bold tracking-widest text-[#E0B094] uppercase">
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {allUsers.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[#F5F5F0] flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-md font-bold flex items-center justify-center text-xs ${
                      item.role === 'admin' 
                        ? 'bg-gradient-to-br from-[#E0B094] to-[#D4AF37] text-[#0C0D10]' 
                        : 'bg-white/10 text-gray-300'
                    }`}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[140px] sm:max-w-xs">{item.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">{item.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase inline-flex items-center gap-1 ${
                      item.role === 'admin' 
                        ? 'bg-[#E0B094]/20 text-[#E0B094] border border-[#E0B094]/40' 
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      {item.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                      {item.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">{item.joined}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link 
                      to={item.role === 'admin' ? '/admin/users' : '/admin/customers'}
                      className="text-[#E0B094] hover:underline font-semibold text-[11px]"
                    >
                      {item.role === 'admin' ? 'Manage Role' : 'View Profile'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
