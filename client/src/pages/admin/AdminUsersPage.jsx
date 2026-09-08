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

// Executive Light styled SweetAlert2 configuration with ~4-5px border radius
const lightSwal = Swal.mixin({
  background: '#FFFFFF',
  color: '#0F172A',
  confirmButtonColor: '#D4AF37',
  cancelButtonColor: '#94A3B8',
  customClass: {
    popup: 'border border-slate-200 rounded-[4px] font-open-sans shadow-xl',
    confirmButton: 'text-slate-900 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]',
    cancelButton: 'text-slate-700 font-semibold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-[4px]'
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

  // Display list prioritizing API results, falling back to context/session only when not loading
  let displayAdminUsers = [];
  if (apiAdminUsers.length > 0) {
    displayAdminUsers = apiAdminUsers;
  } else if (!loading && contextAdminUsers.length > 0) {
    displayAdminUsers = contextAdminUsers;
  } else if (!loading && loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'ADMIN')) {
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

        lightSwal.fire({
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

        lightSwal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Admin details updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      lightSwal.fire({
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
    lightSwal.fire({
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
            lightSwal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Admin account has been removed.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          lightSwal.fire({
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

    lightSwal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Credentials Copied to Clipboard!',
      showConfirmButton: false,
      timer: 2000
    });
  };

  return (
    <div className="space-y-3 font-open-sans">

      {/* GENERATED CREDENTIALS CARD ALERT (SHOWN AFTER ADDING USER) */}
      {createdCredentials && (
        <div className="bg-amber-50/80 border border-amber-300/80 rounded-[4px] p-3 shadow-2xs relative overflow-hidden animate-fadeIn text-slate-800">
          <div className="absolute top-0 right-0 p-2">
            <button
              onClick={() => setCreatedCredentials(null)}
              className="text-slate-400 hover:text-amber-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="inline-block px-2 py-0.5 bg-amber-200/80 text-amber-900 border border-amber-300 rounded-[3px] text-[8.5px] font-semibold uppercase mb-1">
                NEW ADMIN CREDENTIALS GENERATED
              </span>
              <h4 className="text-xs font-semibold text-slate-900">
                Admin Account for <span className="text-amber-800">{createdCredentials.name}</span>
              </h4>
              <div className="mt-1 text-[11px] text-slate-700 font-mono space-y-0.5 bg-white p-2 rounded-[3px] border border-amber-200 inline-block shadow-2xs">
                <p><span className="text-slate-500">Email:</span> {createdCredentials.email}</p>
                <p><span className="text-slate-500">Random 8-Digit Password:</span> <span className="text-amber-800 font-semibold">{createdCredentials.password}</span></p>
              </div>
            </div>

            {/* COPY BUTTON */}
            <button
              onClick={handleCopyCredentials}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 font-semibold text-[11px] tracking-wider rounded-[4px] uppercase shadow-2xs transition-all shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED!' : 'COPY CREDENTIALS'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ADMIN USERS DIRECTORY TABLE & TOP ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-[4px] p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-slate-200">
          <p className="text-[11px] text-slate-500">
            Real-time list of accounts with <span className="text-amber-800 font-semibold">ADMIN</span> privileges
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminUsers}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-[4px] text-slate-700 hover:text-amber-800 transition-colors shadow-2xs"
              title="Refresh List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
            </button>

            <button
              onClick={() => { setErrorMessage(''); setIsAddModalOpen(true); }}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B48811] hover:from-[#c5a12d] hover:to-[#a27a0e] text-slate-950 font-semibold text-[11px] tracking-wider rounded-[4px] uppercase shadow-2xs transition-all shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Admin User</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-[9.5px] font-semibold tracking-widest text-amber-900 uppercase bg-slate-50">
                <th className="py-2 px-3">Admin Name</th>
                <th className="py-2 px-3">Email Address</th>
                <th className="py-2 px-3">Role Badge</th>
                <th className="py-2 px-3">Last Signed In</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <tr key={`skeleton-${n}`} className="animate-pulse bg-white">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6.5 h-6.5 rounded-[4px] bg-slate-200" />
                        <div className="h-3 w-24 bg-slate-200 rounded-[3px]" />
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 w-36 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-4 w-16 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3">
                      <div className="h-3 w-28 bg-slate-200 rounded-[3px]" />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-6 h-6 bg-slate-200 rounded-[4px]" />
                        <div className="w-6 h-6 bg-slate-200 rounded-[4px]" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : displayAdminUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-5 text-center text-slate-500 text-xs">
                    No admin users found.
                  </td>
                </tr>
              ) : (
                displayAdminUsers.map((admin) => (
                  <tr key={admin.uid || admin.id} className="bg-white hover:bg-amber-50/40 transition-colors">
                    
                    {/* Admin Name */}
                    <td className="py-2 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-6.5 h-6.5 rounded-[4px] bg-gradient-to-br from-[#D4AF37] to-[#B48811] text-slate-950 font-semibold flex items-center justify-center text-[11px] shadow-2xs">
                        {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-900">{admin.name || 'Admin'}</p>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{admin.email}</td>

                    {/* Role Badge */}
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-[3px] bg-amber-100 text-amber-900 border border-amber-300/80 text-[8.5px] font-semibold uppercase inline-flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-amber-700" />
                        {admin.role || 'ADMIN'}
                      </span>
                    </td>

                    {/* Last Signed In Timestamp from Firebase Auth (IST Timezone) */}
                    <td className="py-2 px-3 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>{formatTimestampToIST(admin.lastSignInTime)}</span>
                      </div>
                    </td>

                    {/* Actions Column: Edit and Delete Buttons */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* EDIT BUTTON */}
                        <button
                          onClick={() => { setEditAdmin(admin); setIsEditModalOpen(true); }}
                          className="p-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-800 rounded-[4px] transition-all"
                          title="Edit Admin User"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded-[4px] transition-all"
                          title="Delete Admin User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-open-sans">
          <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5 sm:p-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="font-open-sans text-base font-semibold text-slate-950 uppercase tracking-wide block">
                ADD NEW ADMIN USER
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Creates a new user with <span className="text-amber-900 font-semibold">ADMIN</span> role. An 8-digit random password will be auto-generated.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-[4px] font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Full Name <span className="text-rose-600 font-semibold">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Vance"
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 placeholder-slate-500 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Email Address <span className="text-rose-600 font-semibold">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 placeholder-slate-500 focus:outline-none focus:border-amber-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded-[4px] text-xs text-slate-900 uppercase tracking-wider font-semibold shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B48811] text-slate-950 font-semibold text-xs tracking-wider rounded-[4px] uppercase disabled:opacity-50 shadow-2xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-open-sans">
          <div className="relative w-full max-w-md bg-white border border-slate-300 rounded-[4px] shadow-2xl p-5 sm:p-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="font-open-sans text-base font-semibold text-slate-950 uppercase tracking-wide block">
                EDIT ADMIN USER
              </span>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                Update account information for <span className="text-amber-900 font-semibold">{editAdmin.name}</span>
              </p>
            </div>

            <form onSubmit={handleEditAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Full Name <span className="text-rose-600 font-semibold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editAdmin.name}
                  onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-slate-900 uppercase mb-1.5">
                  Email Address <span className="text-rose-600 font-semibold">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editAdmin.email}
                  onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-slate-400 rounded-[4px] text-xs font-semibold text-slate-950 focus:outline-none focus:border-amber-600 shadow-2xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded-[4px] text-xs text-slate-900 uppercase tracking-wider font-semibold shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B48811] text-slate-950 font-semibold text-xs tracking-wider rounded-[4px] uppercase disabled:opacity-50 shadow-2xs"
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
