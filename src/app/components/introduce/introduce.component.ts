import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe, DOCUMENT, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from 'src/services/api.service';
@Component({
  selector: 'app-introduce',
  templateUrl: './introduce.component.html',
  styleUrls: ['./introduce.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    NgIf,
    RouterLink,
  ]
})
export class IntroduceComponent {

  constructor(
    private api:ApiService,
    public auth: AuthService, private router: Router,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  login(){
     this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        console.log("AUTH")
        this.api.loginUser().subscribe(res => {
          if(res.message == 'User created successfully' || res.message == "Utilisateur déjà existant, aucun ajout nécessaire."){
            this.router.navigate(['/home-page']);
          } 
        })
      }
    });
  }
  onSignIn() {
    this.auth.loginWithRedirect();
    this.login()
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
   this.login()
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }

  onSignUp() {
    console.log('Sign Up button clicked!');
    // Ajouter la logique pour Sign Up ici
  }
}
