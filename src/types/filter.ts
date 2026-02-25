export interface FilterState {
  property_type: string;   // apartment | house | commercial | land | ''
  listing_type: string;    // sale | rent | rent_daily | ''
  building_type: string;   // new | old | ''
  condition: string;       // needs_repair | no_repair | cosmetic | euro_repair | design | capital | ''
  currency: string;        // usd | uzs | ''
  price_min: string;
  price_max: string;
  area_min: string;
  area_max: string;
  rooms_min: string;
  rooms_max: string;
  floor_min: string;
  floor_max: string;
  district: string;
  ordering: string;        // price | -price | posted_at | -posted_at | views_count | -views_count | ''
}

export const EMPTY_FILTERS: FilterState = {
  property_type: '',
  listing_type: '',
  building_type: '',
  condition: '',
  currency: '',
  price_min: '',
  price_max: '',
  area_min: '',
  area_max: '',
  rooms_min: '',
  rooms_max: '',
  floor_min: '',
  floor_max: '',
  district: '',
  ordering: '',
};
