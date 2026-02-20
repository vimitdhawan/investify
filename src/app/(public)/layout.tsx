import type React from 'react';
import Navbar from '@/features/landing-page/components/navbar';
import Footer from '@/features/landing-page/components/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
