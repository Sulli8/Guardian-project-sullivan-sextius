import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import config from '../../auth_config.json';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // POST request for subscription
  postSubscription(subscription: any): Observable<any> {
    const url = `${config.apiUri}/api/subscription`; 
    console.log("SOUSCRIPTION : ", subscription);
    return this.http.post<any>(url, subscription);
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

    // DELETE request for deleting a prescription
    deletePrescription(id: number): Observable<any> {
      const url = `${config.apiUri}/api/prescriptions/${id}`; // Assurez-vous que l'API accepte les requêtes DELETE sur ce point de terminaison
      return this.http.delete<any>(url);
    }
}
