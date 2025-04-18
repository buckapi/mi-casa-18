export interface IdNameBase {
    id: string;
    name: string;
  }
  
  export interface IdNameIconBase extends IdNameBase {
    icon: string;
  }
  
  /* Tipos dinámicos (se cargan desde la BD) */
  export interface RoomType extends IdNameBase {}     // Tipos de habitación
  export interface AmenityType extends IdNameIconBase {} // Servicios/amenidades