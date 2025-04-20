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
    },
    SAFE: {
      id: "a7sfnr9nmcqzhbq",
      name: "Caja fuerte",
      icon: "safe-box1"
    },
    NO_SMOKING: {
      id: "a8mgnr7plbqxwvz",
      name: "No fumar",
      icon: "smoke_free"
    },
    HEATING: {
      id: "a9tqzn2sfncmhbq",
      name: "Calefacción",
      icon: "oil-heater-1"
    },
    PHONE: {
      id: "a10dknr5mjqszwvz",
      name: "Teléfono",
      icon: "telephone"
    },
    HAIR_DRYER: {
      id: "a11sfnr9nmcqzhbr",
      name: "Secador de pelo",
      icon: "hair-dryer1"
    }
  } as const;
  
  /* Servicios del hotel */
  export const HOTEL_AMENITIES = {
    GYM: {
      id: "h6sfnr9nmcqzhbq",
      name: "Gimnasio",
      icon: "weights"
    },
    PARKING: {
      id: "h7mgnr7plbqxwvz",
      name: "Estacionamiento",
      icon: "parking"
    },
    SPA: {
      id: "h8tqzn2sfncmhbq",
      name: "Spa",
      icon: "massage"
    },
    RESTAURANT: {
      id: "h9dknr5mjqszwvz",
      name: "Restaurante",
      icon: "dish"
    },
    ROOM_SERVICE: {
      id: "h10sfnr9nmcqzhbr",
      name: "Servicio a la habitación",
      icon: "food-service-copy"
    },
    POOL: {
      id: "h11mgnr7plbqxwva",
      name: "Piscina",
      icon: "swimming-pool1"
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
  export type HotelAmenityType = typeof HOTEL_AMENITIES[keyof typeof HOTEL_AMENITIES];