import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe, DOCUMENT, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    NgIf,
    RouterLink,
  ]
})
export class HomeContentComponent {

  constructor(
    public auth: AuthService, private router: Router,
    @Inject(DOCUMENT) private doc: Document
  ) {}
  onSignIn() {
    console.log('Sign In button clicked!');
    this.auth.loginWithRedirect();
  }
  isAuth(){
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // Si l'utilisateur est authentifié, redirigez-le vers la page d'accueil
        this.router.navigate(['/home-page']); // Remplacez "/home" par le chemin de votre page d'accueil
      }
    });
  }
  loginWithRedirect() {
    this.auth.loginWithRedirect();
    this.isAuth()
  }

  ngOnInit() {
    // Vérifiez si l'utilisateur est déjà authentifié et redirigez-le
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // Si l'utilisateur est authentifié, redirigez-le vers la page d'accueil
        this.router.navigate(['/home-page']); // Remplacez "/home" par le chemin de votre page d'accueil
      }
    });
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }

  onSignUp() {
    console.log('Sign Up button clicked!');
    // Ajouter la logique pour Sign Up ici
  }
}
