import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { CommonModule } from '@angular/common';
import { Room } from '../../interfaces/hostel.interface';
import { FormsComponent } from '../forms/forms.component';
import { Lightbox } from 'ngx-lightbox';
import { LightboxModule } from 'ngx-lightbox';
import { Subscription } from 'rxjs';
import { HostelService } from '../../services/hostel.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdditionalInfoComponent } from '../additional-info/additional-info.component';

@Component({
  selector: 'app-room-detail',
  imports: [CommonModule 
    ,AdditionalInfoComponent
    ,FormsComponent, LightboxModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent implements OnInit, OnDestroy {

editingRuleValue: string = '';
  hostelInfo: any;
  isAddingNewRule = false;

  isLoggedIn = false;
  
  editingField: string | null = null;
  tempValue: any;
  currentRoomId: string = '';
  editingScheduleField: string | null = null;
  editingRuleIndex: number | null = null;
  editingNoteIndex: number | null = null;
  isAddingNewNote = false;
  private _albums: any = [];
  formType: string = 'booking';
  private roomSubscription: Subscription = Subscription.EMPTY;
  constructor(
    private _lightbox: Lightbox,
    private authService: AuthService,
    private hostelService: HostelService,
    public globalService: GlobalService) {
      this.isLoggedIn = this.authService.isAuthenticated();
      this.currentRoomId = this.globalService.selectedRoom?.id || '';
      this.loadHostelInfo();
  }
   // ... código existente ...

   navigateRoom(direction: 'prev' | 'next') {
    const currentIndex = this.globalService.currentRoomIndex;
    const totalRooms = this.globalService.rooms.length;
    
    let newIndex = currentIndex;
    
    if (direction === 'prev' && currentIndex > 0) {
      newIndex--;
    } else if (direction === 'next' && currentIndex < totalRooms - 1) {
      newIndex++;
    }

    if (newIndex !== currentIndex) {
      this.globalService.currentRoomIndex = newIndex;
      this.globalService.selectedRoom = this.globalService.rooms[newIndex];
      this.prepareLightboxData();
      this.globalService.scrollToTop();
    }
  }

  get isFirstRoom(): boolean {
    return this.globalService.currentRoomIndex === 0;
  }

  get isLastRoom(): boolean {
    return this.globalService.currentRoomIndex === this.globalService.rooms.length - 1;
  }


  // Métodos para Notas
  startEditingNote(index: number, currentValue: string) {
    this.editingNoteIndex = index;
    this.tempValue = currentValue;
  }

  async updateNote() {
    if (this.editingNoteIndex === null || !this.hostelInfo?.id) return;

    try {
      const updatedNotes = [...this.hostelInfo.notes];
      updatedNotes[this.editingNoteIndex] = this.tempValue.trim();
      
      await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
        notes: updatedNotes
      });
      
      this.hostelInfo.notes = updatedNotes;
      this.cancelNoteEdit();
    } catch (error) {
      console.error('Error actualizando nota:', error);
    }
  }

  cancelNoteEdit() {
    this.editingNoteIndex = null;
    this.tempValue = null;
  }

  startAddingNewNote() {
    this.isAddingNewNote = true;
    this.tempValue = '';
  }

  async saveNewNote() {
    if (!this.tempValue?.trim() || !this.hostelInfo?.id) return;

    try {
      const updatedNotes = [...this.hostelInfo.notes, this.tempValue.trim()];
      
      await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
        notes: updatedNotes
      });
      
      this.hostelInfo.notes = updatedNotes;
      this.cancelAddingNewNote();
    } catch (error) {
      console.error('Error agregando nueva nota:', error);
    }
  }

  cancelAddingNewNote() {
    this.isAddingNewNote = false;
    this.tempValue = null;
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
    this.loadHostelInfo();
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

async loadHostelInfo() {
  try {
    this.hostelInfo = await this.hostelService.getHostelInfo();
  } catch (error) {
    console.error('Error loading hostel info:', error);
  }
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


  startEditing(field: string, value: any) {
    this.editingField = field;
    this.tempValue = value;
  }

  cancelEditing() {
    this.editingField = null;
    this.tempValue = null;
  }
  private async handleSaveOperation(
    operation: () => Promise<void>,
    successMessage: string
  ) {
    // Mostrar loader
    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      timer: 30000 // Prevenir cierre automático
    });
  
    try {
      await operation();
      
      // Cerrar loader y mostrar éxito
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: successMessage,
        toast: true,
        position: 'top-end',
        timer: 1500,
        showConfirmButton: false
      });
      
    } catch (error) {
      // Cerrar loader y mostrar error
      Swal.close();
      this.handleError(error);
      throw error;
    }
  }
  
  async saveRoomField(field: string) {
    await this.handleSaveOperation(
      async () => {
        if (!this.globalService.selectedRoom?.id) return;
        
        await this.hostelService.updateRoomField(
          this.globalService.selectedRoom.id,
          field,
          this.tempValue
        );
        
        if (this.globalService.selectedRoom) {
          (this.globalService.selectedRoom as any)[field] = this.tempValue;
        }
        this.editingField = null;
      },
      'Cambios guardados exitosamente'
    );
  } 
  
