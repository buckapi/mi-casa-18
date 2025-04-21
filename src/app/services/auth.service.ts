import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pb: PocketBase;
  private readonly AUTH_KEY = 'pb_auth_data';

  constructor(private globalService: GlobalService) {
    this.pb = new PocketBase('https://db.buckapi.lat:8045');
    this.restoreAuth();
  }

  private restoreAuth() {
    const authData = localStorage.getItem(this.AUTH_KEY);
    if (authData) {
      try {
        const { token, model } = JSON.parse(authData);
        this.pb.authStore.save(token, model);
      } catch (e) {
        this.clearAuth();
      }
    }
  }

  async login(username: string, password: string): Promise<{ 
    success: boolean; 
    error?: string;
    user?: any;
  }> {
    try {
      const authData = await this.pb.collection('users').authWithPassword(username, password);
      
      this.saveAuthData(authData.token, authData.record);
      
      return {
        success: true,
        user: authData.record
      };
    } catch (error) {
      this.clearAuth();
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  private saveAuthData(token: string, model: any) {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify({
      token: token,
      model: model
    }));
  }

  private getErrorMessage(error: any): string {
    if (!(error instanceof Error)) return 'Error desconocido';
    
    if (error.message.includes('Failed to fetch')) {
      return 'Error de conexión con el servidor';
    } else if (error.message.includes('Invalid credentials')) {
      return 'Usuario o contraseña incorrectos';
    }
    return error.message || 'Error al iniciar sesión';
  }

 /*  logout() {
    this.pb.authStore.clear();
    this.clearAuth();
    this.globalService.activeRoute = 'home';
  } */
  logout() {
    this.pb.authStore.clear();
    this.clearAuth();
    this.globalService.activeRoute = 'home';
    
    // Limpiar cualquier estado relacionado
    localStorage.removeItem('pb_auth_data');
    localStorage.removeItem('pb_auth_token');
    localStorage.removeItem('user_id');
  }
  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  isLogged(): boolean {
    return this.isAuthenticated();
  }

  getUser(): any {
    return this.pb.authStore.model;
  }

  getUserId(): string | null {
    return this.pb.authStore.model?.id || null;
  }

  getToken(): string | null {
    return this.pb.authStore.token;
  }

  private clearAuth() {
    localStorage.removeItem(this.AUTH_KEY);
  }
}