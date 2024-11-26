import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/services/api.service';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
  standalone:true,
  imports:[FormsModule,CommonModule]
})
export class WizardComponent {
  @Input() title: string = ''; 
  @Output() onSubmit = new EventEmitter<any>(); 

  currentStep = 0;
  responses: { [key: number]: any } = {};
  @Input() steps: any[];
  constructor(private router:Router, private apiService: ApiService) {}

  ngOnInit() {
   
    // Charger les questions depuis l'API
    this.apiService.getQuestions().subscribe((questions) => {
      // Organiser les questions par étape
      console.log(questions)
      this.steps = this.organizeQuestionsByStep(questions);
    });
  }

   organizeQuestionsByStep(questions) {
    const steps = [];
  
    questions.questions.forEach((question) => {
      // Chercher l'étape existante pour cette question
      const step = steps.find((s) => s.step === question.step);
      
      // Si l'étape n'existe pas encore, on la crée
      if (!step) {
        steps.push({ step: question.step, questions: [question] });
      } else {
        // Si l'étape existe déjà, on ajoute la question
        step.questions.push(question);
      }
    });
  
    return steps;
  }
  



  goToStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      this.currentStep = index;
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }


  submitWizard() {
    console.log('Réponses soumises:', this.responses);

    // 1. Structurer les réponses, si nécessaire
    const formattedResponses = this.formatResponses(this.responses);

    // 2. Soumettre les réponses au backend via le service
    this.apiService.submitResponses(formattedResponses).subscribe(
      (response) => {
        console.log('Réponses envoyées avec succès', response);
        
        // Vérifiez si la réponse du backend indique un succès
        if (response.message === 'Réponses enregistrées avec succès') {
          // Redirige l'utilisateur vers la page d'accueil
          this.router.navigate(['/home-page']);  // 'home-page' est l'URL vers la page d'accueil
        }

        this.onSubmit.emit({ success: true, response });  // Émet un événement si l'envoi réussit
      },
      (error) => {
        console.error('Erreur lors de l\'envoi des réponses', error);
        this.onSubmit.emit({ success: false, error });  // Émet un événement en cas d'erreur
      }
    );
  }

  // Exemple de méthode pour formater les réponses avant de les envoyer (si nécessaire)
  formatResponses(responses: any) {
    // Ici, vous pouvez formater ou ajuster vos réponses avant l'envoi si nécessaire
    return Object.keys(responses).map((key) => ({
      questionId: key,
      response: responses[key]
    }));
  }
}
