import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Si vous avez besoin de rediriger l'utilisateur
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { faPrescriptionBottle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from 'src/services/api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  standalone:true,
  imports:[NavBarComponent,FontAwesomeModule,CommonModule]
})
export class HomePageComponent {
  faPrescriptionBottle = faPrescriptionBottle;
  faPlus = faPlus;
  hasAnswered: boolean = false;
  message: string = '';
  prescriptions:any[] = [];

  constructor(private router: Router,private apiService:ApiService) {}
  weekDays: string[] = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  
  // Date actuellement affichée
  displayDate: Date = new Date();
  // Change la date en fonction du défilement
  onScroll(event: any): void {
    const scrollLeft = event.target.scrollLeft;
    const dayWidth = 100;  // Largeur approximative de chaque jour dans le carrousel
    const dayIndex = Math.floor(scrollLeft / dayWidth);
    
    // Ajouter ou soustraire des jours en fonction du défilement
    const newDate = new Date(this.displayDate);
    newDate.setDate(this.displayDate.getDate() + dayIndex);
    this.displayDate = newDate;
  }

  // Changer la date en augmentant ou diminuant
  changeDate(offset: number): void {
    const newDate = new Date(this.displayDate);
    newDate.setDate(this.displayDate.getDate() + offset);
    this.displayDate = newDate;
  }
  ngAfterViewInit(){
  this.apiService.getPrescription().subscribe(
    (response) => {
     this.prescriptions = response.result
     //console.log(this.prescriptions)
   },
   (error) => {
     console.error('Erreur lors de la vérification des réponses:', error);
     this.message = 'Erreur lors de la vérification de vos réponses.';
   }
 )
}

treatmentNeed() {
  Swal.fire({
    title: 'Tous les traitement',
    html: this.getPrescriptionsHtml(),
    background: '#2C2C2E',
    color: '#fff',
    showCloseButton: true,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Ok',
    cancelButtonColor: '#f56b2a',
    focusCancel: true,
    customClass: {
      title: 'sweet-alert-title-treatment', // Classe CSS spécifique pour le titre
      popup: 'sweet-alert-popup-treatment', // Classe CSS spécifique pour la popup
      cancelButton: 'sweet-alert-cancel-button-treatment', // Classe CSS spécifique pour le bouton "Ok"
    }
  });
}

getPrescriptionsHtml() {
  return this.prescriptions.map(prescription => {
    return `
      <div style=" display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 20px;
  background-color: #3a3a3c; 
  border-radius: 8px;
  padding: 10px;">
    
        <div style=" display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #fff;">
   <div style=" display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  color: #fff;">
         <img class="img-drugs" heigth="50" width="50" *ngIf="${prescription.medicaments.type} === 'comprime'" src="../../../assets/icons/icon-comprime.png" alt="Image comprimé">
        
          <div class="medicament-dosage">Dosage: ${prescription.dosage}</div>
          <div class="medicament-date">Date de prescription: ${new Date(prescription.datePrescribed).toLocaleDateString()}</div>
         </div>
          <button style="
  background-color: #142A33;
  color: #007bff;
  font-weight: bold;
  width: 100%;
  height: 40px;
  margin-top: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
">Pris</button>
        </div>
      </div>
    `;
  }).join('');
}


followTreatment() {
  Swal.fire({
    title: 'Pourquoi le suivi des traitements est-il important?',
    html: `
    <img height="400" width="450" src="../../../assets/icons/data-info.png" class="data-info">
      <p style="color: #fff;">Que l'on vous ait prescrit un ou plusieurs traitements, il est important de suivre leur prise et leur posologie. Chaque personne réagit de façon unique à la prise d'un médicament, aussi le suivi de vos traitements peut vous aider à comprendre les effets de ces derniers sur votre corps. Il peut également vous aider à vous souvenir de votre dernière prise et vous envoyer des notifications lorsqu'il est l'heure de la prise suivante. Des doses trop rapprochées peuvent entraîner un surdosage et vous mettre en danger, tandis que des prises irrégulières ou moins fréquentes que la posologie prescrite peuvent entraîner un sous-dosage et par conséquent réduire l'efficacité des traitements.</p>
      
      <p style="color: #fff;">Il est également important de suivre les conditions dans lesquelles vos traitements doivent être pris. Par exemple, certains médicaments doivent être pris au moment des repas de manière à réduire les effets indésirables, tandis que d'autres médicaments doivent être pris à jeun pour faciliter leur absorption. L'ajout de notes à votre méthode de suivi peut vous aider à prendre vos traitements dans les conditions optimales.</p>

      <p style="color: #fff;">Interactions médicamenteuses: de quoi s'agit-il ? Si le suivi des traitements est utile, il est important de garder à l'esprit qu'il ne constitue qu'un outil pour gérer votre programme de traitements de façon optimale. Consultez votre médecin, votre pharmacien, les membres de votre famille ou un fournisseur de soins pour créer un programme de traitements adapté à vos besoins.</p>
      
      <p style="color: #fff;">Si les traitements modernes sont efficaces et sans danger, certains médicaments peuvent interagir les uns avec les autres, avec les aliments que vous consommez ou encore avec certaines pathologies. Ces interactions peuvent rendre vos traitements moins efficaces ou entraîner des effets indésirables potentiellement dangereux.</p>

      <p style="color: #fff;">Votre médecin, votre équipe de soins et votre pharmacien sont formés pour identifier les interactions médicamenteuses éventuellement présentes dans vos ordonnances, et la tenue rigoureuse de votre dossier de traitements peut les aider dans leur recherche d'interactions.</p>
      
      <p style="color: #fff;">Ces interactions surviennent lorsque deux ou plusieurs traitements interagissent les uns avec les autres. L'app Santé peut rechercher ces interactions. Si un résultat est trouvé, l'app vous indique le niveau de risque que représente l'interaction parmi les trois niveaux disponibles.</p>

      <p style="color: #fff;">Une interaction critique signifie que les médicaments ne doivent pas être mélangés et que vous devez consulter votre équipe de soins. La prise simultanée de ces traitements peut entraîner des effets indésirables significatifs ou réduire l'efficacité de vos traitements.</p>

      <p style="color: #fff;">Une interaction grave signifie que cette association de médicaments peut entraîner des effets indésirables graves ou réduire leur efficacité. Vous devez par conséquent en discuter avec votre équipe de soins en vue d'ajuster votre ordonnance.</p>

      <p style="color: #fff;">Une interaction modérée signifie que vous devez respecter la posologie de votre ordonnance, et que des effets indésirables ou une réduction de l'efficacité de vos traitements peuvent être observés.</p>

      <p style="color: #fff;">Interactions entre médicaments et aliments: les aliments peuvent interagir avec certains médicaments, il est donc crucial de suivre les recommandations de votre professionnel de santé.</p>
    `,
    background: '#2C2C2E', // Background color
    color: '#fff', // Text color
    showCloseButton: true,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Ok',
    cancelButtonColor: '#f56b2a',
    confirmButtonColor: '#3085d6',
    focusCancel: true,
    customClass: {
      title: 'sweet-alert-title',
      popup: 'sweet-alert-popup',
      cancelButton: 'sweet-alert-cancel-button',
    }
  });
}
exportToPDF(): void {
  this.apiService.exportPrescriptions().subscribe(
    (response) => {
      const blob = response.body;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'prescriptions.pdf'; // Nom du fichier PDF téléchargé
      link.click();
      window.URL.revokeObjectURL(url); // Libérer la mémoire
    },
    (error) => {
      console.error('Erreur lors du téléchargement du PDF:', error);
    }
  );
}

