// Flat neo-brutalist face SVGs for confidence levels
export function FaceLost({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" fill="#ffd5d5" stroke="#282315" strokeWidth="3"/>
      {/* sweat drop */}
      <ellipse cx="38" cy="12" rx="3" ry="4.5" fill="#8fd4ff" stroke="#282315" strokeWidth="2"/>
      {/* eyes - X shape */}
      <line x1="16" y1="18" x2="20" y2="22" stroke="#282315" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="20" y1="18" x2="16" y2="22" stroke="#282315" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="28" y1="18" x2="32" y2="22" stroke="#282315" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="32" y1="18" x2="28" y2="22" stroke="#282315" strokeWidth="2.5" strokeLinecap="round"/>
      {/* wavy mouth */}
      <path d="M16 33 Q20 29 24 33 Q28 37 32 33" stroke="#282315" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function FaceNeutral({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" fill="#fff3c7" stroke="#282315" strokeWidth="3"/>
      {/* thinking brow - one raised */}
      <path d="M14 17 Q18 14 20 17" stroke="#282315" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M28 15 Q32 17 34 17" stroke="#282315" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* eyes */}
      <ellipse cx="18" cy="21" rx="2.5" ry="3" fill="#282315"/>
      <ellipse cx="30" cy="21" rx="2.5" ry="3" fill="#282315"/>
      {/* flat mouth */}
      <line x1="17" y1="32" x2="31" y2="32" stroke="#282315" strokeWidth="2.5" strokeLinecap="round"/>
      {/* thought bubble */}
      <circle cx="36" cy="10" r="2" fill="#fff3c7" stroke="#282315" strokeWidth="1.5"/>
      <circle cx="40" cy="7" r="1.2" fill="#fff3c7" stroke="#282315" strokeWidth="1.5"/>
    </svg>
  );
}

export function FaceConfident({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="21" fill="#d4f7e7" stroke="#282315" strokeWidth="3"/>
      {/* sunglasses */}
      <rect x="11" y="17" width="11" height="8" rx="3" fill="#282315"/>
      <rect x="26" y="17" width="11" height="8" rx="3" fill="#282315"/>
      <line x1="22" y1="21" x2="26" y2="21" stroke="#282315" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="21" x2="11" y2="21" stroke="#282315" strokeWidth="2" strokeLinecap="round"/>
      <line x1="37" y1="21" x2="40" y2="21" stroke="#282315" strokeWidth="2" strokeLinecap="round"/>
      {/* shine on glasses */}
      <line x1="14" y1="19" x2="17" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="29" y1="19" x2="32" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      {/* big smile */}
      <path d="M15 31 Q24 39 33 31" stroke="#282315" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
