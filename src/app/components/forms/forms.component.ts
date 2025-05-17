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
  @ViewChild('enquiryForm') enquiryForm!: ElementRef;

  constructor(
    private hostelService: HostelService,
    private globalService: GlobalService
  ) {}

  ngOnInit() {
    this.getHostelWhatsAppNumber();
  }

  async getHostelWhatsAppNumber() {
    try {
      const info = await this.hostelService.getHostelInfo();
      if (info && info['whatsappNumber']) {
        const formattedNumber = info['whatsappNumber'].toString().replace(/\D/g, '');
        this.whatsappNumber = formattedNumber.startsWith('57') ? formattedNumber : '57' + formattedNumber;
      }
    } catch (error) {
      console.error('Error fetching WhatsApp number:', error);
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
    const message = `Nueva consulta para habitación ${roomNumber}:\n\n` +
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
