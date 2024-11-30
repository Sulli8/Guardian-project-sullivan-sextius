import { Component, NgModule, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service'; // Importez votre service
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-list-drugs',
  templateUrl: './list-drugs.component.html',
  styleUrls: ['./list-drugs.component.css'],
  standalone:true,
  imports:[CommonModule,NavBarComponent]
})
export class ListDrugsComponent implements OnInit {

  medications: any[] = []; // Tableau pour stocker les médicaments

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    this.callCheckNotify();
    // Répéter l'appel toutes les 10 secondes
    setInterval(() => {
      this.callCheckNotify();
    }, 10000);
    this.getMedications();
  }
  
  async callCheckNotify() {
    try {
      const response = await this.apiService.checkNotify(); // Convertir l'Observable en Promise
      console.log('Réponse de check-notify', response);
    } catch (error) {
      console.error('Erreur lors de l\'appel à check-notify', error);
    }
  }

  getMedications(): void {
    this.apiService.getMedications().subscribe(
      (data) => {
        console.log('Médicaments récupérés :', data);
        this.medications = data;  // Affecter les médicaments récupérés
      },
      (error) => {
        console.error('Erreur lors de la récupération des médicaments:', error);
      }
    );
  }
}
