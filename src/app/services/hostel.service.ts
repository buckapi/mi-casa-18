import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Room } from '../interfaces/hostel.interface';

@Injectable({
  providedIn: 'root'
})
export class HostelService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.lat:8045');
  }

  addRoom(data: Room): Promise<Room> {
    return this.pb.collection('rooms').create(data);
  }

  getRoomById(id: string) {
    return this.pb.collection('rooms').getOne(id).then(room => {
      return room;
    });
  }

  updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    return this.pb.collection('rooms').update(id, data);
  }

  deleteRoom(id: string): Promise<boolean> {
    return this.pb.collection('rooms').delete(id)
      .then(() => true)
      .catch(error => {
        console.error('Error deleting room:', error);
        return false;
      });
  }
  getAllRooms(): Promise<Room[]> {
    return this.pb.collection('rooms').getFullList();
  }
  getHostelInfo() {
    return this.pb.collection('hostel_info').getFirstListItem('');
  }
  updateHostelInfo(id: string, data: any): Promise<any> {
    return this.pb.collection('hostel_info').update(id, data);
  }

  async updateRoomField(roomId: string, field: string, value: any): Promise<Room> {
    const updateData = { [field]: value };
    return this.pb.collection('rooms').update(roomId, updateData);
  }
}