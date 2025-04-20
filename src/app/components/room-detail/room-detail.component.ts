import { Component } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { CommonModule } from '@angular/common';
import { Room } from '../../interfaces/hostel.interface';
import { FormsComponent } from '../forms/forms.component';

@Component({
  selector: 'app-room-detail',
  imports: [CommonModule ,FormsComponent ],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent {
  room: Room | null = null;
  formType: string = 'booking';
  constructor(public globalService: GlobalService) { }
  ngOnInit() {
    this.globalService.selectedRoom = null;
    
  }
  setFormType(type: string) {
    this.formType = type;
  }
}
