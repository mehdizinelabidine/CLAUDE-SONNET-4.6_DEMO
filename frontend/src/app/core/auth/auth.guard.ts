import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  // In mock mode allow access after selecting a user
  if (auth.isMockMode()) {
    const savedId = localStorage.getItem("mock_user_id");
    if (savedId) {
      auth.loginAsMock(savedId);
      return true;
    }
    router.navigate(["/login"]);
    return false;
  }

  router.navigate(["/login"]);
  return false;
};
