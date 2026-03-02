import { Component, inject, computed } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../core/auth/auth.service";

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles: string[];
}

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.scss",
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;

  readonly navItems: NavItem[] = [
    {
      label: "My Week",
      icon: "📅",
      path: "/employee/week",
      roles: ["employee", "admin"],
    },
    {
      label: "History",
      icon: "🗓",
      path: "/employee/history",
      roles: ["employee", "admin"],
    },
    {
      label: "Dashboard",
      icon: "📊",
      path: "/admin/dashboard",
      roles: ["admin"],
    },
    { label: "Reports", icon: "📄", path: "/admin/reports", roles: ["admin"] },
    { label: "Metrics", icon: "⚡", path: "/admin/metrics", roles: ["admin"] },
  ];

  readonly visibleItems = computed(() => {
    const role = this.user()?.role ?? "employee";
    return this.navItems.filter((item) => item.roles.includes(role));
  });

  logout() {
    this.auth.logout();
  }
}
