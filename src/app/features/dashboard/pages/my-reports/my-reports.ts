import { DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, expand, finalize, map, Subscription, toArray } from 'rxjs';

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
};

type ReportedVehicle = {
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

type ReportedVehiclesResponse = {
  status: { status: number; message: string };
  data: {
    content: ReportedVehicle[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
};

type MissingReportEntry = {
  vehicle: ReportedVehicle;
  detail: MissingReport;
};

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [DatePipe, MatIconModule, RouterLink],
  templateUrl: './my-reports.html',
  styleUrl: './my-reports.scss'
})
export class MyReportsComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private requestSubscription?: Subscription;

  readonly regNumber = signal('');
  readonly model = signal('');
  readonly missingCity = signal('');
  readonly pinCode = signal('');
  readonly vehicles = signal<ReportedVehicle[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly searched = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(4);
  readonly reports = computed<MissingReportEntry[]>(() =>
    this.vehicles().flatMap(vehicle =>
      (vehicle.missingDetails ?? []).map(detail => ({ vehicle, detail }))
    )
  );
  readonly visibleReports = computed(() => {
    const start = this.page() * this.pageSize();
    return this.reports().slice(start, start + this.pageSize());
  });
  readonly totalPages = computed(() => Math.ceil(this.reports().length / this.pageSize()));
  readonly totalElements = computed(() => this.reports().length);

  ngOnInit(): void {
    const regNumber = this.route.snapshot.queryParamMap.get('regNumber')?.trim() ?? '';
    if (regNumber) {
      this.regNumber.set(regNumber);
      this.searched.set(true);
    }
    if (isPlatformBrowser(this.platformId)) this.loadReports();
  }

  search(): void {
    this.searched.set(true);
    this.loadReports();
  }

  clearFilters(): void {
    this.regNumber.set('');
    this.model.set('');
    this.missingCity.set('');
    this.pinCode.set('');
    this.searched.set(false);
    this.loadReports();
  }

  loadReports(): void {
    this.requestSubscription?.unsubscribe();
    let params = new HttpParams().set('page', 0).set('size', this.pageSize());
    const filters = [
      ['regNumber', this.regNumber()],
      ['model', this.model()],
      ['missingCity', this.missingCity()],
      ['pinCode', this.pinCode()]
    ] as const;
    for (const [name, value] of filters) {
      if (value.trim()) params = params.set(name, value.trim());
    }

    this.loading.set(true);
    this.error.set('');
    this.requestSubscription = this.apiService.get<ReportedVehiclesResponse>('/vehicles/reported-by-me', params).pipe(
      expand(response => {
        const nextPage = response.data.number + 1;
        if (response.data.last || nextPage >= response.data.totalPages) return EMPTY;
        return this.apiService.get<ReportedVehiclesResponse>(
          '/vehicles/reported-by-me',
          params.set('page', nextPage)
        );
      }),
      toArray(),
      map(pages => ({
        vehicles: pages.flatMap(response => response.data.content ?? []),
        totalPages: pages.at(-1)?.data.totalPages ?? 0
      }))
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: response => {
          this.vehicles.set(response.vehicles);
          this.page.set(0);
        },
        error: error => {
          this.vehicles.set([]);
          this.page.set(0);
          this.error.set(
            error?.error?.status?.message ||
            error?.error?.message ||
            'Unable to load your reports. Please try again.'
          );
        }
      });
  }

  updatePageSize(value: string): void {
    const pageSize = Number(value);
    if (pageSize !== 2 && pageSize !== 4 && pageSize !== 6) return;
    this.pageSize.set(pageSize);
    this.page.set(0);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages()) this.page.set(page);
  }

  joinValues(...values: (string | null)[]): string {
    return values.filter((value): value is string => !!value?.trim()).join(', ') || 'Not provided';
  }
}
