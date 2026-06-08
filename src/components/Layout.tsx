import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] relative">
      {/* Content */}
      <div className="flex flex-col flex-1 pb-24">
        {children}
      </div>
    </div>
  );
}
