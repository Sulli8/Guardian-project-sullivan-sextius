import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Si vous avez besoin de rediriger l'utilisateur

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {

  constructor(private router: Router) {}

  viewPrescriptions() {
    // Redirige vers la page de liste des prescriptions
    this.router.navigate(['/prescriptions']); // Assurez-vous que cette route existe
  }

  addPrescription() {
    // Redirige vers la page d'ajout de prescription
    this.router.navigate(['/add-prescription']); // Assurez-vous que cette route existe
  }
}
