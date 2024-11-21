import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import config from '../../auth_config.json';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  postSubscription(subscription: any): Observable<any> {
    const url = `${config.apiUri}/api/subscription`; 
    return this.http.post<any>(url, subscription);
  }

  ping$() {
    return this.http.get(`${config.apiUri}/api/external`);
  }
}
