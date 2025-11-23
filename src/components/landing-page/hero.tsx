import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="container flex min-h-[calc(100vh-3.5rem)] max-w-screen-2xl flex-col items-center justify-center space-y-8 py-24 px-4 text-center md:py-32">
      <div className="space-y-4">
        <h1 className="bg-gradient-to-br from-foreground from-30% via-foreground/90 to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
          Run Your Business
          <br />
          Smarter with SaarthiFlow
        </h1>
        <p className="text-muted-foreground sm:text-lg max-w-3xl mx-auto">
          Manage bookings, inventory, memberships, and more — all in one simple
          platform. Built to save your time and grow your revenue.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/demo">
          <Button size="lg" className="cursor-pointer">
            Book a Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden border shadow-lg mt-12">
        <Image
          src="/dashboard.png" // Replace with your actual image path
          alt="SaarthiFlow Dashboard Preview"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
    </section>
  );
}
