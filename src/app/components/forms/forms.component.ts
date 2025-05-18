import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HostelService } from '../../services/hostel.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-forms',
  imports: [FormsModule, CommonModule],
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css']
})
export class FormsComponent implements OnInit {
  formType: string = 'booking';
  whatsappNumber: string = '';
  private initialized = false;
  private loading = false;
  private static instance: HostelService;
  public hostelService: HostelService;

  constructor(
    public globalService: GlobalService,
    
  ) {
    this.hostelService = HostelService.getInstance();
  }

  ngOnInit() {
    this.initialized = true;
    this.initializeService().then(() => {
      this.getHostelWhatsAppNumber();
    });
  }

  ngOnDestroy() {
    this.initialized = false;
    this.loading = false;
  }

  private async initializeService(): Promise<void> {
    try {
      await this.hostelService.initializeService();
    } catch (error) {
      console.error('Error initializing service:', error);
    }
  }

  private async getHostelWhatsAppNumber() {
    if (!this.initialized || this.loading) return;
    
    this.loading = true;
    try {
      const info = await this.hostelService.getHostelInfo();
      if (info && typeof info === 'object') {
        const whatsappNumber = info['whatsappNumber'];
        if (whatsappNumber) {
          const formattedNumber = whatsappNumber.toString().replace(/\D/g, '');
          this.whatsappNumber = formattedNumber.startsWith('57') ? formattedNumber : '57' + formattedNumber;
        }
      }
    } catch (error) {
      console.error('Error fetching WhatsApp number:', error);
      this.whatsappNumber = '';
    } finally {
      this.loading = false;
    }
  }

  async onSubmitBooking(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const roomNumber = this.globalService.selectedRoom?.number || 'Desconocido';
    
    // Format dates nicely
    const formatDate = (date: string) => {
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    // Get form values and handle null/empty values
    const getFormValue = (key: string) => {
      const value = formData.get(key);
      return value ? value.toString() : '0';
    };

  const message = `Nueva reserva desde www.micasa18.com:\n\n` +
                  `Fecha de entrada: ${formatDate(formData.get('start_date') as string)}\n\n` +
                  `Fecha de salida: ${formatDate(formData.get('end_date') as string)}\n\n` +
                  `Adultos: ${getFormValue('adult[]')}\n\n` +
                  `Niños: ${getFormValue('children[]')}\n\n` +
                  `Mascotas: ${getFormValue('pet[]')}\n\n` +
                  `Habitación: ${roomNumber}`;

    if (this.whatsappNumber) {
      try {
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
        alert('Error al abrir WhatsApp. Por favor, intente manualmente.');
      }
    } else {
      alert('No se pudo obtener el número de WhatsApp. Por favor, intente más tarde.');
    }
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Validate required fields
    const requiredFields = ['full-name', 'email-address', 'your-enquiry', 'tourmaster-require-acceptance'];
    const missingFields = requiredFields.filter(field => !formData.get(field));
    
    if (missingFields.length > 0) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    if (!this.whatsappNumber) {
      alert('No se pudo obtener el número de WhatsApp. Por favor, intente más tarde.');
      return;
    }

    // Get room number from GlobalService
    const roomNumber = this.globalService.selectedRoom?.number || 'Desconocido';
    if (!roomNumber || roomNumber === 'Desconocido') {
      alert('No se pudo obtener el número de habitación. Por favor, intente más tarde.');
      return;
    }

    // Format the message with room number
    const message = `Nueva consulta  desde www.micasa18.com:\n\n para habitación ${roomNumber}:\n\n` +
                    `Nombre: ${formData.get('full-name')}\n` +
                    `Email: ${formData.get('email-address')}\n` +
                    `Consulta: ${formData.get('your-enquiry')}`;
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  setFormType(type: string) {
    this.formType = type;
  }
}
