import { Injectable, signal, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../services/api.service";
import { User } from "../models/models";

const MOCK_USERS: User[] = [
  {
    id: "adm-001",
    name: "Admin One",
    email: "admin.one@company.com",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "emp-001",
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    role: "employee",
    createdAt: new Date().toISOString(),
  },
  {
    id: "emp-002",
    name: "Bob Smith",
    email: "bob.smith@company.com",
    role: "employee",
    createdAt: new Date().toISOString(),
  },
];

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  readonly isMockMode = signal<boolean>(true); // Detect via env or fallback
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === "admin");
  readonly mockUsers = signal<User[]>(MOCK_USERS);
  readonly isLoading = signal(false);

  initialize() {
    this.isLoading.set(true);
    this.api.getMe().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.isMockMode.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        // If /me fails, fall into mock mode
        const savedId = localStorage.getItem("mock_user_id");
        const saved = MOCK_USERS.find((u) => u.id === savedId);
        if (saved) {
          this.currentUser.set(saved);
        }
        this.isMockMode.set(true);
        this.isLoading.set(false);
      },
    });
  }

  loginAsMock(userId: string) {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      this.currentUser.set(user);
      localStorage.setItem("mock_user_id", userId);
      const destination =
        user.role === "admin" ? "/admin/dashboard" : "/employee/week";
      this.router.navigate([destination]);
    }
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem("mock_user_id");
    this.router.navigate(["/login"]);
  }

  getMockUserId(): string {
    return this.currentUser()?.id ?? MOCK_USERS[0].id;
  }
}
