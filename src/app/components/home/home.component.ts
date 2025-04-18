import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { Room } from '../../interfaces/hostel-types.interface';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  private roomsSubscription!: Subscription;
constructor(
  public globalService: GlobalService
){}

ngOnInit() {
  this.roomsSubscription = this.globalService.rooms$.subscribe(rooms => {
    this.globalService.rooms = rooms;
  });
}

ngOnDestroy() {
  if (this.roomsSubscription) {
    this.roomsSubscription.unsubscribe();
  }
}
}
