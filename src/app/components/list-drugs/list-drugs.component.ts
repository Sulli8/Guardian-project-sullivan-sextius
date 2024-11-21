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

  ngOnInit(): void {
    this.getMedications();
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
