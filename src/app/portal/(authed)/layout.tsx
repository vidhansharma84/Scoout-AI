import Sidebar from "@/components/portal/Sidebar";

export default function AuthedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">{children}</main>
    </div>
  );
}
