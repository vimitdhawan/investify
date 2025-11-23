import {
  LayoutDashboard,
  FileText,
  Calendar,
  Settings,
  Tag,
  Award,
  Package,
  UserRound,
  Building,
  List,
} from "lucide-react";

type SideMenuItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  description: string;
};

export const data: SideMenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your business performance",
  },
  {
    title: "Fund Houses",
    url: "/dashboard/fund-houses",
    icon: Building,
    description: "View performance by fund house",
  },
  {
    title: "Schemes",
    url: "/dashboard/schemes",
    icon: List,
    description: "View performance by scheme",
  },
  {
    title: "Services",
    url: "/services",
    icon: FileText,
    description: "Manage the services you offer",
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: Calendar,
    description: "View and manage customer appointments",
  },
  {
    title: "Discounts",
    url: "/discounts",
    icon: Tag,
    description: "Create and manage promotional discounts",
  },
  {
    title: "Membership",
    url: "/membership",
    icon: Award,
    description: "Manage customer loyalty programs and memberships",
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
    description: "Track and manage your product stock",
  },
  {
    title: "Employees",
    url: "/employees",
    icon: UserRound,
    description: "Manage your staff and their roles",
  },
  {
    title: "Settings",
    url: "/setting",
    icon: Settings,
    description: "Configure your business preferences",
  },
];
