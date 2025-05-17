import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Room } from '../interfaces/hostel.interface';

@Injectable({
  providedIn: 'root'
})
export class HostelService {
  private pb: PocketBase;
  private static instance: HostelService;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    this.pb = new PocketBase('https://db.buckapi.lat:8045');
  }

  static getInstance(): HostelService {
    if (!HostelService.instance) {
      HostelService.instance = new HostelService();
    }
    return HostelService.instance;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      // Initialize PocketBase
      // Add any initialization logic here
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing service:', error);
      throw error;
    }
  }

  async initializeService(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize();
    }
    return this.initializationPromise;
  }

  async addRoom(data: Room): Promise<Room> {
    if (!this.initialized) {
      await this.initializeService();
    }
    return this.pb.collection('rooms').create(data);
  }

  async getRoomById(id: string): Promise<any> {
    if (!this.initialized) {
      await this.initializeService();
    }
    return this.pb.collection('rooms').getOne(id).then(room => {
      return room;
    });
  }

  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    if (!this.initialized) {
      await this.initializeService();
    }
    return this.pb.collection('rooms').update(id, data);
  }

  async deleteRoom(id: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initializeService();
    }
    return this.pb.collection('rooms').delete(id)
      .then(() => true)
      .catch(error => {
        console.error('Error deleting room:', error);
        return false;
      });
  }

  async getAllRooms(): Promise<Room[]> {
    if (!this.initialized) {
      await this.initializeService();
    }
    return this.pb.collection('rooms').getFullList();
  }

  async getHostelInfo(): Promise<any> {
    if (!this.initialized) {
      await this.initializeService();
    }
    return this.pb.collection('hostel_info').getOne('aapywf6y7nnxaxt');
  }

  async updateHostelInfo(id: string, data: any): Promise<any> {
    if (!this.initialized) {
      await this.initializeService();
    }
    return this.pb.collection('hostel_info').update(id, data);
  }

  async updateRoomField(roomId: string, field: string, value: any): Promise<Room> {
    if (!this.initialized) {
      await this.initializeService();
    }
    const updateData = { [field]: value };
    return this.pb.collection('rooms').update(roomId, updateData);
  }
}