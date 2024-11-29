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


  async ngOnInit() {
    // Appel initial de la méthode checkNotify
    this.callCheckNotify();
    // Répéter l'appel toutes les 10 secondes
    setInterval(() => {
      this.callCheckNotify();
    }, 10000);
  
    // Vérification des réponses de l'utilisateur
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
  
  // Méthode pour appeler checkNotify
  async callCheckNotify() {
    try {
      const response = await this.apiService.checkNotify(); // Convertir l'Observable en Promise
      console.log('Réponse de check-notify', response);
    } catch (error) {
      console.error('Erreur lors de l\'appel à check-notify', error);
    }
  }
  
  viewPrescriptions() {
    // Redirige vers la page de liste des prescriptions
    this.router.navigate(['/list-prescriptions']); // Assurez-vous que cette route existe
  }

  addPrescription() {
    this.router.navigate(['/add-prescription']); // Assurez-vous que cette route existe
  }
}
