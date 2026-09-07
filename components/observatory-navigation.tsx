"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Close,
  Code2,
  Globe2,
  Images,
  Menu,
  Orbit,
  Satellite,
  ScanLine,
  Star,
} from "@/components/icons";
import { MotionControl } from "@/components/space-background";

export const navigation = [
  { value: "solar-system", label: "Solar system", icon: Orbit },
  { value: "sky-explorer", label: "Sky chart", icon: Star },
  { value: "exoplanets", label: "Exoplanets", icon: Globe2 },
  { value: "asteroids", label: "Asteroids", icon: ScanLine },
  { value: "spacecraft", label: "Spacecraft", icon: Satellite },
  { value: "gallery", label: "Images", icon: Images },
  { value: "api", label: "API playground", icon: Code2 },
  { value: "guide", label: "About & guide", icon: BookOpen },
];

export default function ObservatoryNavigation({
  view,
  onNavigate,
  moving,
  onToggleMotion,
}: {
  view: string;
  onNavigate: (view: string) => void;
  moving: boolean;
  onToggleMotion: () => void;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="bao-sidebar">
      <SidebarHeader className="bao-sidebar-header">
        <a href="/" className="sidebar-brand" aria-label="BAO homepage">
          <strong>BAO</strong>
          <span>Barycentric Astronomical Observatory</span>
        </a>
        <button
          type="button"
          className="navigation-close"
          aria-label="Close navigation"
          onClick={() => setOpenMobile(false)}
        >
          <Close size={20} />
        </button>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Observatory tools" className="bao-navigation">
          <SidebarMenu>
            {navigation.map(({ value, label, icon: Icon }) => (
              <SidebarMenuItem
                key={value}
                className={value === "api" ? "navigation-resources" : undefined}
              >
                <SidebarMenuButton
                  asChild
                  isActive={view === value}
                  className="bao-nav-link"
                >
                  <a
                    href={`#${value}`}
                    aria-current={view === value ? "page" : undefined}
                    onClick={() => {
                      onNavigate(value);
                      setOpenMobile(false);
                    }}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
      </SidebarContent>
      <SidebarFooter className="bao-sidebar-footer">
        <MotionControl moving={moving} onToggle={onToggleMotion} />
      </SidebarFooter>
    </Sidebar>
  );
}

export function NavigationToggle() {
  const { isMobile, state, openMobile, toggleSidebar } = useSidebar();
  if (!isMobile && state === "expanded") return null;

  return (
    <div className="navigation-bar">
      <button
        type="button"
        className="navigation-trigger"
        aria-label="Open navigation"
        aria-expanded={isMobile ? openMobile : state === "expanded"}
        onClick={toggleSidebar}
      >
        <Menu size={22} />
        <span>Navigation</span>
      </button>
      <a href="/" className="mobile-wordmark" aria-label="BAO homepage">
        BAO
      </a>
    </div>
  );
}
