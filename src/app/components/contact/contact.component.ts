import { Component, OnInit, OnDestroy } from '@angular/core';
import { HostelService } from '../../services/hostel.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit, OnDestroy {
  whatsappNumber: string = '';
  private initialized = false;
  private loading = false;
  private static instance: HostelService;
  public hostelService: HostelService;

  constructor() {
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

  async getHostelWhatsAppNumber() {
    if (!this.initialized || this.loading) return;
    
    this.loading = true;
    try {
      console.log('Fetching hostel info...');
      const info = await this.hostelService.getHostelInfo();
      console.log('Hostel info:', info);
      
      if (info && typeof info === 'object') {
        const whatsappNumber = info['whatsappNumber'];
        console.log('Raw WhatsApp number:', whatsappNumber);
        
        if (whatsappNumber) {
          const formattedNumber = whatsappNumber.toString().replace(/\D/g, '');
          console.log('Formatted number:', formattedNumber);
          
          this.whatsappNumber = formattedNumber.startsWith('57') ? formattedNumber : '57' + formattedNumber;
          console.log('Final WhatsApp number:', this.whatsappNumber);
        } else {
          console.error('WhatsApp number not found in hostel info:', info);
        }
      } else {
        console.error('Invalid hostel info response:', info);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp number:', error);
      this.whatsappNumber = '';
    } finally {
      this.loading = false;
    }
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const message = `Nuevo mensaje de contacto:\n\n` +
                    `Nombre: ${formData.get('Name')}\n` +
                    `Ciudad: ${formData.get('City')}\n` +
                    `Email: ${formData.get('Email')}\n` +
                    `Mensaje: ${formData.get('Message')}`;

    if (this.whatsappNumber) {
      try {
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
        console.log('Opening WhatsApp URL:', whatsappUrl);
        window.open(whatsappUrl, '_blank');
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
        alert('Error al abrir WhatsApp. Por favor, intente manualmente.');
      }
    } else {
      alert('No se pudo obtener el número de WhatsApp. Por favor, intente más tarde.');
    }
  }
}
