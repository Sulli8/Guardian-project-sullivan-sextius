import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home-content',
  templateUrl: './home-content.component.html',
  styleUrls: ['./home-content.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeContentComponent {
  onSignIn() {
    console.log('Sign In button clicked!');
    // Ajouter la logique pour Sign In ici
  }

  onSignUp() {
    console.log('Sign Up button clicked!');
    // Ajouter la logique pour Sign Up ici
  }
}
