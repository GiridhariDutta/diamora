import React from 'react';

export default function AdminInventoryPage() {
  return (
    <div className="bg-[#12141A] border border-white/10 rounded-lg p-8 text-center shadow-xl">
      <h3 className="font-cinzel text-xl font-bold text-[#D4AF37] uppercase mb-2">
        JEWELRY CATALOG & 3D MODELS INVENTORY
      </h3>
      <p className="text-xs text-gray-400 max-w-md mx-auto">
        Manage 3D GLTF models, ring ornaments, gem specs, and live inventory. Connected to Firestore database.
      </p>
    </div>
  );
}
