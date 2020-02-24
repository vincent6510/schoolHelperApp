import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  // API_URL = 'http://192.168.1.100:80/api/';
  API_URL = 'https://myfintest.ddns.net:8877/api/';
  constructor() { }
}
