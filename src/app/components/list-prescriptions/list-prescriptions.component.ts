import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-list-prescriptions',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './list-prescriptions.component.html',
  styleUrl: './list-prescriptions.component.css'
})
export class ListPrescriptionsComponent {

}
