import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';

type HelpCategory = 'fuel' | 'police' | 'hospital' | 'emergency';

type OverpassElement = {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

export type NearbyHelpPlace = {
  category: HelpCategory;
  name: string;
  phone: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
};

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const SEARCH_RADIUS_METERS = 15000;
const CATEGORIES: HelpCategory[] = ['fuel', 'police', 'hospital', 'emergency'];

@Injectable({ providedIn: 'root' })
export class HelpSupportService {
  private readonly http = inject(HttpClient);

  readonly places = signal<NearbyHelpPlace[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly searched = signal(false);

  findNearbyHelp(): void {
    if (this.loading()) return;
    this.error.set('');
    this.loading.set(true);
    this.searched.set(false);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.setLocationError(
        'Location is not available in this browser. Try a supported browser over HTTPS.'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => this.loadPlaces(position.coords.latitude, position.coords.longitude),
      error => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. Allow location access in your browser settings, then try again.'
          : error.code === error.POSITION_UNAVAILABLE
            ? 'Your current location could not be determined. Check your device location settings and try again.'
            : 'The location request timed out. Please try again.';
        this.setLocationError(message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  }

  dialablePhone(phone: string | null): string | null {
    if (!phone) return null;
    const sanitized = phone.replace(/[^\d+]/g, '');
    return /\d/.test(sanitized) ? `tel:${sanitized}` : null;
  }

  mapUrl(place: NearbyHelpPlace): string {
    return `https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=17/${place.latitude}/${place.longitude}`;
  }

  private loadPlaces(latitude: number, longitude: number): void {
    const query = this.createOverpassQuery(latitude, longitude);
    const body = new URLSearchParams({ data: query }).toString();

    this.http.post<OverpassResponse>(OVERPASS_URL, body, {
      headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    }).pipe(
      timeout(35000),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: response => {
        this.places.set(this.findNearestByCategory(
          response.elements ?? [],
          latitude,
          longitude
        ));
        this.searched.set(true);
      },
      error: error => {
        console.error('Failed to find nearby help services.', error);
        this.places.set([]);
        this.error.set(
          'Nearby service data could not be loaded. Check your connection and try again.'
        );
      }
    });
  }

  private setLocationError(message: string): void {
    this.loading.set(false);
    this.places.set([]);
    this.error.set(message);
  }

  private createOverpassQuery(latitude: number, longitude: number): string {
    const around = `around:${SEARCH_RADIUS_METERS},${latitude},${longitude}`;
    return [
      '[out:json][timeout:25];',
      '(',
      `nwr(${around})["amenity"~"^(fuel|police|hospital|fire_station|ambulance_station)$"];`,
      `nwr(${around})["healthcare"="hospital"];`,
      `nwr(${around})["emergency"~"^(ambulance_station|fire_station)$"];`,
      ');',
      'out center tags;'
    ].join('\n');
  }

  private findNearestByCategory(
    elements: OverpassElement[],
    latitude: number,
    longitude: number
  ): NearbyHelpPlace[] {
    const places = elements.flatMap(element => {
      const placeLatitude = element.lat ?? element.center?.lat;
      const placeLongitude = element.lon ?? element.center?.lon;
      const tags = element.tags;
      const category = this.categoryFor(tags);
      if (
        placeLatitude === undefined ||
        placeLongitude === undefined ||
        !Number.isFinite(placeLatitude) ||
        !Number.isFinite(placeLongitude) ||
        !category ||
        !tags
      ) return [];

      return [{
        category,
        name: tags['name'] || tags['operator'] || this.categoryLabel(category),
        phone: tags['contact:phone'] || tags['phone'] || tags['contact:mobile'] || tags['mobile'] || null,
        address: tags['addr:full'] ||
          [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
            .filter(Boolean)
            .join(' ') ||
          null,
        latitude: placeLatitude,
        longitude: placeLongitude,
        distanceKm: this.distanceInKm(latitude, longitude, placeLatitude, placeLongitude)
      }];
    });

    return CATEGORIES.flatMap(category => {
      const nearest = places
        .filter(place => place.category === category)
        .sort((first, second) => first.distanceKm - second.distanceKm)[0];
      return nearest ? [nearest] : [];
    });
  }

  private categoryFor(tags: Record<string, string> | undefined): HelpCategory | null {
    if (!tags) return null;
    if (tags['amenity'] === 'fuel') return 'fuel';
    if (tags['amenity'] === 'police') return 'police';
    if (tags['amenity'] === 'hospital' || tags['healthcare'] === 'hospital') return 'hospital';
    if (
      ['fire_station', 'ambulance_station'].includes(tags['amenity']) ||
      ['fire_station', 'ambulance_station'].includes(tags['emergency'])
    ) return 'emergency';
    return null;
  }

  private categoryLabel(category: HelpCategory): string {
    switch (category) {
      case 'fuel': return 'Petrol pump';
      case 'police': return 'Police station';
      case 'hospital': return 'Hospital';
      case 'emergency': return 'Emergency service';
    }
  }

  private distanceInKm(
    latitude: number,
    longitude: number,
    destinationLatitude: number,
    destinationLongitude: number
  ): number {
    const radians = (degrees: number): number => degrees * Math.PI / 180;
    const latitudeDelta = radians(destinationLatitude - latitude);
    const longitudeDelta = radians(destinationLongitude - longitude);
    const a = Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(radians(latitude)) *
      Math.cos(radians(destinationLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
