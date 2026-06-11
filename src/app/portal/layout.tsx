// Bare layout for the entire /portal/* tree. The (authed) sub-group adds
// the sidebar; /portal/login renders standalone.

export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
