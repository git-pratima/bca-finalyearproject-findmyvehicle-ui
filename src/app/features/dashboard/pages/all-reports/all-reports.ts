import { DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, expand, finalize, map, Subscription, toArray } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

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
  ownerMobile: string | null;
  color: string | null;
  type: string | null;
  vehicleCompany: string | null;
  vehicleStatus: string | null;
  vehicleModel: string | null;
  imageUrls: string[] | null;
  missingDetails: MissingReport[] | null;
};

type AllVehiclesResponse = {
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
  selector: 'app-all-reports',
  standalone: true,
  imports: [DatePipe, MatIconModule, RouterLink, TranslatePipe],
  templateUrl: './all-reports.html',
  styleUrl: './all-reports.scss'
})
export class AllReportsComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);
  private requestSubscription?: Subscription;

  readonly regNumber = signal('');
  readonly model = signal('');
  readonly missingCity = signal('');
  readonly pinCode = signal('');
  readonly status = signal('');
  readonly vehicles = signal<ReportedVehicle[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly searched = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(6);
  readonly expandedReportId = signal<number | null>(null);
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
    this.status.set('');
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
      ['pinCode', this.pinCode()],
      ['status', this.status()]
    ] as const;
    for (const [name, value] of filters) {
      if (value.trim()) params = params.set(name, value.trim());
    }

    this.loading.set(true);
    this.error.set('');
    this.requestSubscription = this.apiService.get<AllVehiclesResponse>('/vehicles/reported-all', params).pipe(
      expand(response => {
        const nextPage = response.data.number + 1;
        if (response.data.last || nextPage >= response.data.totalPages) return EMPTY;
        return this.apiService.get<AllVehiclesResponse>(
          '/vehicles/reported-all',
          params.set('page', nextPage)
        );
      }),
      toArray(),
      map(pages => ({
        vehicles: pages.flatMap(response => response.data.content ?? [])
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
            this.languageService.text('Unable to load all reports. Please try again.', 'सभी रिपोर्टें लोड नहीं हो सकीं। कृपया फिर से प्रयास करें।')
          );
        }
      });
  }

  updatePageSize(value: string): void {
    const pageSize = Number(value);
    if (pageSize !== 4 && pageSize !== 6 && pageSize !== 8 && pageSize !== 10) return;
    this.pageSize.set(pageSize);
    this.page.set(0);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages()) this.page.set(page);
  }

  toggleReport(reportId: number): void {
    this.expandedReportId.update(current => current === reportId ? null : reportId);
  }

  joinValues(...values: (string | null)[]): string {
    return values.filter((value): value is string => !!value?.trim()).join(', ') || this.languageService.text('Not provided', 'उपलब्ध नहीं');
  }
}
