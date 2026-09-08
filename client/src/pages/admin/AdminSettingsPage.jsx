import React from 'react';

export default function AdminSettingsPage() {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 sm:p-5 text-center shadow-2xs font-open-sans">
      <h3 className="font-open-sans text-lg font-semibold text-slate-900 uppercase mb-1.5">
        SYSTEM & SECURITY CONFIGURATION
      </h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Configure Firebase service parameters, JWT token expirations, CORS access controls, and administrative privileges.
      </p>
    </div>
  );
}
