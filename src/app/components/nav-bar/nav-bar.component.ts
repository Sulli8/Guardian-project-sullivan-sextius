import { Component, Inject } from '@angular/core';
import { faBars} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe, CommonModule, DOCUMENT, NgIf } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  NgbCollapse,
  NgbDropdown,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  imports: [
    FontAwesomeModule,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdown,
    NgbCollapse,
    AsyncPipe,
    NgIf,
    RouterLink,
    CommonModule
  ],
})
export class NavBarComponent {
  isCollapsed = true;
  faBars = faBars;
  isMenuVisible = false; // État du menu

  constructor(private router:Router,
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document
  ) {}
  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible; // Alterne l'état du menu
  }
  loginWithRedirect() {
    this.auth.loginWithRedirect();
  }
  link_home(){
    this.router.navigate(['/home-page'])
  }
  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }
}
