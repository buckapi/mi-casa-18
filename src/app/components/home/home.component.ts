import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Room } from '../../interfaces/hostel.interface';
import { Subscription } from 'rxjs';
import { RoomService } from '../../services/rooms.service';
import { RoomSliderComponent } from "../../src/app/components/room-slider/room-slider.component";
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RoomSliderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  rooms: Room[] = [];
  private roomsSubscription?: Subscription;
  loading = true;

  constructor(
    public globalService: GlobalService,
    public roomsService: RoomService
  ) {}



  ngOnDestroy(): void {
    this.roomsSubscription?.unsubscribe();
  }
}