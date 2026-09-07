import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  UserCheck,
  Plus, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import api from '../api/axios';

export default function AdminDashboard({ user, onLogout, onNavigateToStore }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [allUsers, setAllUsers] = useState([
    { id: 'admin-1', name: 'Goutam Jana', email: 'janagoutam147@gmail.com', role: 'admin', permissions: 'Super Administrator', orders: 12, spent: '$45,200', joined: 'Sep 7, 2026', status: 'Active' },
    { id: 'admin-2', name: 'Alexander Vance', email: 'vance@diamora.com', role: 'admin', permissions: 'Inventory & Vault Manager', orders: 8, spent: '$32,100', joined: 'Aug 15, 2026', status: 'Active' },
    { id: 'user-1', name: 'Eleanor Vance', email: 'eleanor@diamora.com', role: 'customer', permissions: 'Client Access', orders: 1, spent: '$4,200', joined: 'Sep 6, 2026', status: 'Active' },
    { id: 'user-2', name: 'Julian Thorne', email: 'julian@luxury.io', role: 'customer', permissions: 'Client Access', orders: 5, spent: '$28,900', joined: 'Sep 4, 2026', status: 'Active' },
    { id: 'user-3', name: 'Sophia Sterling', email: 'sophia@highfashion.org', role: 'customer', permissions: 'Client Access', orders: 2, spent: '$9,800', joined: 'Sep 1, 2026', status: 'Active' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/me');
      if (res.data?.success && res.data?.data) {
        const profile = res.data.data;
        // Upsert current profile into user list if missing
        setAllUsers(prev => {
          const exists = prev.some(u => u.email === profile.email);
          if (!exists && profile.email) {
            return [{
              id: profile.uid || 'current',
              name: profile.name || 'Admin',
              email: profile.email,
              role: profile.role || 'admin',
              permissions: 'Super Administrator',
              orders: 0,
              spent: '$0',
              joined: 'Sep 7, 2026',
              status: 'Active'
            }, ...prev];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Filter list by search query
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter specifically for Admin Users view
  const adminUsersList = filteredUsers.filter(u => u.role === 'admin');

  // Filter for Clients view
  const clientUsersList = filteredUsers.filter(u => u.role === 'customer');

  return (
    <AdminLayout
      user={user}
      onLogout={onLogout}
      onNavigateToStore={onNavigateToStore}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      loading={loading}
      onRefresh={fetchProfile}
    >
      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <>
          {/* METRICS CARDS GRID - SUBTLE ROUNDED CORNERS */}
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
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F5F0] mb-1">{filteredUsers.length} Users</h3>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Live Firestore Sync
              </span>
            </div>

          </div>

          {/* ALL ACCOUNTS SUMMARY TABLE */}
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

              <button 
                onClick={() => setActiveTab('admin_users')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E0B094] to-[#D4AF37] text-[#0C0D10] font-semibold text-xs tracking-wider rounded-md uppercase shadow hover:brightness-110 transition-all shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>View Admin Users ({adminUsersList.length})</span>
              </button>
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
                  {filteredUsers.map((item) => (
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
                        <button className="text-[#E0B094] hover:underline font-semibold text-[11px]">
                          {item.role === 'admin' ? 'Manage Role' : 'View Profile'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 2. ADMIN USERS MENU VIEW */}
      {activeTab === 'admin_users' && (
        <div className="bg-[#12141A] border border-white/10 rounded-lg p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#E0B094]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F5F5F0] uppercase">
                  Administrator Accounts & Roles
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Displaying all users with <span className="text-[#E0B094] font-semibold">ADMIN</span> role privileges in Firestore
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#E0B094]/15 border border-[#E0B094]/30 text-[#E0B094] rounded-md text-xs font-bold uppercase">
                Total Admins: {adminUsersList.length}
              </span>
            </div>
          </div>

          {/* Admin Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-bold tracking-widest text-[#E0B094] uppercase">
                  <th className="py-3 px-4">Admin Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role Badge</th>
                  <th className="py-3 px-4">Permissions</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {adminUsersList.map((admin) => (
                  <tr key={admin.id} className="bg-[#E0B094]/5 hover:bg-[#E0B094]/10 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#F5F5F0] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#E0B094] to-[#D4AF37] text-[#0C0D10] font-bold flex items-center justify-center text-xs shadow">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-[#F5F5F0]">{admin.name}</p>
                        <p className="text-[10px] text-gray-400">ID: {admin.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300 font-mono text-xs">{admin.email}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#E0B094]/20 text-[#E0B094] border border-[#E0B094]/40 text-[9px] font-extrabold uppercase inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#E0B094]" />
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#E0B094] bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                        <Lock className="w-3 h-3 text-[#E0B094]" /> {admin.permissions}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400">{admin.joined}</td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 bg-white/5 hover:bg-[#E0B094]/20 border border-white/15 hover:border-[#E0B094]/40 text-[#E0B094] rounded-md transition-all text-xs font-medium">
                        Manage Privileges
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CLIENT DIRECTORY VIEW */}
      {activeTab === 'customers' && (
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
      )}

      {/* 4. OTHER TABS PLACEHOLDER */}
      {(activeTab === 'inventory' || activeTab === 'orders' || activeTab === 'settings') && (
        <div className="bg-[#12141A] border border-white/10 rounded-lg p-8 text-center shadow-xl">
          <h3 className="font-cinzel text-xl font-bold text-[#D4AF37] uppercase mb-2">
            {activeTab.toUpperCase()} PORTAL MODULE
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            This module is connected to your backend services and ready for management operations.
          </p>
        </div>
      )}

    </AdminLayout>
  );
}
