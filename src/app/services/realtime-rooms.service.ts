import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Room } from '../interfaces/hostel.interface';

@Injectable({
  providedIn: 'root',
})
export class RealtimeRoomsService implements OnDestroy {
  private pb: PocketBase;
  public roomsSubject = new BehaviorSubject<Room[]>([]);
  public rooms$: Observable<Room[]> = this.roomsSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.buckapi.lat:8045');
    this.subscribeToRooms();
  }

  private async subscribeToRooms() {
    try {
      this.pb.collection('rooms').subscribe('*', (e) => {
        this.handleRealtimeEvent(e);
      });
      this.updateRoomsList();
    } catch (error) {
      console.error('Error en la suscripción:', error);
    }
  }

  private handleRealtimeEvent(event: { action: string; record: any }) {
    this.updateRoomsList();
  }

  private async updateRoomsList() {
    try {
      const records = await this.pb.collection('rooms').getFullList<Room>(200, {
        sort: 'number',
        expand: 'amenities'
      });
      const normalizedRooms = records.map(record => this.normalizeRoom(record));
      this.roomsSubject.next(normalizedRooms);
    } catch (error) {
      console.error('Error actualizando lista de habitaciones:', error);
    }
  }

  private normalizeRoom(room: any): Room {
    return {
      id: room.id,
      number: room.number,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      beds: room.beds || [],
      amenities: room.amenities || [],
      images: room.images || [],
      roomType: room.roomType,
      available: room.available !== false
    };
  }

  getRoomById$(id: string): Observable<Room | null> {
    return this.rooms$.pipe(
      map(rooms => rooms.find(r => r.id === id) || null)
    );
  }

  getRoomById(id: string): Room | null {
    return this.roomsSubject.value.find(r => r.id === id) || null;
  }

  ngOnDestroy() {
    this.pb.collection('rooms').unsubscribe('*');
  }
}