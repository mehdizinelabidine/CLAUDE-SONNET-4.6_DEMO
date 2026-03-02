import { Component, inject } from "@angular/core";
import { TimesheetService } from "../../../core/services/timesheet.service";
import { AuthService } from "../../../core/auth/auth.service";

@Component({
  selector: "app-topbar",
  standalone: true,
  templateUrl: "./topbar.html",
  styleUrl: "./topbar.scss",
})
export class TopbarComponent {
  readonly ts = inject(TimesheetService);
  readonly auth = inject(AuthService);

  get user() {
    return this.auth.currentUser();
  }
}
