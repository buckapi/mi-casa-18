import { Component } from '@angular/core';
import { RoomService } from '../../services/rooms.service';
import { Room } from '../../interfaces/hostel.interface';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent {
  rooms: Room[] = [];

  constructor(private roomService: RoomService,
    public globalService: GlobalService
  ) { }
  async ngOnInit(): Promise<void> {
    try {
      this.rooms = await this.roomService.getRooms();
      console.log('Rooms loaded:', this.rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      this.loading = false;
    }
  }

  goToRoomDetail(room: Room) {
    this.globalService.scrollToTop();

    this.globalService.activeRoute = 'room-detail';
    this.globalService.selectedRoom = room;
  }

  loading: boolean = true;

}
