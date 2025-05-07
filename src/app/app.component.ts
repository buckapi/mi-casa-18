import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from './services/loader.service';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { GlobalService } from './services/global.service';
import { RoomsComponent } from './components/rooms/rooms.component';
import { AboutComponent } from './components/about/about.component';
import { RoomDetailComponent } from "./components/room-detail/room-detail.component";
import { ContactComponent } from './components/contact/contact.component';
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HomeComponent,
    CommonModule,
    ContactComponent,
    HttpClientModule,
    RoomsComponent,
    AboutComponent,
    RoomDetailComponent,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  username: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string | null = null;
  whatsappNumber: string = '573007319612';
  isModalOpen = false;
  isMobileMenuOpen = false;
  
  constructor(
    public globalService: GlobalService,
    private scriptLoader: ScriptLoaderService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadScripts();
    this.setupLoginModal();
    this.checkUrlParams();
    this.checkAuthStatus();
    // Add click event listener to close menu when clicking outside
    document.addEventListener('click', (event: MouseEvent) => {
      const menu = document.getElementById('hotale-mobile-menu');
      const button = document.querySelector('.hotale-mobile-button-hamburger');
      
      if (this.isMobileMenuOpen && menu && button) {
        const isClickInsideMenu = menu.contains(event.target as Node);
        const isClickInsideButton = button.contains(event.target as Node);
        
        if (!isClickInsideMenu && !isClickInsideButton) {
          this.toggleMobileMenu();
        }
      }
    });
  }
  ngOnDestroy() {
    // Remove event listener when component is destroyed
    document.removeEventListener('click', () => {});
  }

  loadScripts() {
    const scripts = [  
      'js/jquery.min.js?ver=3.6.0',
      'js/jquery-migrate.min.js?ver=3.3.2',
      'js/ui/core.min.js',
      'js/ui/datepicker.min.js',
      'js/plugins/tourmaster/tourmaster.js',
      'js/plugins/tourmaster/room/tourmaster-room.js',
      'js/plugins/jquery.mmenu.js',
      'js/plugins/jquery.superfish.js',
      'js/plugins/jquery.flexslider-min.js',
      'js/plugins/script-core.js',
      'js/plugins/goodlayers-core/plugins/script.js',
      'js/plugins/goodlayers-core/include/js/page-builder.js',
    ];

    this.scriptLoader.loadScriptsInOrder(scripts)
      .then(() => {
        console.log('Todos los scripts cargados');
      })
      .catch(error => console.error(error));
  }

  setupLoginModal() {
    // Configurar el cierre del modal
    document.querySelector('.tourmaster-lightbox-close')?.addEventListener('click', () => {
      this.resetLoginForm();
    });
  }

  private checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const password = urlParams.get('password');

    if (username && password) {
      this.username = username;
      this.password = password;
      this.login(new Event('submit'));
    }
  }

  private checkAuthStatus() {
    if (this.authService.isAuthenticated()) {
      this.globalService.activeRoute = 'rooms';
    }
  }

  async login(event: Event) {
    event.preventDefault();
    this.errorMessage = null;
  
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }
  
    this.loading = true;
    
    try {
      const isLoggedIn = await this.authService.login(this.username, this.password);
      
      if (isLoggedIn) {
        this.closeLoginModal();
        this.globalService.activeRoute = 'rooms';
        // Limpiar parámetros de la URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        this.errorMessage = 'Credenciales incorrectas';
      }
    } catch (error) {
      this.errorMessage = 'Error en el servidor';
      console.error('Login error:', error);
    } finally {
      this.loading = false;
    }
  }
  logout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Realmente deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'swal-confirm-button',
        cancelButton: 'swal-cancel-button'
      },
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        window.location.reload();
      }
    });
  
    // Actualizar estilos después de que el modal esté visible
    setTimeout(() => {
      const confirmButton = document.querySelector('.swal2-confirm') as HTMLElement;
      const cancelButton = document.querySelector('.swal2-cancel') as HTMLElement;
      
      if (confirmButton) {
        confirmButton.style.backgroundColor = '#000000';
        confirmButton.style.color = '#ffffff';
        confirmButton.style.border = '2px solid #000000';
        confirmButton.style.padding = '12px 24px';
        confirmButton.style.borderRadius = '4px';
        confirmButton.style.cursor = 'pointer';
        confirmButton.style.fontSize = '14px';
        confirmButton.style.marginRight = '15px';
        confirmButton.style.marginLeft = '15px';
        
        // Agregar efecto hover
        confirmButton.addEventListener('mouseenter', () => {
          confirmButton.style.backgroundColor = '#ffffff';
          confirmButton.style.color = '#000000';
        });
        
        confirmButton.addEventListener('mouseleave', () => {
          confirmButton.style.backgroundColor = '#000000';
          confirmButton.style.color = '#ffffff';
        });
      }
  
      if (cancelButton) {
        cancelButton.style.backgroundColor = '#ffffff';
        cancelButton.style.color = '#000000';
        cancelButton.style.border = '2px solid #000000';
        cancelButton.style.padding = '12px 24px';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.fontSize = '14px';
        cancelButton.style.marginLeft = '15px';
        
        // Agregar efecto hover
        cancelButton.addEventListener('mouseenter', () => {
          cancelButton.style.backgroundColor = '#000000';
          cancelButton.style.color = '#ffffff';
        });
        
        cancelButton.addEventListener('mouseleave', () => {
          cancelButton.style.backgroundColor = '#ffffff';
          cancelButton.style.color = '#000000';
        });
      }
    }, 100);
  }
  public closeLoginModal() {
    // Simular clic en el botón de cerrar
    const closeButton = document.querySelector('.tourmaster-lightbox-close') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  }

  private resetLoginForm() {
    this.username = '';
    this.password = '';
    this.errorMessage = null;
    this.loading = false;
  }
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const menu = document.getElementById('hotale-mobile-menu');
    if (menu) {
      menu.style.display = this.isMobileMenuOpen ? 'block' : 'none';
    }
  }
  
  // En app.component.ts
openLoginModal() {
  const body = document.body;
  body.classList.add('tourmaster-lightbox');
  body.classList.add('tourmaster-lightbox-active');
  const loginModal = document.querySelector('[data-tmlb-id="login"]');
  if (loginModal) {
    loginModal.classList.add('tourmaster-lightbox-active');
  }
}

public closeModal() {
  // Cerrar el modal
  const closeButton = document.querySelector('.tourmaster-lightbox-close') as HTMLElement;
  if (closeButton) {
      closeButton.click();
  }
  
  // Cerrar el menú móvil si está abierto
  if (this.isMobileMenuOpen) {
      this.toggleMobileMenu();
  }
}




}