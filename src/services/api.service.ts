import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import config from '../../auth_config.json';
import { Observable } from 'rxjs';
import { Question } from 'src/models/question';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  displayMessage = false;
  NotifsAllowed = false;
  sub: any;
  private relanceIntervalId: any = null;
  PUBLIC_VAPID_KEY_OF_SERVER = 'BGPhLwNAwJZguAqSPCFEbfN_TkH7tTpe5AVTvrQxAfWEb8-alQBJtx9VLsL3i2T1sWWOKYRabRWq1mRMocUDt4c';
  notification_data: any;
  constructor(readonly swPush: SwPush,private router: Router,private http: HttpClient) {}

 
  getNotifications():Observable<any>{
    return this.http.get(`${config.apiUri}/api/get-notifications`);
  }

  getPrescription():Observable<any>{
    return this.http.get(`${config.apiUri}/api/get-prescriptions`);
  }

  getUser():Observable<any>{
    return this.http.get(`${config.apiUri}/api/get-user`);
  }

  handleRedirection(valeur: boolean): void {
    
    if (valeur) {
      // Si 'valeur' est true, redirigez vers la page d'accueil
     
      this.router.navigate(['/home-page']);
     
    } else {
      // Si 'valeur' est false, redirigez vers la page du questionnaire
      this.router.navigate(['/questionnaire']);
    }
  }

  submitResponses(responses: any): Observable<any> {
    return this.http.post(`${config.apiUri}/api/responses`, responses);
  }

  checkIfUserHasAnswered(): Observable<any> {
    return this.http.get(`${config.apiUri}/api/check-answers`);
  }

  checkIsSubsribe(): Observable<any> {
    return this.http.get(`${config.apiUri}/api/is-subscribe`);
  }

  checkRelanceNotification(){
    return this.http.get(`${config.apiUri}/api/check-notifications`);
  }
  unSubsribeNotifications(sub:any): Observable<any> {
    return this.http.put<any>(`${config.apiUri}/api/unsubscribe`, { webpushtoken: sub });
  }
  async unsubscribeFromNotifications() {
    const sub = await this.swPush.requestSubscription({
      serverPublicKey: this.PUBLIC_VAPID_KEY_OF_SERVER,
    });
    this.unSubsribeNotifications(sub).subscribe(res=>{

    })
  }
  // POST request for subscription
  putSubscription(subscription: any,relance:boolean): Observable<any> {
    const object = {
      webpushtoken:subscription
    }
    const url = `${config.apiUri}/api/subscription`; 
    return this.http.put<any>(url,object);
  }
  // Récupérer toutes les questions depuis l'API
  getQuestions(): Observable<Question[]> {
    const url = `${config.apiUri}/api/questions`
    return this.http.get<Question[]>(url);
  }

  // GET request for ping
  ping$(): Observable<any> {
    return this.http.get(`${config.apiUri}/api/external`);
  }

  // GET request for medications
  getMedications(): Observable<any> {
    const url = `${config.apiUri}/api/medicaments`; // URL de l'API pour récupérer les médicaments
    return this.http.get<any>(url);
  }

  public async subscribeToPush(){
    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.PUBLIC_VAPID_KEY_OF_SERVER,
      });
      console.log('sub',sub);
      this.sub = sub;
      this.putSubscription(sub,false).subscribe(res=>{

      });      
    } catch (err) {
      console.error('Could not subscribe due to:', err);
    }
  }
  async checkNotify():Promise<any>{
    const sub = await this.swPush.requestSubscription({
      serverPublicKey: this.PUBLIC_VAPID_KEY_OF_SERVER,
    });
    const object = {
      webpushtoken:sub,
    }
    const url = `${config.apiUri}/api/check-subscribed-notify`; // URL de l'API pour envoyer les prescriptions
    return this.http.post<any>(url,object).toPromise();
  }
  // POST request for prescriptions
  postPrescriptions(prescription: any): Observable<any> {
    const url = `${config.apiUri}/api/prescriptions`; // URL de l'API pour envoyer les prescriptions
    console.log("PRESCRIPTION : ", prescription);
    return this.http.post<any>(url, prescription);
  }

  // GET request for list of prescriptions
  getPrescriptions(): Observable<any> {
    const url = `${config.apiUri}/api/list-prescriptions`; // URL de l'API pour récupérer la liste des prescriptions
    return this.http.get<any>(url);
  }

    // GET request for list of prescriptions
    postRelances(subscription: any): Observable<any> {
      const url = `${config.apiUri}/api/start-relance`; // URL de l'API pour récupérer la liste des prescriptions
      return this.http.post<any>(url,subscription);
    }

    // DELETE request for deleting a prescription
    deletePrescription(id: number): Observable<any> {
      const url = `${config.apiUri}/api/prescriptions/${id}`; // Assurez-vous que l'API accepte les requêtes DELETE sur ce point de terminaison
      return this.http.delete<any>(url);
    }



}
