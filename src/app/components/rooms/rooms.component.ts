import { Component } from '@angular/core';
import { RoomService } from '../../services/rooms.service';
import { Room } from '../../interfaces/hostel.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent {
  rooms: Room[] = [];

  constructor(private roomService: RoomService) { }
  async ngOnInit(): Promise<void> {
    try {
      this.rooms = await this.roomService.getRooms();
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      this.loading = false;
    }
  }

  loading: boolean = true;

}
