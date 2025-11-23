import type React from "react";
import Navbar from "@/components/landing-page/navbar";
import Footer from "@/components/landing-page/footer";

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