async updateRule(index: number) {
  if (!this.hostelInfo?.id || index === null) return;

  try {
    const updatedRules = [...this.hostelInfo.rules];
    updatedRules[index] = this.editingRuleValue.trim();

    await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
      rules: updatedRules
    });
    
    this.hostelInfo.rules = updatedRules;
    this.cancelRuleEdit();
  } catch (error) {
    console.error('Error actualizando regla:', error);
  }
}

cancelRuleEdit() {
  this.editingRuleIndex = null;
  this.editingRuleValue = '';
}
  private showSuccessNotification(fieldName: string, newValue: any, context: 'room' | 'hostel' = 'room') {
    const fieldLabels: { [key: string]: string } = {
      price: 'Precio',
      description: 'Descripción',
      capacity: 'Capacidad',
      number: 'Número de habitación',
      'schedule.checkIn.time': 'Hora de Check-in',
      'schedule.checkOut.time': 'Hora de Check-out',
      rules: 'Regla',
      notes: 'Nota'
    };
  
    const friendlyName = fieldLabels[fieldName] || fieldName;
    let message = `${friendlyName} actualizado`;
  
    // Formatear valores especiales
    if (fieldName === 'price') {
      message += `: $${this.globalService.selectedRoom?.price} COP`;
    } else if (fieldName === 'capacity') {
      message += `: ${newValue} huéspedes`;
    } else if (fieldName.startsWith('schedule')) {
      message += ` a ${newValue}`;
    } else {
      message += ` correctamente`;
    }
  
    Swal.fire({
      icon: 'success',
      title: context === 'room' ? 'Habitación actualizada' : 'Configuración guardada',
      text: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      background: '#f0f9f0'
    });
  }
  private handleError(error: any) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar el cambio',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      background: '#f8d7da'
    });
  }

  // Métodos para hostelInfo
  startEditingSchedule(fieldPath: string) {
    this.editingScheduleField = fieldPath;
    this.tempValue = this.getNestedValue(this.hostelInfo.schedule, fieldPath);
  }

  startAddingNewRule() {
    this.isAddingNewRule = true;
    this.tempValue = '';
  }

  async saveNewRule() {
    if (!this.tempValue?.trim() || !this.hostelInfo?.id) return;

    try {
      const updatedRules = [...this.hostelInfo.rules, this.tempValue.trim()];
      
      await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
        rules: updatedRules
      });
      
      this.hostelInfo.rules = updatedRules;
      this.cancelAddingNewRule();
    } catch (error) {
      console.error('Error agregando nueva regla:', error);
    }
  }

  cancelAddingNewRule() {
    this.isAddingNewRule = false;
    this.tempValue = null;
  }


  async saveHostelInfo(field: string) {
    if (!this.hostelInfo?.id) return;

    try {
      const updateData = { [field]: this.tempValue };
      await this.hostelService.updateHostelInfo(this.hostelInfo.id, updateData);
      
      // Actualizar modelo local
      this.hostelInfo[field] = this.tempValue;
      this.resetEditingState();
    } catch (error) {
      console.error('Error updating hostel info:', error);
    }
  }
// Para horarios
async saveScheduleField(fieldPath: string) {
  if (!this.hostelInfo?.id) return;

  const updatedSchedule = { ...this.hostelInfo.schedule };
  this.setNestedValue(updatedSchedule, fieldPath, this.tempValue);

  try {
    await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
      schedule: updatedSchedule
    });
    
    this.hostelInfo.schedule = updatedSchedule;
    this.resetEditingState();
    
    this.showSuccessNotification(fieldPath, this.tempValue, 'hostel');
    
  } catch (error) {
    this.handleError(error);
  }
}

  private getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  private setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  public resetEditingState() {
    this.editingField = null;
    this.editingScheduleField = null;
    this.editingRuleIndex = null;
    this.editingNoteIndex = null;
    this.tempValue = null;
  }


  startEditingRule(index: number, currentValue: string) {
    this.editingRuleIndex = index;
    this.tempValue = currentValue;
  }

 
  // cancelRuleEdit() {
  //   this.editingRuleIndex = null;
  //   this.tempValue = null;
  // }
}
