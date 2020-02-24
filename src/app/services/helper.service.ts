import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { EnvService } from './env.service';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';
import { Category } from '../models/category';
import { Class } from '../models/class';
import { Entity } from '../models/entity';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(
    private http: HttpClient,
    private env: EnvService,
    private authService: AuthService,
    private alertService: AlertService) { }

  getToken() {
    return this.authService.getToken();
  }

  getCategories() : Observable<Category[]>{
    const headers = new HttpHeaders({
      'Accept': "application/json",
      'Authorization': "Bearer "+this.getToken()
    });
    return this.http.get<Category[]>(this.env.API_URL + 'helper/getCategories', { headers: headers })
    .pipe(
      tap(data => {
        //console.log(data);
        return data;
      })
    );
  }

  getClasses() : Observable<Class[]>{
    const headers = new HttpHeaders({
      'Accept': "application/json",
      'Authorization': "Bearer "+this.getToken()
    });
    return this.http.get<Class[]>(this.env.API_URL + 'helper/getClasses', { headers: headers })
    .pipe(
      tap(data => {
        //console.log(data);
        return data;
      })
    );
  }
  
  getEntityList(category_id: string, class_id: string) : Observable<Entity[]>{
    const headers = new HttpHeaders({
      'Accept': "application/json",
      'Authorization': "Bearer "+this.getToken()
    });
    let params = new HttpParams();
    params = params.append("category_id", category_id);
    params = params.append("class_id", class_id);
    return this.http.get<Entity[]>(this.env.API_URL + 'helper/getEntityList', { headers: headers, params: params })
    .pipe(
      tap(data => {
        //console.log(data);
        return data;
      })
    );
  }
  
  assignCardToEntity(id: number, card_id: number): Observable<any>{
    const headers = new HttpHeaders({
      'Accept': "application/json",
      'Authorization': "Bearer "+this.getToken()
    });

    return this.http.post(this.env.API_URL + 'helper/assignCardToEntity', 
    { id: id, card_id: card_id }, { headers: headers })
    .pipe(
      tap(data => {
        return data;
      },
      error => {
        console.log(error);
      }
      )
    );
  }
  
  replaceCardToEntity(id: number, card_id: number): Observable<any>{
    const headers = new HttpHeaders({
      'Accept': "application/json",
      'Authorization': "Bearer "+this.getToken()
    });

    return this.http.post(this.env.API_URL + 'helper/replaceCardToEntity', 
    { id: id, card_id: card_id }, { headers: headers })
    .pipe(
      tap(data => {
        return data;
      },
      error => {
        console.log(error);
      }
      )
    );
  }
  
  removeCardFromEntity(id: number): Observable<any>{
    const headers = new HttpHeaders({
      'Accept': "application/json",
      'Authorization': "Bearer "+this.getToken()
    });

    return this.http.post(this.env.API_URL + 'helper/removeCardFromEntity', 
    { id: id }, { headers: headers })
    .pipe(
      tap(data => {
        return data;
      },
      error => {
        console.log(error);
      }
      )
    );
  }
}
