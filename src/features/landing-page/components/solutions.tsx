import {
  CalendarCheck,
  Layers3,
  PackageSearch,
  BarChart3,
  Users,
  LineChart,
} from "lucide-react";

const features = [
  {
    name: "Smart Booking Management",
    description:
      "Easily manage appointments and walk-ins, reducing no-shows and improving scheduling efficiency.",
    icon: CalendarCheck,
  },
  {
    name: "Service & Staff Management",
    description:
      "Assign staff, set availability, and organize services to deliver a consistent customer experience.",
    icon: Layers3,
  },
  {
    name: "Inventory Control",
    description:
      "Track stock in real-time, get alerts for low inventory, and simplify reordering.",
    icon: PackageSearch,
  },
  {
    name: "Business Analytics",
    description:
      "Understand performance with daily, weekly, and monthly insights on revenue, bookings, and usage.",
    icon: BarChart3,
  },
  {
    name: "Membership & Loyalty",
    description:
      "Grow repeat business with personalized membership plans and rewards.",
    icon: Users,
  },
  {
    name: "LINE Booking Integration",
    description:
      "Let customers book directly through LINE. Increase trust and convenience effortlessly.",
    icon: LineChart,
  },
];

export default function BusinessSolutions() {
  return (
    <section
      id="solutions"
      className="container max-w-screen-2xl py-24 md:py-32 px-4"
    >
      <div className="mx-auto max-w-screen-xl text-center space-y-4">
        <h2 className="font-bold text-3xl leading-tight sm:text-4xl md:text-5xl">
          Solutions to Grow Your Business with SaarthiFlow
        </h2>
        <p className="text-muted-foreground sm:text-lg max-w-3xl mx-auto">
          From customer bookings to inventory and insights — SaarthiFlow gives
          you the tools to save time and increase revenue.
        </p>
      </div>

      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 py-12">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="flex flex-col items-start gap-4 rounded-lg border bg-background p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg sm:text-xl">
                {feature.name}
              </h3>
            </div>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
