import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Si vous avez besoin de rediriger l'utilisateur
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { faPrescriptionBottle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from 'src/services/api.service';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  standalone:true,
  imports:[NavBarComponent,FontAwesomeModule,CommonModule]
})
export class HomePageComponent {
  faPrescriptionBottle = faPrescriptionBottle;
  faPlus = faPlus;
  hasAnswered: boolean = false;
  message: string = '';
  constructor(private router: Router,private apiService:ApiService) {}


  ngOnInit() {
    this.apiService.checkIfUserHasAnswered().subscribe(
      (response) => {
        this.message = response.message;  // Affiche le message
        this.apiService.handleRedirection(response.valeur);  // Redirige en fonction de la valeur
      },
      (error) => {
        console.error('Erreur lors de la vérification des réponses:', error);
        this.message = 'Erreur lors de la vérification de vos réponses.';
      }
    );
  }


  

  viewPrescriptions() {
    // Redirige vers la page de liste des prescriptions
    this.router.navigate(['/list-prescriptions']); // Assurez-vous que cette route existe
  }

  addPrescription() {
    this.router.navigate(['/add-prescription']); // Assurez-vous que cette route existe
  }
}
