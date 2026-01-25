export interface Listing {
  id: string;
  username: string;
  avatar: string;
  price: string;
  title: string;
  badge: 'VIP' | 'TOP' | null;
  hasImage: boolean;
  imageUrl?: string;
  hasHotDeal?: boolean;
  location?: string;
}

export interface ListingDetail extends Listing {
  images: string[];
  category: string;
  type: string;
  description: string;
  likesCount: number;
  timePosted: string;
  details: {
    label: string;
    value: string;
  }[];
  locationAddress: string;
  mapUrl?: string;
}

// User Profile Mock Data
export const MOCK_USERS = [
  {
    id: '1',
    username: 'Shahzoda_shahzo',
    listingCount: 1950,
    avatarUrl: 'https://picsum.photos/id/64/200/200',
  },
  {
    id: '2',
    username: 'NODIRA_Rieltor',
    listingCount: 1345,
    avatarUrl: 'https://picsum.photos/id/65/200/200',
  },
  {
    id: '3',
    username: 'nargiza_rieltor',
    listingCount: 1238,
    avatarUrl: 'https://picsum.photos/id/338/200/200',
  },
  {
    id: '4',
    username: 'Abu_Usmon',
    listingCount: 1207,
    avatarUrl: 'https://picsum.photos/id/91/200/200',
  },
  {
    id: '5',
    username: 'UYJOYYERBOZOR',
    listingCount: 879,
    avatarUrl: 'https://picsum.photos/id/111/200/200',
  },
  {
    id: '6',
    username: 'ARZON_UYLAR_UZZ',
    listingCount: 551,
    avatarUrl: 'https://picsum.photos/id/237/200/200',
  },
  {
    id: '7',
    username: 'NARgiza_Megapolis',
    listingCount: 513,
    avatarUrl: 'https://picsum.photos/id/177/200/200',
  },
  {
    id: '8',
    username: 'Davron_Invest',
    listingCount: 420,
    avatarUrl: 'https://picsum.photos/id/12/200/200',
  },
];

export interface ListingDetail extends Listing {
  images: string[];
  category: string;
  type: string;
  description: string;
  likesCount: number;
  timePosted: string;
  details: {
    label: string;
    value: string;
  }[];
  locationAddress: string;
  mapUrl?: string;
}

export const vipListings: Listing[] = [
  {
    id: '1',
    username: 'Azim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Azim',
    price: '89 000 y.e',
    title: 'Kelesda xovli sotiladi',
    badge: 'VIP',
    hasImage: false,
  },
  {
    id: '2',
    username: 'NARgizA_Megapolis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nargiza',
    price: '108 000 y.e',
    title: '🔥 Евро 3/3/4 ИПОТЕКА 📍Чил-5 м.',
    badge: 'VIP',
    hasImage: false,
    hasHotDeal: true,
  },
  {
    id: '3',
    username: 'EliteHomes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elite',
    price: '145 000 y.e',
    title: 'Yangi uy, 4 xonali',
    badge: 'VIP',
    hasImage: false,
  },
  {
    id: '4',
    username: 'PremiumRealty',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Premium',
    price: '200 000 y.e',
    title: 'Lux penthouse markaz',
    badge: 'VIP',
    hasImage: false,
  },
];

export const allListings: Listing[] = [
  {
    id: '5',
    username: 'Joymee_667Vy4R',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joymee',
    price: '75 000 y.e',
    title: '3 xonali kvartira',
    badge: 'TOP',
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    username: 'UYJOYYERBOZOR',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Uyjoy',
    price: '52 000 y.e',
    title: 'Yangi binoda kvartira',
    badge: 'TOP',
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
  },
  {
    id: '7',
    username: 'RealEstate_Pro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RealEstate',
    price: '95 000 y.e',
    title: 'Hovli uy, 5 xona',
    badge: null,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
  },
  {
    id: '8',
    username: 'HomeFinder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HomeFinder',
    price: '120 000 y.e',
    title: 'Zamonaviy dizayn',
    badge: 'TOP',
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop',
  },
  {
    id: '9',
    username: 'RealEstate_Pro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RealEstate',
    price: '95 000 y.e',
    title: 'Hovli uy, 5 xona',
    badge: null,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
  },
  {
    id: '10',
    username: 'HomeFinder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HomeFinder',
    price: '120 000 y.e',
    title: 'Zamonaviy dizayn',
    badge: 'TOP',
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop',
  },
  {
    id: '11',
    username: 'RealEstate_Pro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RealEstate',
    price: '95 000 y.e',
    title: 'Hovli uy, 5 xona',
    badge: null,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
  },
  {
    id: '12 ',
    username: 'HomeFinder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HomeFinder',
    price: '120 000 y.e',
    title: 'Zamonaviy dizayn',
    badge: 'TOP',
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop',
  },
];

export const totalListingsCount = 12546;

// Mock listing detail data
export const listingDetail: ListingDetail = {
  id: '1',
  username: 'Hojiakbar_0211',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hojiakbar',
  price: '99 000 y.e',
  title: 'Xasanboyda xovli sotiladi',
  badge: null,
  hasImage: true,
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop',
  ],
  category: 'Sotuv',
  type: 'Hovli/Kottej/Dacha',
  description: 'Xasanboyda 3 sotixli xovli sotiladi. Eski xovli pachti yer narxida bervoriladi. +998909094676',
  likesCount: 7,
  timePosted: '1 oy oldin',
  details: [
    { label: 'Kim joylashtirdi', value: 'Egasi' },
    { label: 'Maydon, sotix', value: '3' },
    { label: 'Uyning qavatlari soni', value: '1' },
  ],
  locationAddress: 'Toshkent shahri, Yunusobod tumani',
  mapUrl: 'https://maps.google.com',
};

// Similar listings for the detail page
export const similarListings: Listing[] = [
  {
    id: '10',
    username: 'joymee_wr5c04j',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joymee2',
    price: '60 000 y.e',
    title: 'Uy sotiladi toshkent bardankol',
    badge: null,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
  },
  {
    id: '11',
    username: 'Golid',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Golid',
    price: '75 000 y.e',
    title: 'Тошкент тумани келесда участка соти',
    badge: null,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
  },
  {
    id: '12',
    username: 'RealEstate',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RealEstate2',
    price: '85 000 y.e',
    title: 'Yangi uy sotiladi',
    badge: null,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
  },
  {
    id: '13',
    username: 'HomeSeller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HomeSeller',
    price: '110 000 y.e',
    title: 'Kottej arzon narxda',
    badge: null,
    hasImage: true,
    imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop',
  },
];

export const COLORS = {
  primary: '#FFD600', // The bright yellow
  primaryDark: '#E5C000',
  textMain: '#111827',
  textSecondary: '#6B7280',
  bgInput: '#F9FAFB',
  bgInputDark: '#F3F4F6',
  danger: '#EF4444',
};

// Mock Data
export const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Farg'ona",
];

export const COUNTRIES = [
  "O'zbekiston",
  "Qozog'iston",
  "Rossiya",
  "Turkiya"
];
