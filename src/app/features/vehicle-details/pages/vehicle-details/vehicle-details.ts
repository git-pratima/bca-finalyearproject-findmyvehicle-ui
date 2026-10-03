import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';

type MissingReport = {
  id: number;
  missingDate: string | null;
  missingTime: string | null;
  foundDate: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  pinCode: string | null;
  missingAddress: string | null;
  description: string | null;
  vehicleStatus: string | null;
  reward: string | null;
};

type VehicleDetails = {
  id: number;
  regNumber: string;
  chassisNumber: string | null;
  engineNumber: string | null;
  owner: string | null;
  ownerEmail: string | null;
  ownerMobile: string | null;
  color: string | null;
  type: string | null;
  vehicleCompany: string | null;
  vehicleStatus: string | null;
  vehicleModel: string | null;
  imageUrls: string[] | null;
  missingDetails: MissingReport[] | null;
};

type VehicleDetailsResponse = {
  status: { status: number; message: string };
  data: VehicleDetails;
};

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [DatePipe, FormsModule, MatIconModule, RouterLink],
  templateUrl: './vehicle-details.html',
  styleUrl: './vehicle-details.scss'
})
export class VehicleDetailsComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private slideshowTimer: number | undefined;

  readonly backLink = this.route.parent?.routeConfig?.path === 'dashboard' ? '/dashboard' : '/';
  readonly vehicle = signal<VehicleDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly imageIndex = signal(0);
  readonly sightingLocation = signal('');
  readonly sightingNotes = signal('');
  readonly images = computed(() => this.vehicle()?.imageUrls?.filter(Boolean) ?? []);
  readonly currentImage = computed(() => this.images()[this.imageIndex()] ?? null);
  readonly reports = computed(() => this.vehicle()?.missingDetails ?? []);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.route.paramMap.pipe(
      map(params => params.get('regNumber')?.trim() ?? ''),
      switchMap(regNumber => {
        this.vehicle.set(null);
        this.imageIndex.set(0);
        this.error.set('');
        this.loading.set(!!regNumber);

        if (!regNumber) {
          return of({ response: null, error: 'A vehicle registration number is required.' });
        }

        return this.apiService.get<VehicleDetailsResponse>(`/vehicle/${encodeURIComponent(regNumber)}`).pipe(
          map(response => ({ response, error: '' })),
          catchError(error => of({
            response: null,
            error: error?.error?.status?.message || error?.error?.message || 'Unable to load vehicle details. Please try again.'
          })),
          finalize(() => this.loading.set(false))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      if (result.response?.data) {
        this.vehicle.set(result.response.data);
        this.startSlideshow();
      } else {
        this.error.set(result.error || 'Vehicle details are unavailable.');
      }
    });
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  previousImage(): void {
    const count = this.images().length;
    if (count > 1) this.imageIndex.update(index => (index - 1 + count) % count);
  }

  nextImage(): void {
    const count = this.images().length;
    if (count > 1) this.imageIndex.update(index => (index + 1) % count);
  }

  selectImage(index: number): void {
    if (index >= 0 && index < this.images().length) this.imageIndex.set(index);
  }

  joinValues(...values: (string | null)[]): string {
    return values.filter((value): value is string => !!value?.trim()).join(', ') || 'Not provided';
  }

  notifyOwnerHref(): string {
    const vehicle = this.vehicle();
    if (!vehicle?.ownerEmail) return '';

    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: vehicle.ownerEmail,
      su: `Notification about your vehicle ${vehicle.regNumber}`,
      body: [
        `Hello${vehicle.owner ? ` ${vehicle.owner}` : ''},`,
        '',
        `I am contacting you to notify you that your vehicle with registration number ${vehicle.regNumber} is listed as missing on Find My Vehicle.`,
        '',
        'Please review the report and take any appropriate action. If the vehicle has already been recovered, please update its status.',
        '',
        'Regards,',
        'A Find My Vehicle community member'
      ].join('\n')
    });

    return `https://mail.google.com/mail/?${params.toString()}`;
  }

  sendSighting(): void {
    const vehicle = this.vehicle();
    const location = this.sightingLocation().trim();
    if (!vehicle?.ownerEmail || !location) return;

    const body = [
      `I may have seen your vehicle ${vehicle.regNumber}.`,
      `Location: ${location}`,
      this.sightingNotes().trim() ? `Details: ${this.sightingNotes().trim()}` : ''
    ].filter(Boolean).join('\n');

    window.location.href = `mailto:${vehicle.ownerEmail}?subject=${encodeURIComponent(`Vehicle sighting: ${vehicle.regNumber}`)}&body=${encodeURIComponent(body)}`;
  }

  private startSlideshow(): void {
    this.stopSlideshow();
    if (this.images().length < 2) return;
    this.slideshowTimer = window.setInterval(() => this.nextImage(), 4500);
  }

  private stopSlideshow(): void {
    if (this.slideshowTimer !== undefined) window.clearInterval(this.slideshowTimer);
    this.slideshowTimer = undefined;
  }
}
