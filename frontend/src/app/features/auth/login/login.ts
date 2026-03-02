import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  readonly auth = inject(AuthService);

  loginAs(userId: string) {
    this.auth.loginAsMock(userId);
  }
}
