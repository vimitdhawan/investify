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
  Banknote
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
    url: "/fund-houses",
    icon: Building,
    description: "View performance by fund house",
  },
  {
    title: "Schemes",
    url: "/schemes",
    icon: List,
    description: "View performance by scheme",
  },
  {
    title: "Settings",
    url: "/setting",
    icon: Settings,
    description: "Configure your business preferences",
  },
];
