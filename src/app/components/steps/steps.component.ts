import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { StepModel } from '../../../models/step-model.model';
import { StepsService } from '../../../services/steps.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports:[CommonModule]
})
export class StepsComponent implements OnInit {

  steps: Observable<StepModel[]>;
  currentStep: Observable<StepModel>;

  constructor(private stepsService: StepsService) { }

  ngOnInit(): void {
    this.steps = this.stepsService.getSteps();
    this.currentStep = this.stepsService.getCurrentStep();
  }

  

  onStepClick(step: StepModel) {
    this.stepsService.setCurrentStep(step);
  }
}