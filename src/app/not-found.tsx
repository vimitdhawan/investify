"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">404 - Page Not Found</h1>
      <p className="text-muted-foreground text-lg">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
