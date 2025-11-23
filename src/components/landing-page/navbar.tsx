"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Effect to lock body scroll when the menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 px-4 md:px-8 border-b border-gray-100">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          {/* Left: Logo and Book Demo */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 font-bold">
              <span>SaarthiFlow</span>
            </Link>
            {/* Center: Nav Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/#solutions" className="hover:text-primary">
                Solutions
              </Link>
              <Link href="/#about" className="hover:text-primary">
                About Us
              </Link>
              <Button asChild>
                <Link
                  href="/demo"
                  className="text-sm font-medium hover:text-primary"
                >
                  Book Demo
                </Link>
              </Button>
            </nav>
          </div>

          {/* Right: Auth Buttons and Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Signup</Link>
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col items-center justify-center h-full text-2xl font-medium space-y-8">
          <Link href="/login" onClick={handleLinkClick}>
            Login
          </Link>
          <Link href="/signup" onClick={handleLinkClick}>
            Signup
          </Link>
          <Link href="/#solutions" onClick={handleLinkClick}>
            Solutions
          </Link>
          <Link href="/#about" onClick={handleLinkClick}>
            About Us
          </Link>
          <Link href="/demo" onClick={handleLinkClick}>
            Book Demo
          </Link>
        </nav>
      </div>
    </>
  );
}
