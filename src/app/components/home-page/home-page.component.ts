import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Si vous avez besoin de rediriger l'utilisateur
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  standalone:true,
  imports:[NavBarComponent]
})
export class HomePageComponent {

  constructor(private router: Router) {}

  viewPrescriptions() {
    // Redirige vers la page de liste des prescriptions
    this.router.navigate(['/list-prescriptions']); // Assurez-vous que cette route existe
  }

  addPrescription() {
    this.router.navigate(['/add-prescription']); // Assurez-vous que cette route existe
  }
}
