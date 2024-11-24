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
  PUBLIC_VAPID_KEY_OF_SERVER = 'BGPhLwNAwJZguAqSPCFEbfN_TkH7tTpe5AVTvrQxAfWEb8-alQBJtx9VLsL3i2T1sWWOKYRabRWq1mRMocUDt4c';
  PRIVATE_VAPID_KEY_OF_SERVER = ''
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

  public async subscribeToPush() {
    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.PUBLIC_VAPID_KEY_OF_SERVER,
      });
      console.log('sub',sub);
      this.sub = sub;
      this.api.postSubscription(sub).subscribe(res=>{
        console.log('res',res);
      });
      
    } catch (err) {
      console.error('Could not subscribe due to:', err);
    }
  }

}
