import React from 'react';

export default function AdminOrdersPage() {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 sm:p-5 text-center shadow-2xs font-open-sans">
      <h3 className="font-open-sans text-lg font-semibold text-slate-900 uppercase mb-1.5">
        VAULT ORDERS & APPOINTMENT RESERVATIONS
      </h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        Track client ticket appointments, custom jewelry requests, dispatch statuses, and invoice verifications.
      </p>
    </div>
  );
}
