import React from 'react';

export const LatticeBackground = ({ children, className = '' }) => {
  return (
    <div className={`relative min-h-screen bg-[#1b3033] overflow-hidden ${className}`}>
      {/* Background Lattice Grid */}
      <div 
        className="absolute inset-0 bg-lattice-grid bg-grid-md opacity-35 pointer-events-none"
        style={{
          maskImage: 'radial-gradient(ellipse at 50% 20%, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 20%, black 40%, transparent 80%)'
        }}
      />

      {/* Subtle Glows */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#DFD6AE]/10 via-[#274245]/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#DFD6AE]/5 blur-[150px] pointer-events-none" />

      {/* Grid crosshair accents */}
      <div className="absolute top-12 left-12 text-[#3b6064] font-mono text-xs select-none pointer-events-none">
        [VF-GRID // 001]
      </div>
      <div className="absolute top-12 right-12 text-[#3b6064] font-mono text-xs select-none pointer-events-none">
        LAT: 28.6139° N
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

