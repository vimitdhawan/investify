import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t px-4">
      <div className="container max-w-screen-2xl flex flex-col gap-10 py-10 md:flex-row md:justify-between md:py-14">
        <div className="flex-1 space-y-3">
          <h2 className="text-lg font-semibold">SaarthiFlow</h2>
          <p className="text-sm text-muted-foreground">
            Streamlining operations for growing businesses.
          </p>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-10">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/bookings"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/inventory"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Inventory
                </Link>
              </li>
              <li>
                <Link
                  href="/memberships"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Memberships
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Connect</h3>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/saarthiflow"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://twitter.com/saarthiflow"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://linkedin.com/company/saarthiflow"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t py-5 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SaarthiFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
