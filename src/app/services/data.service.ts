import { Injectable } from '@angular/core';
import { Entity } from '../models/entity';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  entity: Entity;
  constructor() { }

  setData(data: Entity) {
    this.entity = data;
  }

  getData() {
    return this.entity;
  }

  clearData() {
    this.entity = null;
  }
}
