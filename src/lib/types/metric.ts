import { chartData } from "@/lib/types/mock-data";

// Enum for metric types
export enum MetricType {
  Revenue = "Revenue",
  Customer = "Customer",
  Membership = "Membership",
  NewCustomers = "NewCustomers",
  Booking = "Booking",
}

// Define the structure of a single metric
export interface SectionMetric {
  title: string;
  value: number; // Value for the current month (e.g., April 2025)
}

export interface AreaMetric {
  type: MetricType;
  title: string;
  description: string;
  data: AreaMetricDataPoint[];
}

export interface AreaMetricDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface ServiceMetric {
  service: string;
  data: ServiceMetricDataPoint[];
}

export interface ServiceMetricDataPoint {
  date: string;
  bookings: number;
  revenue: number;
}

// lib/types.ts
export interface ServiceAggregate {
  name: string;
  bookings: number;
  revenue: number;
}

export const mockAreaMetrics: AreaMetric[] = [
  {
    type: MetricType.Revenue,
    title: "Revenue",
    description: "Total Revenue",
    data: chartData,
  },
  {
    type: MetricType.Customer,
    title: "Customers",
    description: "Total Customers",
    data: chartData,
  },
  {
    type: MetricType.Booking,
    title: "Booking",
    description: "Total Booking",
    data: chartData,
  },
];

// Mock data using the new structure
export const mockMetrics = [
  {
    type: MetricType.Revenue,
    title: "Revenue",
    currentMonthValue: 7000, // April 2025
    lastMonthValue: 14000, // March 2025
  },
  {
    type: MetricType.Customer,
    title: "Customers",
    currentMonthValue: 130,
    lastMonthValue: 320,
  },
  {
    type: MetricType.Membership,
    title: "Memberships",
    currentMonthValue: 220,
    lastMonthValue: 200,
  },
  {
    type: MetricType.NewCustomers,
    title: "New Customers",
    currentMonthValue: 45,
    lastMonthValue: 50,
  },
];
