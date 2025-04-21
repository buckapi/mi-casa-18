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
    this.authService.logout();
    // Recargar la página para asegurar que todo estado se reinicie
    window.location.reload();
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
}