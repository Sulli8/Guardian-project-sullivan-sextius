import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ApiService } from 'src/services/api.service';
import { Medication } from 'src/models/medication';

@Component({
  selector: 'app-list-drugs',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './list-drugs.component.html',
  styleUrl: './list-drugs.component.css'
})
export class ListDrugsComponent {
  medications: Medication[];

constructor(private apiService: ApiService){}
  ngOnInit(): void {
    this.apiService.getMedications().subscribe({
      next: (data) => {
        // S'assurer que les données reçues sont un tableau d'objets Medication
        if (Array.isArray(data)) {
          this.medications = data; // Remplacez le tableau vide par les données reçues
          console.log('Médicaments récupérés :', this.medications);
        } else {
          console.error('Les données récupérées ne sont pas un tableau !');
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des médicaments :', err);
      }
    });
  }
}
