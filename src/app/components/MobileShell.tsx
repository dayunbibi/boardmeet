import type { ReactNode } from "react";

type MobileShellProps = {
  children: ReactNode;
};

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <main className="min-h-screen bg-[#F5F1FF]">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-xl">
        {children}
      </div>
    </main>
  );
}