import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StepModel } from '../../../models/step-model.model';
import { Observable } from 'rxjs';
import { StepsService } from '../../../services/steps.service';
import { Router } from '@angular/router';
import { StepsComponent } from '../steps/steps.component';
import { CommonModule } from '@angular/common';
import { StepTemplateComponent } from '../step-template/step-template.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/services/user.service';
import { switchMap } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-form-page',
  templateUrl: './form-page.component.html',
  styleUrls: ['./form-page.component.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true, 
  imports: [StepsComponent, CommonModule, StepTemplateComponent,HttpClientModule] 
})
export class FormPageComponent implements OnInit {
  currentStep: Observable<StepModel>;

  // Formulaires pour chaque étape
  stepForm1: FormGroup;
  stepForm2: FormGroup;
  stepForm3: FormGroup;
  user: any;

  constructor(
    private stepsService: StepsService,
    private router: Router,
    private fb: FormBuilder,
    private userDataService: UserService
  ) {}

  ngOnInit(): void {
    // Initialisation des formulaires pour chaque étape
    this.initForms();
    // Obtenez l'étape actuelle à partir du service
    this.currentStep = this.stepsService.getCurrentStep();
  }

  // Initialisation des formulaires pour chaque étape
  initForms() {
    this.stepForm1 = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.stepForm2 = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required]
    });

    this.stepForm3 = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]]
    });
  }

  onNextStep() {
    if (!this.stepsService.isLastStep()) {
      this.stepsService.moveToNextStep();
    } else {
      this.onSubmit();
    }
  }

  showButtonLabel() {
    console.log("FINIS")
    return !this.stepsService.isLastStep() ? 'Continue' : 'Finish';
  }


  onSubmit(): void {
    console.log("ON SUBMIT")
    this.userDataService.submitUserData().subscribe({
      next: (response) => {
        console.log('Réponse de l\'API :', response);  // Afficher la réponse de l'API
      },
      error: (error) => {
        console.error('Erreur lors de la requête API :', error);  // Afficher l'erreur si l'appel échoue
      }
    });
  }
  
}
