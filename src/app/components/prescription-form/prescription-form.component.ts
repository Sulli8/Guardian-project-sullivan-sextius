import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ApiService } from 'src/services/api.service';
import { Medication } from 'src/models/medication';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prescription-form',
  templateUrl: './prescription-form.component.html',
  styleUrls: ['./prescription-form.component.css'],
  standalone:true,
  imports:[ReactiveFormsModule,CommonModule, NavBarComponent,SweetAlert2Module]
})
export class PrescriptionFormComponent implements OnInit {
  prescriptionForm: FormGroup;
  medications:Medication[];
  stepData: { key: string, value: any }[] = [
    { key: 'nom', value: '' },
    { key: 'traitement', value: '' },
    { key: 'frequence', value: '' },
    { key: 'medicament', value: '' },
    { key: 'dosage', value: '' },
    { key: 'prescriptionDate', value: '' },
    { key: 'prescriptionTime', value: '' }
  ];
  currentStepIndex: number = 0; // Pour suivre l'étape actuelle

  constructor(private router:Router, private fb: FormBuilder, private apiService:ApiService) {
    this.prescriptionForm = this.fb.group({
      medicationId: ['', Validators.required],
      dosage: ['', Validators.required],
      frequence: ['', Validators.required],  // Champ pour la fréquence
      datePrescribed: [new Date().toISOString(), Validators.required], // Date actuelle
      timePrescribed: [new Date().toISOString(), Validators.required], // Heure actuelle
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

  nextStep(): void {
    if (this.currentStepIndex < 6) {
      this.currentStepIndex++;
    }
  
    if (this.currentStepIndex === 6) {
      // Afficher un SweetAlert de confirmation avant de valider
      Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Êtes-vous sûr de vouloir valider le formulaire ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, valider',
        cancelButtonText: 'Non, revenir en arrière',
      }).then((result) => {
        if (result.isConfirmed) {
          // Code pour valider le formulaire ou effectuer l'action finale
          this.onSubmit(); // Exemple de méthode pour soumettre le formulaire
        } else {
          // Si l'utilisateur annule, revenir en arrière (ne pas incrémenter l'index)
          this.currentStepIndex--;
        }
      });
    }
  }


  previousStep(){
    this.currentStepIndex--;
  }
  showSuccessAlert() {
    Swal.fire({
      title: 'Succès!',
      text: 'La prescription a été remplie avec succès.',
      icon: 'success',
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.isConfirmed) {
        // Rediriger vers la page d'accueil (home-page)
        this.router.navigate(['/home-page']);
      }
    });
  }

  onSubmit(): void {
    console.log(this.prescriptionForm)
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
        frequence: formData.frequence,
        dosage: formData.dosage,
        datePrescribed: formData.datePrescribed,
        timePrescribed: formData.timePrescribed
      };

      this.apiService.postPrescriptions(prescriptionData).subscribe({
        next: (response) => {
          this.showSuccessAlert()
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
