export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-100 via-zinc-50 to-white text-zinc-900">
      {/* Subtle decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-zinc-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-zinc-300/30 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
