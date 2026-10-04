import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Subscription, catchError, finalize, map, of, switchMap } from 'rxjs';

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
  status?: string | null;
  reward: string | null;
  ownReport: boolean;
  found?: boolean;
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
  ownVehicle: boolean;
  found?: boolean;
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
  imports: [DatePipe, FormsModule, MatIconModule, MatSnackBarModule, RouterLink],
  templateUrl: './vehicle-details.html',
  styleUrl: './vehicle-details.scss'
})
export class VehicleDetailsComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly snackBar = inject(MatSnackBar);
  private slideshowTimer: number | undefined;
  private selectedReportRequest?: Subscription;

  readonly backLink = this.route.parent?.routeConfig?.path === 'dashboard' ? '/dashboard' : '/';
  readonly vehicle = signal<VehicleDetails | null>(null);
  readonly loading = signal(false);
  readonly selectedReportLoading = signal(false);
  readonly selectedReportError = signal('');
  readonly updatingReportId = signal<number | null>(null);
  readonly error = signal('');
  readonly imageIndex = signal(0);
  readonly selectedReportId = signal<number | null>(null);
  readonly sightingLocation = signal('');
  readonly sightingNotes = signal('');
  readonly feedbackRating = signal(0);
  readonly feedbackComment = signal('');
  readonly ratingOptions = [1, 2, 3, 4, 5];
  readonly images = computed(() => this.vehicle()?.imageUrls?.filter(Boolean) ?? []);
  readonly currentImage = computed(() => this.images()[this.imageIndex()] ?? null);
  readonly reports = computed(() => this.vehicle()?.missingDetails ?? []);
  readonly ownReports = computed(() => this.reports().filter(report => report.ownReport === true));
  readonly selectedReport = computed(() => {
    const selectedReportId = this.selectedReportId();
    return selectedReportId === null
      ? null
      : this.reports().find(report => report.id === selectedReportId) ?? null;
  });
  readonly displayedReports = computed(() => {
    const report = this.selectedReport();
    return report ? [report] : [];
  });
  readonly activeOwnReport = computed(() => {
    const selectedReport = this.selectedReport();
    if (selectedReport) return selectedReport;
    if (this.selectedReportId() !== null) return null;
    const ownReports = this.ownReports();
    return ownReports.length === 1 ? ownReports[0] : null;
  });
  readonly isOwnReport = computed(() =>
    this.vehicle()?.ownVehicle === true &&
    this.activeOwnReport()?.ownReport === true
  );
  readonly feedbackAvailable = computed(() => this.isReportFound(this.activeOwnReport()));
  readonly displayedStatus = computed(() =>
    this.selectedReport()?.vehicleStatus ?? this.vehicle()?.vehicleStatus ?? 'STATUS UNAVAILABLE'
  );

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.route.queryParamMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const reportId = Number(params.get('missingDetailsId'));
      this.selectedReportId.set(Number.isInteger(reportId) && reportId > 0 ? reportId : null);
      this.loadSelectedReport();
    });

    this.route.paramMap.pipe(
      map(params => params.get('regNumber')?.trim() ?? ''),
      switchMap(regNumber => {
        this.selectedReportRequest?.unsubscribe();
        this.selectedReportRequest = undefined;
        this.selectedReportLoading.set(false);
        this.vehicle.set(null);
        this.imageIndex.set(0);
        this.selectedReportError.set('');
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
        this.loadSelectedReport();
      } else {
        this.error.set(result.error || 'Vehicle details are unavailable.');
      }
    });
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
    this.selectedReportRequest?.unsubscribe();
  }

  private loadSelectedReport(): void {
    this.selectedReportRequest?.unsubscribe();
    this.selectedReportRequest = undefined;
    this.selectedReportLoading.set(false);
    this.selectedReportError.set('');

    const vehicle = this.vehicle();
    const reportId = this.selectedReportId();
    if (!vehicle || reportId === null) return;

    this.vehicle.update(current => current ? { ...current, missingDetails: null } : current);
    this.selectedReportLoading.set(true);
    this.selectedReportRequest = this.apiService
      .get<VehicleDetailsResponse>(
        `/vehicles/${encodeURIComponent(vehicle.regNumber)}/missing-details/${reportId}`
      )
      .pipe(finalize(() => this.selectedReportLoading.set(false)))
      .subscribe({
        next: response => {
          const report = response.data.missingDetails?.find(detail => detail.id === reportId);
          if (response.data.regNumber !== vehicle.regNumber || !report) {
            this.selectedReportError.set(
              'The requested report does not match the selected vehicle.'
            );
            return;
          }
          this.vehicle.update(current =>
            current
              ? { ...response.data, missingDetails: [report] }
              : current
          );
        },
        error: error => {
          console.error('Failed to load selected missing report.', error);
          this.selectedReportError.set(
            error?.error?.status?.message ??
              error?.error?.message ??
              'Unable to load the selected report. Please return to the report list and try again.'
          );
        }
      });
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

  selectFeedbackRating(rating: number): void {
    if (this.ratingOptions.includes(rating)) this.feedbackRating.set(rating);
  }

  isReportFound(report: MissingReport | null | undefined): boolean {
    const statuses = [report?.vehicleStatus, report?.status]
      .filter((status): status is string => typeof status === 'string')
      .map(status => status.toUpperCase());
    return statuses.some(status => ['FOUND', 'CLOSED', 'CLOSE'].includes(status));
  }

  markReportFound(report: MissingReport): void {
    if (
      !this.isOwnReport() ||
      this.updatingReportId() !== null ||
      this.isReportFound(report)
    ) {
      return;
    }

    const confirmed = window.confirm(
      'Have you found this vehicle? Confirm to change its status to Found.'
    );
    if (!confirmed) return;

    this.updatingReportId.set(report.id);
    this.apiService
      .put<unknown>(`/missing-details/${report.id}/found`, null)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.updatingReportId.set(null))
      )
      .subscribe({
        next: () => {
          this.vehicle.update(vehicle => {
            if (!vehicle) return vehicle;
            const missingDetails = vehicle.missingDetails?.map(detail =>
              detail.id === report.id
                ? { ...detail, vehicleStatus: 'FOUND', status: 'CLOSED', foundDate: detail.foundDate ?? new Date().toISOString().slice(0, 10) }
                : detail
            ) ?? null;
            const allReportsFound = missingDetails?.every(detail => this.isReportFound(detail)) ?? true;

            return {
              ...vehicle,
              vehicleStatus: allReportsFound ? 'FOUND' : vehicle.vehicleStatus,
              missingDetails
            };
          });
          this.snackBar.open('Vehicle status updated to Found.', 'Close', {
            duration: 5000
          });
        },
        error: error => {
          console.error('Failed to mark vehicle as found.', error);
          this.snackBar.open(
            error?.error?.status?.message ??
              error?.error?.message ??
              'Unable to update the vehicle status. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
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
