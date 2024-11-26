import { Component } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
@Component({

  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  imports: [CommonModule,NavBarComponent],
  standalone:true
})
export class NotificationsComponent {
  displayMessage = false;
  NotifsAllowed = false;
  sub:any;
  private relanceIntervalId: any = null;
  PUBLIC_VAPID_KEY_OF_SERVER = 'BGPhLwNAwJZguAqSPCFEbfN_TkH7tTpe5AVTvrQxAfWEb8-alQBJtx9VLsL3i2T1sWWOKYRabRWq1mRMocUDt4c';
  PRIVATE_VAPID_KEY_OF_SERVER = ''
  notification_data:any
  constructor(readonly swPush: SwPush,private api:ApiService) {
    if (Notification.permission === 'granted') {
      console.log('notif granted');
      this.NotifsAllowed = true;
    } else if (Notification.permission === 'denied') {
      this.displayMessage = true;
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.NotifsAllowed = true;
          }
        });
    } else {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.NotifsAllowed = true;
        }
      });
    }
  }


/*  public async subscribeToPush() {
    console.log('Starting subscription process...');
    try {
      if (Notification.permission !== 'granted') {
        console.warn('Notifications permission is not granted.');
        return;
      }
  
      if (!this.swPush.isEnabled) {
        console.error('Service Workers are not enabled in this environment.');
        return;
      }
  
      if (!this.PUBLIC_VAPID_KEY_OF_SERVER) {
        console.error('Public VAPID key is missing.');
        return;
      }
  
      console.log('Requesting subscription...');
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.PUBLIC_VAPID_KEY_OF_SERVER,
      });
  
      console.log('Subscription successful:', JSON.stringify(sub, null, 2));
      this.sub = sub;
  
      this.api.postSubscription(sub).subscribe({
        next: (res) => console.log('Subscription successfully sent to server:', res),
        error: (err) => console.error('Error sending subscription to server:', err),
      });
    } catch (err) {
      console.error('Could not subscribe due to:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Stack trace:', err.stack);
      }
    }
    console.log('Subscription process complete.');
  }
  */
  public stopRelance() {
    if (this.relanceIntervalId !== null) {
      clearInterval(this.relanceIntervalId);
      this.relanceIntervalId = null; // Réinitialiser pour éviter des appels multiples
      console.log('Relance arrêtée avec succès.');
    } else {
      console.log('Aucune relance active à arrêter.');
    }
  }
  
 public async startRelance() {
  try {
    // Démarrer un intervalle pour exécuter les opérations périodiques
    this.relanceIntervalId = setInterval(async () => {
      try {
        // Demander la souscription Push
        const sub = await this.swPush.requestSubscription({
          serverPublicKey: this.PUBLIC_VAPID_KEY_OF_SERVER,
        });
        console.log('Souscription réussie:', sub);

        // Enregistrer la souscription côté serveur
        this.sub = sub;
        this.api.postSubscription(sub, false).subscribe((res) => {
          if (res) {
            console.log('Souscription enregistrée côté serveur:', res);

            // Préparer le payload de notification
            const payload = {
              title: 'Relance automatique',
              body: 'Ceci est un rappel envoyé toutes les 10 secondes.',
              icon: '/assets/icons/push-icon.png',
              data: { url: 'https://votre-application.com' },
            };

            // Envoyer la notification
            this.api.sendNotification({ subscription: res.payload, payload }).subscribe(
              (response) => {
                console.log('Notification envoyée:', response);
              },
              (error) => {
                console.error('Erreur lors de l\'envoi de la notification:', error);
              }
            );
          }
        });
      } catch (err) {
        console.error('Erreur dans le processus de relance:', err);
        // Arrêter l'intervalle en cas d'erreur critique
        this.stopRelance();
      }
    }, 10 * 1000); // Toutes les 10 secondes
  } catch (err) {
    console.error('Impossible de démarrer les relances :', err);
  }
}


  public async subscribeToPush() {
    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.PUBLIC_VAPID_KEY_OF_SERVER,
      });
      console.log('sub',sub);
      this.sub = sub;
      this.api.postSubscription(sub,false).subscribe(res=>{

        this.api.sendNotification(res.payload).subscribe(res => {
          console.log(res)
        })

      });

      
    } catch (err) {
      console.error('Could not subscribe due to:', err);
    }
  }

}
