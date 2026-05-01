export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Scoout AI"
    >
      <defs>
        <linearGradient id="scoutGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF6A2C" />
          <stop offset="1" stopColor="#FFD166" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#scoutGrad)" />
      <circle cx="16" cy="16" r="6" fill="#0a0a0b" />
      <circle cx="16" cy="16" r="2.4" fill="#fff" />
      <circle cx="22.5" cy="9.5" r="1.6" fill="#fff" />
    </svg>
  );
}
