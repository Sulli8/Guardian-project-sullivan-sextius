import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service'; // Importer le service ApiService
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-prescriptions',
  standalone: true,
  imports: [NavBarComponent,CommonModule], // Assurez-vous que NavBarComponent est importé
  templateUrl: './list-prescriptions.component.html',
  styleUrls: ['./list-prescriptions.component.css']
})
export class ListPrescriptionsComponent implements OnInit {
  prescriptions: any[] = []; // Déclaration d'une variable pour stocker les prescriptions
  errorMessage: string = ''; // Déclaration pour stocker les messages d'erreur

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }
  deletePrescription(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette prescription ?')) {
      this.apiService.deletePrescription(id).subscribe({
        next: () => {
          this.prescriptions = this.prescriptions.filter(p => p.id !== id); // Supprimer localement la prescription supprimée
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la suppression de la prescription.';
        }
      });
    }
  }
  loadPrescriptions(): void {
      this.apiService.getPrescriptions().subscribe(
        (data) => {
          this.prescriptions = data; // Si la requête est réussie, stocker les prescriptions
          console.log('Liste des prescriptions:', this.prescriptions);
        },
        (error) => {
          this.errorMessage = 'Erreur lors de la récupération des prescriptions.';
          console.error('Erreur:', error);
        }
      );
  }
}
