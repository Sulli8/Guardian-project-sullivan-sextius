import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { HighlightModule } from 'ngx-highlightjs';
import { NotificationsComponent } from 'src/app/components/notifications/notifications.component';
import {HealthSurveyComponent} from 'src/app/components/health-survey/health-survey.component'
import { NavBarComponent } from 'src/app/components/nav-bar/nav-bar.component';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [HealthSurveyComponent,HighlightModule, AsyncPipe, NgIf, NotificationsComponent,NavBarComponent],
})
export class ProfileComponent implements OnInit {
  profileJson: string = null;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.auth.user$.subscribe(
      (profile) => (this.profileJson = JSON.stringify(profile, null, 2))
    );
  }
}
