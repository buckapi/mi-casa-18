import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Room } from '../interfaces/hostel.interface';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.lat:8045');
  }

  async getRooms(): Promise<Room[]> {
    return this.pb.collection('rooms').getFullList();
  }
}