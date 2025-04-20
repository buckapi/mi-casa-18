import { Component, OnInit, OnDestroy } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Room } from '../../interfaces/hostel.interface';
import { Subscription } from 'rxjs';
import { RoomService } from '../../services/rooms.service';

@Component({
  selector: 'app-room-slider',
  imports: [CommonModule],
  templateUrl: './room-slider.component.html',
  styleUrl: './room-slider.component.css'
})
export class RoomSliderComponent {
  rooms: Room[] = [];
  private roomsSubscription?: Subscription;
  loading = true;

  constructor(
    public roomsService: RoomService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const rooms = await this.roomsService.getRooms();
      this.rooms = rooms;
      console.log('Rooms loaded:', this.rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.roomsSubscription?.unsubscribe();
  }
}