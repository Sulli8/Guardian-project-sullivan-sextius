import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ApiService } from 'src/services/api.service';
import { Medication } from 'src/models/medication';
@Component({
  selector: 'app-prescription-form',
  templateUrl: './prescription-form.component.html',
  styleUrls: ['./prescription-form.component.css'],
  standalone:true,
  imports:[ReactiveFormsModule,CommonModule, NavBarComponent]
})
export class PrescriptionFormComponent implements OnInit {
  prescriptionForm: FormGroup;
  medications:Medication[];
  constructor(private fb: FormBuilder, private apiService:ApiService) {
    this.prescriptionForm = this.fb.group({
      medicationId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      dosage: ['', Validators.required],
    });
  }

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

  onSubmit(): void {
    if (this.prescriptionForm.valid) {
      const formData = this.prescriptionForm.value;
      console.log(formData);
      
      // Rechercher le médicament sélectionné par son ID
      const selectedMedication = this.medications.find(
        (med) => med._id === formData.medicationId // Comparer directement les deux comme des chaînes
      );
      // Construire l'objet prescriptionData
      const prescriptionData = {
        medicationId: selectedMedication?._id || null, // Inclure l'ID du médicament
        medicationName: selectedMedication?.name || 'Médicament inconnu',
        quantity: formData.quantity,
        dosage: formData.dosage,
      };

      this.apiService.postPrescriptions(prescriptionData).subscribe({
        next: (response) => {
          console.log('Prescription ajoutée avec succès :', response);
        },
        error: (err) => {
          console.error('Erreur lors de l\'envoi de la prescription :', err);
        }
      });
      
      console.log('Prescription Data:', prescriptionData);
  
      // Ajouter ici l'appel à une API ou toute autre action pour envoyer les données
      // Exemple : this.apiService.postPrescription(prescriptionData).subscribe(...);
    } else {
      console.log('Le formulaire est invalide.');
    }
  }
  
}
