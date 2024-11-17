import { Component, Input,OnChanges, SimpleChanges , OnInit, ViewEncapsulation } from '@angular/core';
import { StepModel } from '../../../models/step-model.model';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from 'src/models/user.model';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-step-template',
  templateUrl: './step-template.component.html',
  styleUrls: ['./step-template.component.css'],
  imports: [ReactiveFormsModule,CommonModule],
  standalone:true,
  encapsulation: ViewEncapsulation.None
})
export class StepTemplateComponent implements OnInit {
  @Input() step: any;
  @Input() stepForm1: FormGroup;
  @Input() stepForm2: FormGroup;
  @Input() stepForm3: FormGroup;

  // Déclaration de userData avec le type User
    userData: User = {
      name: '',
      email: '',
      address: '',
      city: '',
      username: '',
      password: ''
    };
  constructor(
    private userDataService: UserService // Injection du service
  ) {}

  ngOnInit(): void {
  }

  onFormChange(step: number): void {
    switch (step) {
      case 1:
        if (this.stepForm1.valid) {
          this.step.isComplete = true;
          // Mettre à jour les données utilisateur via le service
          this.userDataService.updateUserData({
            name: this.stepForm1.get('name')?.value,
            email: this.stepForm1.get('email')?.value
          });
        }
        else {
          this.step.isComplete = false;
        }
        break;
      case 2:
        if (this.stepForm2.valid) {
          console.log(this.userDataService)
          this.step.isComplete = true;
          this.userDataService.updateUserData({
            address: this.stepForm2.get('address')?.value,
            city: this.stepForm2.get('city')?.value
          });
        }  else {
          this.step.isComplete = false;
        }
        break;
      case 3:
        if (this.stepForm3.valid) {
          this.step.isComplete = true;
          this.userDataService.updateUserData({
            username: this.stepForm3.get('username')?.value,
            password: this.stepForm3.get('password')?.value
          });
        }  else {
          this.step.isComplete = false;
        }
        break;
    }
  }

      // Méthode pour envoyer les données à la base de données ou autre action
  onCompleteStep(): void {
    if (this.step.isComplete) {
      console.log('Données complètes :', this.userData);
      // Envoyer ces données à la base de données
    } else {
      console.log('Étape incomplète, veuillez remplir tous les champs.');
    }
  }

}