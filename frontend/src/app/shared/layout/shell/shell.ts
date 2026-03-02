import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { TopbarComponent } from '../../components/topbar/topbar';
import { AuthService } from '../../../core/auth/auth.service';
import { TimesheetService } from '../../../core/services/timesheet.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class ShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly ts = inject(TimesheetService);

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.ts.currentUserId.set(user.id);
      this.ts.loadWeekEntries();
    }
  }
}
