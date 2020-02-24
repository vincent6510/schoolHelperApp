import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, map } from 'rxjs/operators';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { EnvService } from './env.service';
import { User } from '../models/user';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  token:any;
  constructor(
    private http: HttpClient,
    private storage: NativeStorage,
    private env: EnvService,
    private alertService: AlertService
  ) { }
  login(username: String, password: String) {
    //this.alertService.presentToast('sending request to ' + this.env.API_URL + 'mobileLogin');
    return this.http.post(this.env.API_URL + 'mobileLogin',
      {username: username, password: password, provider:'mobileusers', grant_type:'password'}
    ).pipe(
      tap(token => {
        // this.alertService.presentToast(token["token"]);
        this.storage.setItem('token', token)
        .then(
          () => {
            this.storage.setItem('schoolHelperAppUsername', username);
            //this.alertService.presentToast(token);
            console.log('Token Stored');
          },
          error => {
            //this.alertService.presentToast('Error storing item ' + error);
            console.error('Error storing item', error)
          }
        );
        this.token = token;
        this.isLoggedIn = true;
        return token;
      },
      error => {
        this.alertService.presentToast(error.status);
        console.error('Api error', error)
      }),
    );
  }
  register(fName: String, lName: String, email: String, password: String) {
    return this.http.post(this.env.API_URL + 'auth/register',
      {fName: fName, lName: lName, email: email, password: password}
    )
  }
  logout() {
    //this.alertService.presentToast(this.token["token"]);
    const headers = new HttpHeaders({
      //'Authorization': this.token["token_type"]+" "+this.token["access_token"]
      'Accept': "application/json",
      'Authorization': "Bearer "+this.token["token"]
    });
    return this.http.get(this.env.API_URL + 'mobileLogout', { headers: headers })
    .pipe(
      tap(data => {
        this.storage.remove("token");
        this.isLoggedIn = false;
        delete this.token;
        return data;
      })
    )
  }
  user() {
    const headers = new HttpHeaders({
      //'Authorization': this.token["token_type"]+" "+this.token["access_token"]
      'Accept': "application/json",
      'Authorization': "Bearer "+this.token["token"]
    });
    return this.http.get<User>(this.env.API_URL + 'mobileuser', { headers: headers })
    .pipe(
      tap(data => {
        console.log(data);
        return data["user"];
      })
    )
  }
  getToken() {
    if(this.token == null) {
      return null;
    }
    return this.token["token"];

    // return this.storage.getItem('token').then(
    //   data => {
    //     this.token = data;
    //     if(this.token != null) {
    //       this.isLoggedIn=true;
    //     } else {
    //       this.isLoggedIn=false;
    //     }
    //   },
    //   error => {
    //     this.token = null;
    //     this.isLoggedIn=false;
    //   }
    // );
  }
  
  getStorageUsername() {
    return this.storage.getItem('schoolHelperAppUsername');
  }
}