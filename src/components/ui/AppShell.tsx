export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-bg">
      <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col bg-bg">
        {children}
      </div>
    </div>
  );
}
