import { Component } from '@angular/core';
import { WizardComponent } from '../wizard/wizard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css'],
  standalone:true,
  imports: [WizardComponent,ReactiveFormsModule,CommonModule]
})
export class QuestionnaireComponent {

  handleSubmit(responses: any) {
    console.log('Les réponses finales du questionnaire sont :', responses);
  }
  
  
  // Exemple de questionnaire
  questionnaire = {
    title: 'Questionnaire de santé',
    steps: [
      {
        label: 'Étape 1',
        questions: [
          { id: 1, text: 'Quel est votre langage préféré ?', type: 'text' },
          { id: 2, text: 'Avez-vous déjà utilisé Angular ?', type: 'boolean' }
        ]
      },
      {
        label: 'Étape 2',
        questions: [
          { id: 3, text: 'Quelle est votre IDE préférée ?', type: 'text' },
          { id: 4, text: 'Utilisez-vous un système de versionnage ?', type: 'boolean' }
        ]
      },
      {
        label: 'Étape 3',
        questions: [
          { id: 5, text: 'Comment évalueriez-vous Angular ?', type: 'rating' }
        ]
      }
    ]
  };
}
