import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  UserCheck,
  FolderTree,
  Boxes,
  Palette,
  Award,
  Gem,
  Settings, 
  ChevronDown,
  ChevronRight,
  FileText,
  BookOpen,
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
    { id: 'overview', label: 'DASHBOARD', icon: LayoutDashboard, path: '/admin' },
    { id: 'admin_users', label: 'ADMIN USERS', icon: UserCheck, path: '/admin/users' },
    { id: 'categories', label: 'CATEGORIES', icon: FolderTree, path: '/admin/categories' },
    { id: 'collections', label: 'COLLECTIONS', icon: Boxes, path: '/admin/collections' },
    { id: 'colors', label: 'COLORS', icon: Palette, path: '/admin/colors' },
    { id: 'purities', label: 'PURITY', icon: Award, path: '/admin/purities' },
    { id: 'diamond_qualities', label: 'DIAMOND QUALITY', icon: Gem, path: '/admin/diamond-qualities' },
    { id: 'inventory', label: 'INVENTORY', icon: Package, path: '/admin/inventory' },
    { id: 'orders', label: 'VAULT ORDERS', icon: ShoppingBag, path: '/admin/orders' },
    { id: 'customers', label: 'CLIENT DIRECTORY', icon: Users, path: '/admin/customers' },
    { id: 'settings', label: 'SETTINGS', icon: Settings, path: '/admin/settings' },
  ];

  const currentPath = location.pathname;
  const [settingsOpen, setSettingsOpen] = useState(currentPath.startsWith('/admin/settings'));

  useEffect(() => {
    if (currentPath.startsWith('/admin/settings')) {
      setSettingsOpen(true);
    }
  }, [currentPath]);

  const activeTabItem = navItems.find(item => item.path === currentPath) || navItems[0];

  const handleNavigate = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="admin-panel-root min-h-screen bg-[#F8FAFC] text-slate-800 font-open-sans flex flex-col md:flex-row overflow-x-hidden">
      
      {/* MOBILE TOP NAVBAR */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-2.5 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[4px] bg-gradient-to-br from-[#D4AF37] to-[#B48811] p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[3px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            </div>
          </div>
          <span className="font-open-sans text-xs font-semibold tracking-widest text-slate-900">DIAMORA ADMIN</span>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-[5px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE OVERLAY BACKDROP */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50 md:z-30
        w-56 bg-white border-r border-slate-200 p-3 flex flex-col justify-between shrink-0 shadow-xs transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[4px] bg-gradient-to-br from-[#D4AF37] to-[#B48811] p-0.5 shadow-xs flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[3px] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
              </div>
              <div>
                <h1 className="font-open-sans text-sm font-semibold tracking-[0.14em] text-slate-900 leading-tight uppercase">
                  DIAMORA
                </h1>
                <span className="text-[8.5px] tracking-widest text-amber-700 font-semibold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> ADMIN PORTAL
                </span>
              </div>
            </div>

            <button 
              onClick={() => setMobileSidebarOpen(false)} 
              className="md:hidden text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSettings = item.id === 'settings';
              const isSettingsActive = currentPath.startsWith('/admin/settings');

              // SETTINGS DROPDOWN
              if (isSettings) {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => setSettingsOpen(!settingsOpen)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-[11px] font-semibold tracking-wider transition-all uppercase ${
                        isSettingsActive 
                          ? 'bg-amber-50 text-amber-900 border border-amber-300/80 shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSettingsActive ? 'text-amber-700' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {settingsOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    </button>

                    {settingsOpen && (
                      <div className="pl-4 space-y-1 border-l border-amber-200 ml-3.5 my-1">
                        <button
                          onClick={() => handleNavigate('/admin/settings/about-us')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-[10.5px] font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                            currentPath === '/admin/settings/about-us' || currentPath === '/admin/pages/about-us'
                              ? 'bg-amber-100/90 text-amber-950 border border-amber-300/90'
                              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3 h-3 text-amber-700 shrink-0" />
                          <span className="truncate">ABOUT US</span>
                        </button>

                        <button
                          onClick={() => handleNavigate('/admin/settings/privacy-policy')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-[10.5px] font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                            currentPath === '/admin/settings/privacy-policy'
                              ? 'bg-amber-100/90 text-amber-950 border border-amber-300/90'
                              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3 h-3 text-amber-700 shrink-0" />
                          <span className="truncate">PRIVACY POLICY</span>
                        </button>

                        <button
                          onClick={() => handleNavigate('/admin/settings/terms-conditions')}
                          className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-[10.5px] font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                            currentPath === '/admin/settings/terms-conditions'
                              ? 'bg-amber-100/90 text-amber-950 border border-amber-300/90'
                              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3 h-3 text-amber-700 shrink-0" />
                          <span className="truncate">TERMS & CONDITIONS</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = currentPath === item.path || (item.path === '/admin' && (currentPath === '/admin' || currentPath === '/admin/'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-[11px] font-semibold tracking-wider transition-all uppercase ${
                    isActive 
                      ? 'bg-amber-50 text-amber-900 border border-amber-300/80 shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* View Storefront & Logout */}
        <div className="pt-2.5 border-t border-slate-200 space-y-1 mt-3">
          <button
            onClick={() => { setMobileSidebarOpen(false); navigate('/'); }}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-[11px] font-medium tracking-wider text-slate-800 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            <span>VIEW STOREFRONT</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-[4px] text-[11px] font-medium tracking-wider text-rose-700 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOG OUT</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-2.5 sm:p-3.5 lg:p-4 overflow-y-auto bg-[#F8FAFC]">
        
        {/* TOP BAR HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-slate-200">
          <div>
            <h2 className="font-open-sans text-base sm:text-lg font-semibold tracking-wide text-slate-900 uppercase">
              {currentPath === '/admin/settings/about-us' || currentPath === '/admin/pages/about-us' ? 'About Us Management' :
               currentPath === '/admin/settings/privacy-policy' ? 'Privacy Policy Management' :
               currentPath === '/admin/settings/terms-conditions' ? 'Terms & Conditions Management' :
               currentPath === '/admin/users' ? 'Admin Users' :
               currentPath === '/admin/categories' ? 'Category Management' :
               currentPath === '/admin/collections' ? 'Collection Management' :
               currentPath === '/admin/colors' ? 'Color Management' :
               currentPath === '/admin/purities' ? 'Purity Management' :
               currentPath === '/admin/diamond-qualities' ? 'Diamond Quality Management' :
               currentPath === '/admin/inventory' ? 'Inventory Management' :
               currentPath === '/admin/orders' ? 'Client Orders & Reservations' :
               currentPath === '/admin/customers' ? 'Client Directory' :
               'Dashboard'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Welcome back, <span className="text-amber-800 font-semibold">{user?.name || 'Administrator'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-[4px] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all shadow-2xs"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchProfile}
              className="p-1.5 bg-white border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-1.5 bg-white border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 hover:bg-slate-50 transition-colors relative shadow-2xs">
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-600" />
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
