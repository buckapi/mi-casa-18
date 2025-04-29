import { Injectable } from '@angular/core';
import { Room } from '../interfaces/hostel.interface';
import { RealtimeRoomsService } from './realtime-rooms.service';
import {ROOM_TYPES,  RoomType } from '../constants/hostel.constants';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CONTACT_INFO } from '../constants/hostel.constants';
import { Observable,Subject } from 'rxjs';
import { HostelService } from './hostel.service';
@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  searchTerm: string = "";
  public _selectedRoom: Room | null = null;
  currentRoomIndex: number = 0;
  // selectedRoom: Room | null = null;
  room: Room | null = null;
  activeRoute: string = "home";
  dashboardOption: string = "";
  params: any = {};
  roomTypeSelected: boolean = false;
  typeIdSelected: string = ROOM_TYPES.TODAS.id;
  contactInfo = CONTACT_INFO;
  isModalOpen = false;
  rooms$: Observable<Room[]>;
  rooms: Room[] = []; 
  roomChanged = new Subject<void>(); // Subject para notificar cambios
  get selectedRoom(): Room | null {
    return this._selectedRoom;
  }

  set selectedRoom(room: Room | null) {
    this._selectedRoom = room;
    this.roomChanged.next(); // Notificar cuando cambia
  }
  constructor(
    private sanitizer: DomSanitizer,
    public hostelService: HostelService,
    public realtimeRoomsService: RealtimeRoomsService
  ) {
    this.rooms$ = this.realtimeRoomsService.roomsSubject.asObservable();
    this.rooms$.subscribe(rooms => {
      this.rooms = rooms;
    });
    this.hostelService.getAllRooms().then(rooms => {
      this.rooms = rooms;
    });
    console.log('habitaciones', this.rooms);
  }

  getWhatsappUrl(room?: Room): SafeUrl {
    const currentRoom = room || this.room;
    if (!currentRoom) return '';
    const message = this.getWhatsAppMessage(currentRoom);
    const url = `https://wa.me/${this.contactInfo.PHONE1}?text=${message}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getWhatsAppMessage(room: Room): string {
    const message = `¡Hola! Estoy interesado en la habitación ${room.number}:
${room.description}

¿Podrían darme más información sobre disponibilidad y precios?
Gracias!`;
    return encodeURIComponent(message);
  }

  getRoomType(id: string): RoomType | null {
    return Object.values(ROOM_TYPES).find(type => type.id === id) || null;
  }
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
