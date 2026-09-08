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
    <div className="space-y-3 font-open-sans">
      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        
        <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Total Revenue</span>
            <div className="p-1 rounded-[3px] bg-amber-50 text-amber-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="font-open-sans text-base sm:text-lg font-semibold text-slate-900 mb-0.5">$142,850</h3>
          <span className="text-[10.5px] text-emerald-600 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> +18.4% this month
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Admin Accounts</span>
            <div className="p-1 rounded-[3px] bg-amber-50 text-amber-700">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="font-open-sans text-base sm:text-lg font-semibold text-slate-900 mb-0.5">{adminUsersList.length} Admins</h3>
          <span className="text-[10.5px] text-amber-800 font-medium">Full System Control</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Masterpieces</span>
            <div className="p-1 rounded-[3px] bg-amber-50 text-amber-700">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="font-open-sans text-base sm:text-lg font-semibold text-slate-900 mb-0.5">18 Models</h3>
          <span className="text-[10.5px] text-amber-800 font-medium">3D Canvas Enabled</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase">Total Users</span>
            <div className="p-1 rounded-[3px] bg-purple-50 text-purple-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <h3 className="font-open-sans text-base sm:text-lg font-semibold text-slate-900 mb-0.5">{allUsers.length} Users</h3>
          <span className="text-[10.5px] text-emerald-600 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> Live Firestore Sync
          </span>
        </div>

      </div>

      {/* SYSTEM ACCOUNTS SUMMARY TABLE */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-slate-200">
          <div>
            <h3 className="font-open-sans text-sm sm:text-base font-semibold text-slate-900 uppercase">
              All System Accounts & Users
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Firestore authenticated users and administrators
            </p>
          </div>

          <Link 
            to="/admin/users"
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 font-semibold text-[11px] tracking-wider rounded-[4px] uppercase shadow-2xs transition-all shrink-0"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manage Admin Users ({adminUsersList.length})</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 bg-slate-50 uppercase">
                <th className="py-2 px-3">User Name</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Joined</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allUsers.map((item) => (
                <tr key={item.id} className="bg-white hover:bg-amber-50/40 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-900 flex items-center gap-2">
                    <div className={`w-6.5 h-6.5 rounded-[4px] font-semibold flex items-center justify-center text-[11px] ${
                      item.role === 'admin' 
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#B48811] text-slate-950 shadow-2xs' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[140px] sm:max-w-xs">{item.name}</span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{item.email}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-[3px] text-[8.5px] font-semibold uppercase inline-flex items-center gap-1 ${
                      item.role === 'admin' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300/80' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {item.role === 'admin' && <ShieldCheck className="w-2.5 h-2.5 text-amber-700" />}
                      {item.role}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 text-[11px]">{item.joined}</td>
                  <td className="py-2 px-3">
                    <span className="text-emerald-600 flex items-center gap-1 font-medium text-[10.5px]">
                      <CheckCircle2 className="w-3 h-3" /> {item.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Link 
                      to={item.role === 'admin' ? '/admin/users' : '/admin/customers'}
                      className="text-amber-800 hover:text-amber-900 hover:underline font-semibold text-[10.5px]"
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
    </div>
  );
}
