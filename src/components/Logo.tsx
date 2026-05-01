export default function Logo({
  className = "w-8 h-8",
  bgEye = "#0a0a0b",
}: {
  className?: string;
  bgEye?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Scoout AI"
    >
      <defs>
        <mask id="scoout-s-cuts">
          <rect width="200" height="200" fill="white" />
          <rect
            x="100"
            y="92"
            width="130"
            height="16"
            transform="rotate(-18 100 100)"
            fill="black"
          />
          <rect
            x="-30"
            y="92"
            width="130"
            height="16"
            transform="rotate(-18 100 100)"
            fill="black"
          />
          <circle cx="100" cy="100" r="32" fill="black" />
        </mask>
      </defs>
      <circle cx="100" cy="100" r="84" fill="#FFCC1F" mask="url(#scoout-s-cuts)" />
      <circle cx="100" cy="100" r="20" fill="#FFCC1F" />
      <circle cx="108" cy="92" r="13" fill={bgEye} />
    </svg>
  );
}
