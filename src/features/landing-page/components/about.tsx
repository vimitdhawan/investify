import Image from 'next/image';

import { CheckCircle } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="border-t px-4">
      <div className="container max-w-screen-2xl flex flex-col items-center gap-8 py-24 text-center md:py-32">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
          Introduction to SaarthiFlow
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-5xl mx-auto">
          <div className="md:w-1/2 w-full relative aspect-video">
            <Image
              src="/placeholder-about.png" // Replace with your actual image path
              alt="About SaarthiFlow"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2 text-left md:text-lg space-y-4">
            <p className="text-muted-foreground">
              SaarthiFlow empowers businesses by simplifying bookings and streamlining operations.
              Our mission is to eliminate operational complexities, allowing businesses to focus on
              growth.
            </p>
            <p className="text-muted-foreground">
              With our intuitive tools and automation, we help you:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Save time on daily tasks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Boost efficiency across your operations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Enhance customer experiences</span>
              </li>
            </ul>
            <p className="text-muted-foreground">
              Making every business process seamless and driving your growth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
