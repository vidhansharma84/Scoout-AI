import Image from "next/image";

export default function Logo({
  className = "w-8 h-8",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/logo.jpg"
      alt="Scoout AI"
      width={200}
      height={200}
      priority
      className={`${className} object-contain`}
    />
  );
}
