import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import Swal from 'sweetalert2';
import { ApiService } from '../../../services/api.service';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { Router } from '@angular/router';

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
  notifications: any[] = [];
  user: any[] = [];

  constructor(private router: Router, readonly swPush: SwPush, private api: ApiService) {}

  hrefPrescription(url: String) {
    console.log(url);
  }

  getNotifications() {
    this.api.getNotifications().subscribe(
      (data) => {
        console.log(data);
        this.notifications = data.notifications; 
      },
      (error) => {
        console.error('Erreur lors de la récupération des médicaments:', error);
      }
    );
  }

  getUser() {
    this.api.getUser().subscribe(
      (data) => {
        console.log(data);
        this.user = data.user; 
        if(this.user.length == 0) {
            this.router.navigate(['/introduce']);
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des médicaments:', error);
      }
    );
  }

  ngOnInit(): void {
    if (Notification.permission === 'granted') {
      console.log('Notification granted');
      this.NotifsAllowed = true; 
    } else if (Notification.permission === 'denied') {
      this.displayMessage = true;
    } else {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.NotifsAllowed = true;
        } else {
          this.displayMessage = true;
        }
      });
    }
    this.checkIsSubscribed();
    this.getNotifications();
    this.getUser();
  }

  deleteData(): void { 
    this.api.deleteDataUser().subscribe(
      (response) => {
        if (response) {
          this.router.navigate(['/introduce']);
        }
      },
      (error) => {
        console.error('Erreur lors de la suppression des données utilisateur:', error);
      }
    );
  }

  exportPdf() {
    this.api.exportNotifications().subscribe(
      (response) => {
        const blob = response.body;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'prescriptions.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Erreur lors du téléchargement du PDF:', error);
      }
    );
  }

  checkIsSubscribed(): void {
    this.api.checkIsSubsribe().subscribe(
      (response) => {
        if (response.isSubscribed) {
          this.NotifsAllowed = true;
          this.showSuccessAlert('Vous êtes déjà abonné aux notifications.');
        } else {
          this.NotifsAllowed = false;
          this.showInfoAlert('Vous n\'êtes pas encore abonné aux notifications.');
        }
      },
      (error) => {
        this.NotifsAllowed = false;
        this.showErrorAlert('Erreur lors de la vérification de l\'abonnement.');
      }
    );
  }

  async unsubscribeFromPush(): Promise<void> {
    try {
      const response = await this.api.unsubscribeFromNotifications();
      this.showSuccessAlert('Vous avez été désabonné avec succès des notifications.');
      this.NotifsAllowed = false;
    } catch (error) {
      this.showErrorAlert('Erreur lors de la désinscription des notifications.');
    }
  }

  async subscribeToPush(): Promise<void> {
    try {
      const response = await this.api.subscribeToPush();
      this.showSuccessAlert('Souscription aux notifications réussie.');
      this.NotifsAllowed = true;
    } catch (error) {
      this.showErrorAlert('Erreur lors de la souscription aux notifications.');
    }
  }

  private showSuccessAlert(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: message,
    });
  }

  private showInfoAlert(message: string): void {
    Swal.fire({
      icon: 'info',
      title: 'Information',
      text: message,
    });
  }

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