  async ngOnInit() {
    this.displayDate = new Date();
    // Appel initial de la méthode checkNotify
    this.callCheckNotify();
    // Répéter l'appel toutes les 10 secondes
    setInterval(() => {
      this.callCheckNotify();
    }, 10000);
  
    // Vérification des réponses de l'utilisateur
    this.apiService.checkIfUserHasAnswered().subscribe(
      (response) => {
        this.message = response.message;  // Affiche le message
        this.apiService.handleRedirection(response.valeur);  // Redirige en fonction de la valeur
      },
      (error) => {
        console.error('Erreur lors de la vérification des réponses:', error);
        this.message = 'Erreur lors de la vérification de vos réponses.';
      }
    );

    
  }
  
  // Méthode pour appeler checkNotify
  async callCheckNotify() {
    try {
      const response = await this.apiService.checkNotify(); // Convertir l'Observable en Promise
      console.log('Réponse de check-notify', response);
    } catch (error) {
      console.error('Erreur lors de l\'appel à check-notify', error);
    }
  }
  
  viewPrescriptions() {
    // Redirige vers la page de liste des prescriptions
    this.router.navigate(['/list-prescriptions']); // Assurez-vous que cette route existe
  }

  addPrescription() {
    this.router.navigate(['/add-prescription']); // Assurez-vous que cette route existe
  }
}
