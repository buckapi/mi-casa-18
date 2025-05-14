import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { CommonModule } from '@angular/common';
import { Room } from '../../interfaces/hostel.interface';
import { FormsComponent } from '../forms/forms.component';
import { Lightbox } from 'ngx-lightbox';
import { LightboxModule } from 'ngx-lightbox';
import { Subscription } from 'rxjs';
import { HostelService } from '../../services/hostel.service';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdditionalInfoComponent } from '../additional-info/additional-info.component';
import Compressor from 'compressorjs';

@Component({
  selector: 'app-room-detail',
  imports: [CommonModule 
    ,AdditionalInfoComponent
    ,FormsComponent, LightboxModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent implements OnInit, OnDestroy {
  @ViewChild('imageUpload') imageUpload: ElementRef;

editingRuleValue: string = '';
  hostelInfo: any;
  isAddingNewRule = false;
  updateForm: FormGroup;
  isLoggedIn = false;
  selectedImage: File | null = null;
  selectedImagePrev: string = '';
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
      this.updateForm = new FormGroup({
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        price: new FormControl('', Validators.required),
        image: new FormControl('', Validators.required),
      });
      this.imageUpload = new ElementRef('imageUpload');
  }
  async deleteImage(index: number, event: MouseEvent) {
    event.stopPropagation(); // Evitar que el click se propague al contenedor
    if (!this.globalService.selectedRoom) return;

    try {
        // Primero eliminamos la imagen del servidor
        const imageId = this.globalService.selectedRoom.images[index];
        await this.globalService.pb.collection('hostel_files').delete(imageId);

        // Luego actualizamos el array local
        this.globalService.selectedRoom.images.splice(index, 1);

        // Si eliminamos la imagen principal, actualizamos la vista
        if (index === 0 && this.globalService.selectedRoom.images.length > 0) {
            this.globalService.selectedRoom.images[0] = this.globalService.selectedRoom.images[0];
        }

        Swal.fire({
            title: '¡Éxito!',
            text: 'Imagen eliminada con éxito.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
    } catch (error) {
        console.error('Error al eliminar la imagen:', error);
        Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al eliminar la imagen.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}
onImageChange(event: any): void {
  const file = event.target.files[0];
  if (file) {
      this.selectedImage = file;

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
          this.selectedImagePrev = e.target.result;
      };
      reader.readAsDataURL(file);
  }
}

async addImage() {
  if (!this.selectedImage) {
      Swal.fire({
          title: 'Error!',
          text: 'Por favor, seleccione una imagen antes de continuar.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
      });
      return;
  }

  if (!this.globalService.selectedRoom) {
      Swal.fire({
          title: 'Error!',
          text: 'No hay una habitación seleccionada.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
      });
      return;
  }

  try {
      const roomId = this.globalService.selectedRoom.id;
      if (!roomId) {
          throw new Error('No se encontró el ID de la habitación');
      }

      new Compressor(this.selectedImage, {
          quality: 0.6,
          maxWidth: 800,
          maxHeight: 800,
          success: async (compressedFile: Blob) => {
              try {
                  const formData = new FormData();
                  formData.append('image', compressedFile, this.selectedImage?.name);

                  const result = await this.globalService.pb.collection('hostel_files').create(formData);
                  
                  if (result && this.globalService.selectedRoom) {
                      const imageField = result['image'] ? 'image' : 'file';
                      const imageUrl = `${this.globalService.pb.baseUrl}/api/files/${result.collectionId}/${result.id}/${result[imageField]}`;

                      // Inicializar el array si no existe
                      if (!this.globalService.selectedRoom.images) {
                          this.globalService.selectedRoom.images = [];
                      }
                      
                      // Agregar la nueva imagen
                      this.globalService.selectedRoom.images.push(imageUrl);

                      // Actualizar el registro
                      await this.globalService.pb.collection('rooms').update(roomId, {
                          images: this.globalService.selectedRoom.images
                      });

                      // Limpiar selección
                      this.selectedImage = null;
                      this.selectedImagePrev = '';
                      if (this.imageUpload?.nativeElement) {
                          this.imageUpload.nativeElement.value = '';
                      }

                      Swal.fire({
                          title: '¡Éxito!',
                          text: 'Imagen agregada con éxito.',
                          icon: 'success',
                          confirmButtonText: 'Aceptar'
                      });
                  }
              } catch (error) {
                  console.error('Error al procesar la imagen:', error);
                  Swal.fire({
                      title: 'Error',
                      text: 'Ocurrió un error al procesar la imagen.',
                      icon: 'error',
                      confirmButtonText: 'Aceptar'
                  });
              }
          },
          error: (err: any) => {
              console.error('Error al comprimir la imagen', err);
              Swal.fire({
                  title: 'Error',
                  text: 'Ocurrió un error al comprimir la imagen.',
                  icon: 'error',
                  confirmButtonText: 'Aceptar'
              });
          }
      });
  } catch (error) {
      console.error('Error al agregar la imagen:', error);
      Swal.fire({
          title: 'Error',
          text: (error as Error).message || 'Ocurrió un error al agregar la imagen.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
      });
  }
}

async updateImage() {
  if (!this.selectedImage) {
      Swal.fire({
          title: 'Error!',
          text: 'Por favor, seleccione una imagen antes de continuar.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
      });
      return;
  }

  if (!this.globalService.selectedRoom) {
      Swal.fire({
          title: 'Error!',
          text: 'No hay una habitación seleccionada.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
      });
      return;
  }

  try {
      const formData = new FormData();
      formData.append('image', this.selectedImage);

      const record = await this.globalService.pb.collection('hostel_files').update(this.currentRoomId, formData);

      if (record && this.globalService.selectedRoom) {
          const imageField = record['image'] ? 'image' : 'file';
          const imageUrl = `${this.globalService.pb.baseUrl}/api/files/${record.collectionId}/${record.id}/${record[imageField]}`;
          
          this.globalService.selectedRoom.images = [imageUrl];

          this.selectedImage = null;
          this.selectedImagePrev = '';
          if (this.imageUpload?.nativeElement) {
              this.imageUpload.nativeElement.value = '';
          }

          Swal.fire({
              title: '¡Éxito!',
              text: 'Imagen actualizada con éxito.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
          });
      }
  } catch (error) {
      console.error('Error al actualizar la imagen:', error);
      Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al actualizar la imagen.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
      });
  }
}


  async confirmDelete(index: number, event: MouseEvent) {
    event.stopPropagation();
    if (!this.globalService.selectedRoom) return;

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará la imagen permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            // Mostrar información de depuración
            console.log('ID de la habitación:', this.globalService.selectedRoom.id);
            console.log('Imágenes actuales:', this.globalService.selectedRoom.images);

            // Eliminamos la imagen del array local
            this.globalService.selectedRoom.images.splice(index, 1);

            // Si eliminamos la imagen principal, actualizamos la vista
            if (index === 0 && this.globalService.selectedRoom.images.length > 0) {
                this.globalService.selectedRoom.images[0] = this.globalService.selectedRoom.images[0];
            }

            // Actualizar el registro de la habitación
            const roomId = this.globalService.selectedRoom.id;
            const updatedRoom = await this.globalService.pb.collection('rooms').update(roomId as string, {
                images: this.globalService.selectedRoom.images
            });

            console.log('Respuesta del servidor:', updatedRoom);

            Swal.fire({
                title: '¡Éxito!',
                text: 'Imagen eliminada con éxito.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            console.error('Error details:', {
                roomId: this.globalService.selectedRoom?.id,
                images: this.globalService.selectedRoom?.images,
                currentRoomId: this.currentRoomId
            });
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al eliminar la imagen.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }
}

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
