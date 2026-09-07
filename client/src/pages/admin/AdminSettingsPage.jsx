import React from 'react';

export default function AdminSettingsPage() {
  return (
    <div className="bg-[#12141A] border border-white/10 rounded-lg p-8 text-center shadow-xl">
      <h3 className="font-cinzel text-xl font-bold text-[#D4AF37] uppercase mb-2">
        SYSTEM & SECURITY CONFIGURATION
      </h3>
      <p className="text-xs text-gray-400 max-w-md mx-auto">
        Configure Firebase service parameters, JWT token expirations, CORS access controls, and administrative privileges.
      </p>
    </div>
  );
}
