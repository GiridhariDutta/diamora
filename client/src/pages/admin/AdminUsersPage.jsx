import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserPlus, 
  Pencil, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Mail, 
  User as UserIcon,
  RefreshCw,
  Clock
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';

// Dark Gold styled SweetAlert2 configuration
const darkSwal = Swal.mixin({
  background: '#0C0D10',
  color: '#F5F5F0',
  confirmButtonColor: '#E0B094',
  cancelButtonColor: '#374151',
  customClass: {
    popup: 'border border-white/15 rounded-lg font-poppins shadow-2xl',
    confirmButton: 'text-[#0C0D10] font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-md',
    cancelButton: 'text-gray-300 font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-md'
  }
});

// Timezone configured from client .env (defaults to Asia/Kolkata IST)
const APP_TIMEZONE = import.meta.env.VITE_TIMEZONE || 'Asia/Kolkata';

/**
 * Format ISO or GMT timestamp string to IST (Asia/Kolkata) timezone format
 */
const formatTimestampToIST = (dateString) => {
  if (!dateString || dateString === 'Never' || dateString === 'Recent' || dateString === 'Active Session') {
    return dateString || 'Recent';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('en-IN', {
      timeZone: APP_TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (err) {
    return dateString;
  }
};

export default function AdminUsersPage() {
  const context = useOutletContext() || {};
  const contextAdminUsers = (context.allUsers || []).filter(u => u.role === 'admin');

  const [apiAdminUsers, setApiAdminUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);

  // Add Admin Form State
  const [addFormData, setAddFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Created Credentials Display State
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch admin users from backend API
  const fetchAdminUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/admin-users');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setApiAdminUsers(res.data.data);
      }
    } catch (err) {
      console.warn('API fetch admin users warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Get active session user if available
  const storedUserJson = localStorage.getItem('user');
  let loggedInUser = context.user;
  if (!loggedInUser && storedUserJson) {
    try { loggedInUser = JSON.parse(storedUserJson); } catch (e) {}
  }

  // Display list prioritizing API results, falling back to context admin list or active session admin user
  let displayAdminUsers = [];
  if (apiAdminUsers.length > 0) {
    displayAdminUsers = apiAdminUsers;
  } else if (contextAdminUsers.length > 0) {
    displayAdminUsers = contextAdminUsers;
  } else if (loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'ADMIN')) {
    displayAdminUsers = [{
      uid: loggedInUser.uid || 'admin-1',
      name: loggedInUser.name || 'Goutam Jana',
      email: loggedInUser.email || 'janagoutam147@gmail.com',
      role: 'admin',
      lastSignInTime: 'Active Session',
      creationTime: loggedInUser.createdAt || 'Sep 7, 2026'
    }];
  }

  // Handle Add Admin Submit
  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/api/auth/admin-users', addFormData);
      
      if (res.data?.success) {
        const { user: newAdmin, generatedPassword } = res.data.data;
        
        // Show created credentials card
        setCreatedCredentials({
          email: newAdmin.email,
          password: generatedPassword,
          name: newAdmin.name
        });
        
        setIsAddModalOpen(false);
        setAddFormData({ name: '', email: '' });
        fetchAdminUsers();

        darkSwal.fire({
          icon: 'success',
          title: 'Admin Created Successfully!',
          text: `8-digit random password generated for ${newAdmin.name}`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create admin user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Admin Submit
  const handleEditAdminSubmit = async (e) => {
    e.preventDefault();
    if (!editAdmin) return;
    setSubmitting(true);

    try {
      const res = await api.put(`/api/auth/admin-users/${editAdmin.uid || editAdmin.id}`, {
        name: editAdmin.name,
        email: editAdmin.email
      });

      if (res.data?.success) {
        setIsEditModalOpen(false);
        setEditAdmin(null);
        fetchAdminUsers();

        darkSwal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Admin details updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      darkSwal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.message || 'Could not update admin user.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Admin User with SweetAlert2 Confirmation
  const handleDeleteAdmin = (admin) => {
    darkSwal.fire({
      title: 'Delete Admin User?',
      text: `Are you sure you want to remove ${admin.name} (${admin.email}) from Administrator accounts?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Admin',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const targetId = admin.uid || admin.id;
          const res = await api.delete(`/api/auth/admin-users/${targetId}`);
          if (res.data?.success) {
            setApiAdminUsers(prev => prev.filter(u => (u.uid || u.id) !== targetId));
            darkSwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Admin account has been removed.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          darkSwal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: err.message || 'Failed to delete admin user.'
          });
        }
      }
    });
  };

  // Copy Credentials to Clipboard
  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const textToCopy = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    darkSwal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Credentials Copied to Clipboard!',
      showConfirmButton: false,
      timer: 2000
    });
  };

  return (
    <div className="space-y-6 font-poppins">

      {/* GENERATED CREDENTIALS CARD ALERT (SHOWN AFTER ADDING USER) */}
      {createdCredentials && (
        <div className="bg-[#0C0D10] border border-[#E0B094]/40 rounded-lg p-5 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 right-0 p-3">
            <button
              onClick={() => setCreatedCredentials(null)}
              className="text-gray-400 hover:text-[#E0B094]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-[#E0B094]/20 text-[#E0B094] border border-[#E0B094]/40 rounded text-[9px] font-extrabold uppercase mb-2">
                NEW ADMIN CREDENTIALS GENERATED
              </span>
              <h4 className="text-sm font-semibold text-[#F5F5F0]">
                Admin Account for <span className="text-[#E0B094]">{createdCredentials.name}</span>
              </h4>
              <div className="mt-2 text-xs text-gray-300 font-mono space-y-1 bg-black/50 p-3 rounded border border-white/10 inline-block">
                <p><span className="text-gray-500">Email:</span> {createdCredentials.email}</p>
                <p><span className="text-gray-500">Random 8-Digit Password:</span> <span className="text-[#E0B094] font-bold">{createdCredentials.password}</span></p>
              </div>
            </div>

            {/* COPY BUTTON */}
            <button
              onClick={handleCopyCredentials}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E0B094] hover:bg-[#d19c7f] text-[#0C0D10] font-semibold text-xs tracking-wider rounded-md uppercase transition-all shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'COPIED!' : 'COPY CREDENTIALS'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ADMIN USERS DIRECTORY TABLE & TOP ACTION BAR */}
      <div className="bg-[#12141A] border border-white/10 rounded-lg p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
          <p className="text-xs text-gray-400">
            Real-time list of accounts with <span className="text-[#E0B094] font-semibold">ADMIN</span> privileges
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminUsers}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-md text-gray-300 hover:text-[#E0B094] transition-colors"
              title="Refresh List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E0B094]' : ''}`} />
            </button>

            <button
              onClick={() => { setErrorMessage(''); setIsAddModalOpen(true); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#E0B094] to-[#D4AF37] hover:from-[#d19c7f] hover:to-[#c29f2e] text-[#0C0D10] font-semibold text-xs tracking-wider rounded-md uppercase shadow-lg shadow-[#E0B094]/15 transition-all shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Admin User</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-bold tracking-widest text-[#E0B094] uppercase">
                <th className="py-3 px-4">Admin Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role Badge</th>
                <th className="py-3 px-4">Last Signed In</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {displayAdminUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 text-xs">
                    {loading ? 'Loading Admin Users from Firebase...' : 'No admin users found.'}
                  </td>
                </tr>
              ) : (
                displayAdminUsers.map((admin) => (
                  <tr key={admin.uid || admin.id} className="bg-[#E0B094]/5 hover:bg-[#E0B094]/10 transition-colors">
                    
                    {/* Admin Name */}
                    <td className="py-3.5 px-4 font-semibold text-[#F5F5F0] flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#E0B094] to-[#D4AF37] text-[#0C0D10] font-bold flex items-center justify-center text-xs shadow">
                        {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-[#F5F5F0]">{admin.name || 'Admin'}</p>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-gray-300 font-mono text-xs">{admin.email}</td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#E0B094]/20 text-[#E0B094] border border-[#E0B094]/40 text-[9px] font-extrabold uppercase inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#E0B094]" />
                        {admin.role || 'ADMIN'}
                      </span>
                    </td>

                    {/* Last Signed In Timestamp from Firebase Auth (IST Timezone) */}
                    <td className="py-3.5 px-4 text-gray-300">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-[#E0B094]" />
                        <span>{formatTimestampToIST(admin.lastSignInTime)}</span>
                      </div>
                    </td>

                    {/* Actions Column: Edit and Delete Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* EDIT BUTTON */}
                        <button
                          onClick={() => { setEditAdmin(admin); setIsEditModalOpen(true); }}
                          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#E0B094]/50 text-gray-300 hover:text-[#E0B094] rounded-md transition-all"
                          title="Edit Admin User"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-md transition-all"
                          title="Delete Admin User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD ADMIN USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-poppins">
          <div className="relative w-full max-w-md bg-[#0C0D10] border border-white/15 rounded-lg shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#E0B094] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="font-cinzel text-lg font-bold text-[#D4AF37] uppercase tracking-wider block">
                ADD NEW ADMIN USER
              </span>
              <p className="text-xs text-gray-400 mt-1">
                Creates a new user with <span className="text-[#E0B094]">ADMIN</span> role. An 8-digit random password will be auto-generated.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-md">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium tracking-widest text-gray-300 uppercase mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Vance"
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded-md text-xs text-[#F5F5F0] placeholder-gray-500 focus:outline-none focus:border-[#E0B094]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium tracking-widest text-gray-300 uppercase mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded-md text-xs text-[#F5F5F0] placeholder-gray-500 focus:outline-none focus:border-[#E0B094]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-md text-xs text-gray-300 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#E0B094] to-[#D4AF37] text-[#0C0D10] font-semibold text-xs tracking-wider rounded-md uppercase disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ADMIN USER MODAL */}
      {isEditModalOpen && editAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-poppins">
          <div className="relative w-full max-w-md bg-[#0C0D10] border border-white/15 rounded-lg shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#E0B094] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="font-cinzel text-lg font-bold text-[#D4AF37] uppercase tracking-wider block">
                EDIT ADMIN USER
              </span>
              <p className="text-xs text-gray-400 mt-1">
                Update account information for <span className="text-[#E0B094]">{editAdmin.name}</span>
              </p>
            </div>

            <form onSubmit={handleEditAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium tracking-widest text-gray-300 uppercase mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editAdmin.name}
                  onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-md text-xs text-[#F5F5F0] focus:outline-none focus:border-[#E0B094]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium tracking-widest text-gray-300 uppercase mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editAdmin.email}
                  onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-md text-xs text-[#F5F5F0] focus:outline-none focus:border-[#E0B094]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-white/15 rounded-md text-xs text-gray-300 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#E0B094] to-[#D4AF37] text-[#0C0D10] font-semibold text-xs rounded-md uppercase disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
