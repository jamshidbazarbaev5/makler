# Property Form - Conditional Fields Documentation

## Overview
The PropertyFormScreen now displays different input fields based on the selected property type (Kvartira, Hovli/Kottej/Dacha, or Mehmonxona).

## Property Types & Their Fields

### 1. **Kvartira (Apartment)**
**Property Type ID:** `kvartira`

**Fields Displayed:**
- ✅ Rasmlar (Images)
- ✅ E'lon sarlavhasi (Title)
- ✅ Tavsif (Description)
- ✅ Kim joylashti (Property Owner - Owner/Realtor selector)
- ✅ Kvartira turi (Apartment Type - New Building/Secondary)
- ✅ Xonalar soni (Number of Rooms)
- ✅ Maydon, m² (Total Area)
- ✅ Qavat (Floor)
- ✅ Uyning qavatlari soni (Total Floors)
- ✅ Ta'mirlash (Renovation Status)
- ✅ Narx (Price with Currency)
- ✅ Davlat (Country)
- ✅ Viloyat (Region)
- ✅ Joylashuv (Location/Map)
- ✅ Telefon raqami (Phone Number)

### 2. **Hovli/Kottej/Dacha (House)**
**Property Type ID:** `hovli-kottej-dacha`

**Fields Displayed:**
- ✅ Rasmlar (Images)
- ✅ E'lon sarlavhasi (Title)
- ✅ Tavsif (Description)
- ✅ Kim joylashti (Property Owner - Owner/Realtor selector)
- ✅ Xonalar soni (Number of Rooms)
- ✅ Maydon, m² (Total Area)
- ✅ Ta'mirlash (Renovation Status)
- ❌ Qavat (Floor) - NOT shown
- ❌ Uyning qavatlari soni (Total Floors) - NOT shown
- ✅ Narx (Price with Currency)
- ✅ Davlat (Country)
- ✅ Viloyat (Region)
- ✅ Joylashuv (Location/Map)
- ✅ Telefon raqami (Phone Number)

### 3. **Mehmonxona (Guest House)**
**Property Type ID:** `mehmonxona`

**Fields Displayed:**
- ✅ Rasmlar (Images)
- ✅ E'lon sarlavhasi (Title)
- ✅ Tavsif (Description)
- ✅ Kim joylashti (Property Owner - Owner/Realtor selector)
- ✅ Xonalar soni (Number of Rooms)
- ✅ Maydon, m² (Total Area)
- ✅ Qavat (Floor)
- ✅ Uyning qavatlari soni (Total Floors)
- ✅ Ta'mirlash (Renovation Status)
- ❌ Kvartira turi (Apartment Type) - NOT shown
- ✅ Narx (Price with Currency)
- ✅ Davlat (Country)
- ✅ Viloyat (Region)
- ✅ Joylashuv (Location/Map)
- ✅ Telefon raqami (Phone Number)

## How to Add More Property Types

To add a new property type, modify the `getFieldsForPropertyType()` function in `PropertyFormScreen.tsx`:

```typescript
const propertyTypeConfigs: Record<string, Record<string, boolean>> = {
  kvartira: {
    // ... existing config
  },
  'hovli-kottej-dacha': {
    // ... existing config
  },
  mehmonxona: {
    // ... existing config
  },
  'your-new-type': {  // Add new type here
    images: true,
    title: true,
    description: true,
    price: true,
    location: true,
    phone: true,
    propertyOwner: true,
    apartmentType: false,  // Set to true/false based on your needs
    roomsCount: true,
    totalArea: true,
    floor: true,
    totalFloors: true,
    renovation: true,
  },
};
```

Also add the new property type to the `propertyTypes` array in `PropertyTypeScreen.tsx`:

```typescript
const propertyTypes = [
  // ... existing types
  {
    id: 'your-new-type',
    icon: YourIcon,
    title: 'Your Type Title',
    description: 'Your Type Description',
  },
];
```

## Form Data Structure

The form maintains these key fields:

### Property Type Specific Fields:
- `propertyOwner`: 'owner' | 'realtor' - Who is listing the property
- `apartmentType`: 'new' | 'secondary' - Only for apartments
- `roomsCount`: Number of rooms/bedrooms
- `totalArea`: Total area in square meters
- `floor`: Current floor number
- `totalFloors`: Total floors in the building
- `renovation`: Renovation status

### Common Fields (All Types):
- `title`: Property announcement title
- `description`: Detailed description
- `price`: Price amount
- `currency`: USD, UZS, EUR
- `country`: Country
- `region`: Region/Province
- `address`: Street address
- `phone`: Phone number
- `images`: Array of image URIs

## Styling Notes

- Selected options use **golden background** (#FFD700)
- Unselected options use **light gray** background
- All sections are white cards with subtle shadows
- Mobile-friendly responsive design
