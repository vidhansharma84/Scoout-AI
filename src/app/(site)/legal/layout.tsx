export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-32 pb-24">
      <article className="prose-scoout">{children}</article>
    </div>
  );
}
