import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { ApiService } from '../../../services/api.service';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  imports: [CommonModule, NavBarComponent],
  standalone: true
})
export class NotificationsComponent implements OnInit, OnDestroy {
  displayMessage = false;
  NotifsAllowed = false;
  sub: any;
  private relanceIntervalId: any = null;
  PUBLIC_VAPID_KEY_OF_SERVER = 'BGPhLwNAwJZguAqSPCFEbfN_TkH7tTpe5AVTvrQxAfWEb8-alQBJtx9VLsL3i2T1sWWOKYRabRWq1mRMocUDt4c';
  notification_data: any;
 
  constructor(readonly swPush: SwPush, private api: ApiService) {
  
  }

  ngOnInit(): void {
    // Vérification de l'état de la permission des notifications
    if (Notification.permission === 'granted') {
      console.log('Notification granted');
      this.NotifsAllowed = true; // Si l'utilisateur a déjà autorisé, on active le bouton
    } else if (Notification.permission === 'denied') {
      this.displayMessage = true; // Si l'utilisateur a refusé, on affiche un message
    } else {
      // Si l'utilisateur n'a pas encore pris de décision, on demande la permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.NotifsAllowed = true; // Si l'utilisateur accepte, on active le bouton
        } else {
          this.displayMessage = true; // Sinon, on affiche un message
        }
      });
    }
    this.checkIsSubscribed();  // Vérifier si l'utilisateur est abonné dès que le composant est initialisé
  }

  /**
   * Vérifie si l'utilisateur est abonné aux notifications
   */
  checkIsSubscribed(): void {
    this.api.checkIsSubsribe().subscribe(
      (response) => {
        // Vérification de l'état de l'abonnement
        if (response.isSubscribed) {
          this.NotifsAllowed = true;  // L'utilisateur est abonné
          this.showSuccessAlert('Vous êtes déjà abonné aux notifications.');
        } else {
          this.NotifsAllowed = false; // L'utilisateur n'est pas abonné
          this.showInfoAlert('Vous n\'êtes pas encore abonné aux notifications.');
        }
      },
      (error) => {
        this.NotifsAllowed = false;
        this.showErrorAlert('Erreur lors de la vérification de l\'abonnement.');
      }
    );
  }

  /**
   * Désabonne l'utilisateur des notifications push
   */
  async unsubscribeFromPush(): Promise<void> {
    try {
      // Attendre la réponse de l'API pour désabonner l'utilisateur
      const response = await this.api.unsubscribeFromNotifications();
      this.showSuccessAlert('Vous avez été désabonné avec succès des notifications.');
      this.NotifsAllowed = false;  // Mettre à jour l'état NotifsAllowed
    } catch (error) {
      // Gérer les erreurs si la requête échoue
      this.showErrorAlert('Erreur lors de la désinscription des notifications.');
    }
  }

  /**
   * Souscrire l'utilisateur aux notifications push
   */
  async subscribeToPush(): Promise<void> {
    try {
      // Attendre la réponse de l'API pour souscrire aux notifications
      const response = await this.api.subscribeToPush();

      // Si la souscription réussit, afficher le message de succès
      this.showSuccessAlert('Souscription aux notifications réussie.');
      this.NotifsAllowed = true;  // Mettre à jour l'état NotifsAllowed
    } catch (error) {
      // Gérer les erreurs si la requête échoue
      this.showErrorAlert('Erreur lors de la souscription aux notifications.');
    }
  }

  /**
   * Afficher une SweetAlert de succès
   */
  private showSuccessAlert(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: message,
    });
  }

  /**
   * Afficher une SweetAlert d'information
   */
  private showInfoAlert(message: string): void {
    Swal.fire({
      icon: 'info',
      title: 'Information',
      text: message,
    });
  }

  /**
   * Afficher une SweetAlert d'erreur
   */
  private showErrorAlert(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message,
    });
  }

  ngOnDestroy(): void {
    if (this.relanceIntervalId) {
      clearInterval(this.relanceIntervalId);
    }
  }
}
