import { RoomType, AmenityType } from '../constants/hostel.constants';

export interface BedInfo {
  type: 'doble' | 'sencilla' | 'camarote';
  quantity: number;
}

export interface Room {
  id?: string;
  number: string; // "HAB 2", "HAB 3", etc.
  name?: string;
  description: string;
  price?: number;
  capacity: number;
  beds: BedInfo[];
  amenities: AmenityType[];
  images?: string[];
  featuredImage?: string;
  available?: boolean;
  size?: string; // "20m²"
  
  /* Tipos fijos (usando constantes) */
  roomType?: RoomType;
  
  /* Otros campos flexibles */
  features?: string[]; // Características adicionales
}