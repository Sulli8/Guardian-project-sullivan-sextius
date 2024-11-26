import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import config from '../../auth_config.json';
import { Observable } from 'rxjs';
import { Question } from 'src/models/question';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private router: Router,private http: HttpClient) {}

  handleRedirection(valeur: boolean): void {
    console.log(valeur)
    if (valeur) {
      // Si 'valeur' est true, redirigez vers la page d'accueil
      this.router.navigate(['/home-page']);
    } else {
      // Si 'valeur' est false, redirigez vers la page du questionnaire
      this.router.navigate(['/questionnaire']);
    }
  }


  sendNotification(notifications:any) {
    console.log(notifications,"API")
    return this.http.post<any>(`${config.apiUri}/api/notify`, notifications);
  }

  submitResponses(responses: any): Observable<any> {
    return this.http.post(`${config.apiUri}/api/responses`, responses);
  }

  checkIfUserHasAnswered(): Observable<any> {
    return this.http.get(`${config.apiUri}/api/check-answers`);
  }
  // POST request for subscription
  postSubscription(subscription: any,relance:boolean): Observable<any> {
    const object = {
      webpushtoken:subscription,
      relances: relance
    }
    const url = `${config.apiUri}/api/subscription`; 
    console.log("SOUSCRIPTION : ", subscription);
    return this.http.post<any>(url, subscription);
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
