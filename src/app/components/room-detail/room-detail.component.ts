import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { CommonModule } from '@angular/common';
import { Room } from '../../interfaces/hostel.interface';
import { FormsComponent } from '../forms/forms.component';
import { Lightbox } from 'ngx-lightbox';
import { LightboxModule } from 'ngx-lightbox';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-room-detail',
  imports: [CommonModule ,FormsComponent, LightboxModule ],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent implements OnInit, OnDestroy {

  private _albums: any = [];
  formType: string = 'booking';
  private roomSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private _lightbox: Lightbox,
    public globalService: GlobalService) {
  }

  private prepareLightboxData(): void {
    this._albums = [];
    const room = this.globalService.selectedRoom;
    
    if (!room) {
      this.setDefaultImage();
      return;
    }

    if (room.images?.length) {
      this._albums = room.images.map((img, index) => ({
        src: img,
        caption: ` ${room.number || 'Sin número'}`,
        thumb: img
      }));
    } else {
      this.setDefaultImage();
    }
  }

  private setDefaultImage(): void {
    this._albums = [{
      src: 'assets/images/default-room.jpg',
      caption: 'Imagen no disponible',
      thumb: 'assets/images/default-room.jpg'
    }];
  }


  openLightbox(index: number = 0): void {
    if (this._albums.length > 0 && index < this._albums.length) {
      this._lightbox.open(this._albums, index, {
        centerVertically: true,
        showImageNumberLabel: true,
        alwaysShowNavOnTouchDevices: true,
        fadeDuration: 0.2,
        resizeDuration: 0.2,
        disableScrolling: true,
        wrapperClass: 'lightbox-wrapper-custom' // Clase adicional si necesitas personalizar
      });
    }
  }

  closeLightbox(): void {
    this._lightbox.close();
  }



  ngOnInit() {
    this.prepareLightboxData();
    
    this.globalService.selectedRoom = {
      number: '',
      price: 0,
      capacity: 0,
      beds: [],
      amenities: [],
      images: [],
      featuredImage: '',
      available: true,
      size: ''
  };
  this.roomSubscription = this.globalService.roomChanged.subscribe(() => {
    this.prepareLightboxData();
  });
  }

  ngOnDestroy() {
    // Limpiar la suscripción
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
  }
  setFormType(type: string) {
    this.formType = type;
  }
}
