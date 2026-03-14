import type React from 'react';

import Footer from '@/features/landing-page/components/footer';
import Navbar from '@/features/landing-page/components/navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative min-h-screen">
        <div className="relative z-10">
          <Navbar />
          {children}
          <Footer />
        </div>
      </div>
    </>
  );
}
