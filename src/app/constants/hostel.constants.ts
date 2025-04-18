/* Tipos de Habitación */
export const ROOM_TYPES = {
    TODAS: {
      id: "h1sfnr9nmcqzhbt",
      name: "Todas las habitaciones",
    },  
    INDIVIDUAL: {
      id: "h2sfnr9nmcqzhbp",
      name: "Individual",
    },
    DOBLE: {
      id: "h3mgnr7plbqxwvy",
      name: "Doble",
    },
    GRUPAL: {
      id: "h4tqzn2sfncmhbp",
      name: "Grupal",
    },
    FAMILIAR: {
      id: "h5dknr5mjqszwvy",
      name: "Familiar",
    },
  } as const;
  
  /* Servicios de la habitación */
  export const ROOM_AMENITIES = {
    WIFI: {
      id: "a1sdnr2klmqxwvy",
      name: "WiFi",
      icon: "wifi"
    },
    AIR_CONDITIONING: {
      id: "a2jgnr9plbqzxyv",
      name: "Aire acondicionado",
      icon: "ac_unit"
    },
    TV: {
      id: "a3tqzn2sfncmhbp",
      name: "TV",
      icon: "tv"
    },
    PRIVATE_BATH: {
      id: "a4mgnr7plbqxwvy",
      name: "Baño privado",
      icon: "bathtub"
    },
    CLOSET: {
      id: "a5sfnr9nmcqzhbp",
      name: "Closet",
      icon: "wardrobe"
    },
    MULTIPLE_SHOWERS: {
      id: "a6dknr5mjqszwvy",
      name: "Duchas múltiples",
      icon: "shower"
    }
  } as const;
  
  export const CONTACT_INFO = {
    PHONE1: '6054317446',
    PHONE2: '3007319612',
    EMAIL: 'hostalmicasa182024@gmail.com',
    INSTAGRAM: 'micasa18sm',
    FACEBOOK: 'micasa18sm',
    TIKTOK: 'micasa18sm',
    ADDRESS: 'Calle 18 no 7a-20 centro histórico',
    RNT: '232853'
  } as const;
  
  /* Tipos para TypeScript (derivados de las constantes) */
  export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES];
  export type AmenityType = typeof ROOM_AMENITIES[keyof typeof ROOM_AMENITIES];