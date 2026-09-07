import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  UserCheck,
  Settings, 
  LogOut, 
  Eye, 
  ShieldCheck, 
  Search, 
  Bell, 
  Sparkles,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';
import api from '../api/axios';
import { setCookie, removeCookie } from '../utils/cookies';

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [allUsers, setAllUsers] = useState([
    { id: 'admin-1', name: 'Goutam Jana', email: 'janagoutam147@gmail.com', role: 'admin', permissions: 'Super Administrator', orders: 12, spent: '$45,200', joined: 'Sep 7, 2026', status: 'Active' },
    { id: 'admin-2', name: 'Alexander Vance', email: 'vance@diamora.com', role: 'admin', permissions: 'Inventory & Vault Manager', orders: 8, spent: '$32,100', joined: 'Aug 15, 2026', status: 'Active' },
    { id: 'user-1', name: 'Eleanor Vance', email: 'eleanor@diamora.com', role: 'customer', permissions: 'Client Access', orders: 1, spent: '$4,200', joined: 'Sep 6, 2026', status: 'Active' },
    { id: 'user-2', name: 'Julian Thorne', email: 'julian@luxury.io', role: 'customer', permissions: 'Client Access', orders: 5, spent: '$28,900', joined: 'Sep 4, 2026', status: 'Active' },
    { id: 'user-3', name: 'Sophia Sterling', email: 'sophia@highfashion.org', role: 'customer', permissions: 'Client Access', orders: 2, spent: '$9,800', joined: 'Sep 1, 2026', status: 'Active' }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error('Failed to parse user:', err);
      }
    }
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/me');
      if (res.data?.success && res.data?.data) {
        const profile = res.data.data;
        setUser(profile);
        if (res.data.token) {
          setCookie('token', res.data.token, 7);
        }
        localStorage.setItem('user', JSON.stringify(profile));

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
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    removeCookie('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard, path: '/admin' },
    { id: 'admin_users', label: 'ADMIN USERS', icon: UserCheck, path: '/admin/users' },
    { id: 'inventory', label: 'INVENTORY & 3D MODELS', icon: Package, path: '/admin/inventory' },
    { id: 'orders', label: 'VAULT ORDERS', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'customers', label: 'CLIENT DIRECTORY', icon: Users, path: '/admin/customers' },
    { id: 'settings', label: 'SETTINGS', icon: Settings, path: '/admin/settings' },
  ];

  // Resolve active tab from current URL path
  const currentPath = location.pathname;
  const activeTabItem = navItems.find(item => item.path === currentPath) || navItems[0];

  const handleNavigate = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#090A0D] text-[#F5F5F0] font-poppins flex flex-col md:flex-row overflow-x-hidden">
      
      {/* MOBILE TOP NAVBAR */}
      <div className="md:hidden flex items-center justify-between bg-[#0C0D10] border-b border-white/10 px-4 py-3 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#E0B094] to-[#D4AF37] p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#0C0D10] rounded-[3px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#E0B094]" />
            </div>
          </div>
          <span className="font-cinzel text-base font-bold tracking-widest text-[#D4AF37]">DIAMORA ADMIN</span>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-md text-gray-300 hover:text-[#E0B094] hover:bg-white/5 transition-colors"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE OVERLAY BACKDROP */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50 md:z-30
        w-64 bg-[#0C0D10] border-r border-white/10 p-5 flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#E0B094] to-[#D4AF37] p-0.5 shadow-md shadow-[#E0B094]/10 flex items-center justify-center">
                <div className="w-full h-full bg-[#0C0D10] rounded-[4px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#E0B094]" />
                </div>
              </div>
              <div>
                <h1 className="font-cinzel text-base font-bold tracking-[0.2em] text-[#D4AF37]">
                  DIAMORA
                </h1>
                <span className="text-[9px] tracking-widest text-[#E0B094] font-semibold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ADMIN PORTAL
                </span>
              </div>
            </div>

            <button 
              onClick={() => setMobileSidebarOpen(false)} 
              className="md:hidden text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path === '/admin' && (currentPath === '/admin' || currentPath === '/admin/'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold tracking-wider transition-all uppercase ${
                    isActive 
                      ? 'bg-[#E0B094]/15 text-[#E0B094] border border-[#E0B094]/40 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E0B094]' : 'text-gray-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* View Storefront & Logout */}
        <div className="pt-5 border-t border-white/10 space-y-2 mt-6">
          <button
            onClick={() => { setMobileSidebarOpen(false); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-md text-xs font-medium tracking-wider text-[#F5F5F0] transition-all"
          >
            <Eye className="w-4 h-4 text-[#E0B094]" />
            <span>VIEW STOREFRONT</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md text-xs font-medium tracking-wider text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>LOG OUT</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* TOP BAR HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-[#F5F5F0] uppercase">
              {activeTabItem.id === 'overview' && 'Executive Summary'}
              {activeTabItem.id === 'admin_users' && 'Admin Users'}
              {activeTabItem.id === 'inventory' && 'Jewelry Catalog & Models'}
              {activeTabItem.id === 'orders' && 'Client Orders & Reservations'}
              {activeTabItem.id === 'customers' && 'Client Directory'}
              {activeTabItem.id === 'settings' && 'System Configuration'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Welcome back, <span className="text-[#E0B094] font-semibold">{user?.name || 'Administrator'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search catalog or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#12141A] border border-white/15 rounded-md text-xs text-[#F5F5F0] placeholder-gray-500 focus:outline-none focus:border-[#E0B094] transition-all"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchProfile}
              className="p-2 bg-[#12141A] border border-white/15 rounded-md text-gray-300 hover:text-[#E0B094] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E0B094]' : ''}`} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 bg-[#12141A] border border-white/15 rounded-md text-gray-300 hover:text-[#E0B094] transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E0B094]" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet for Admin Pages */}
        <Outlet context={{ allUsers, setAllUsers, user, searchTerm }} />

      </main>

    </div>
  );
}
