import { Component, OnInit } from '@angular/core';
import { ScriptLoaderService } from './services/loader.service';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import * as jQuery from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import { GlobalService } from './services/global.service';
import { RoomsComponent } from './components/rooms/rooms.component';
import { AboutComponent } from './components/about/about.component';
import { RoomDetailComponent } from "./components/room-detail/room-detail.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HomeComponent,
    CommonModule,
    HttpClientModule,
    RoomsComponent,
    AboutComponent,
    RoomDetailComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'mi-casa';
  constructor(
    public globalService: GlobalService,
    private scriptLoader: ScriptLoaderService) {}
  ngOnInit() {
    this.loadScripts();
  }
  loadScripts() {
    const scripts = [  
      'js/jquery.min.js?ver=3.6.0',
      'js/jquery-migrate.min.js?ver=3.3.2',
      'js/ui/core.min.js', // jQuery UI Core
      'js/ui/datepicker.min.js', // jQuery UI Datepicker
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
      this.initializejQueryPlugins();
    })
    .catch(error => console.error(error));
}

initializejQueryPlugins() {
  // Inicialización manual si es necesario
  if (typeof (window as any)['jQuery'] !== 'undefined') {
    const $ = (window as any)['jQuery'] as typeof jQuery;
}
}

}