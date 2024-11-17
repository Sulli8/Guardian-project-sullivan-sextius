import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userData: User; // Stockage des données utilisateur dans le service
  
  constructor(private http: HttpClient) {}

    // Méthode pour soumettre les données utilisateur à l'API
    submitUserData(): Observable<any> {
      console.log("ENTER SUBMIT")
      return this.getUserData().pipe(
        switchMap(user => {
          // Définir les en-têtes de la requête
          const headers = new HttpHeaders({
            'Content-Type': 'application/json'
          });
  
          // Effectuer la requête POST
          return this.http.post('http://localhost:3001/api/create_user', user, { headers });
        })
      );
    }

  // Méthode pour mettre à jour les données utilisateur
  updateUserData(data: any) {
    this.userData = { ...this.userData, ...data }; // Fusionne les nouvelles données
  }

  getUserData(): Observable<User> {
    return of(this.userData); // Retourne userData sous forme d'Observable
  }


}
