import { HttpParams } from '@angular/common/http';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

type VehicleMissingReport = {
  missingDate: string | null;
  missingTime: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  missingAddress: string | null;
  vehicleStatus: string | null;
  reward: string | null;
};

type UserVehicle = {
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
  missingDetails: VehicleMissingReport[] | null;
};

type UserVehiclesResponse = {
  status: { status: number; message: string };
  data: {
    content: UserVehicle[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
};

@Component({
  selector: 'app-my-vehicles',
  standalone: true,
  imports: [DatePipe, MatIconModule, RouterLink, TranslatePipe],
  templateUrl: './my-vehicles.html',
  styleUrl: './my-vehicles.scss'
})
export class MyVehiclesComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private requestSubscription?: Subscription;

  readonly regNumber = signal('');
  readonly model = signal('');
  readonly missingCity = signal('');
  readonly pinCode = signal('');
  readonly vehicles = signal<UserVehicle[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly searched = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(6);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) this.loadVehicles(0);
  }

  search(): void {
    this.searched.set(true);
    this.loadVehicles(0);
  }

  clearFilters(): void {
    this.regNumber.set('');
    this.model.set('');
    this.missingCity.set('');
    this.pinCode.set('');
    this.searched.set(false);
    this.loadVehicles(0);
  }

  loadVehicles(page: number): void {
    this.requestSubscription?.unsubscribe();
    let params = new HttpParams().set('page', page).set('size', this.pageSize());
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
    this.requestSubscription = this.apiService.get<UserVehiclesResponse>('/vehicles/reported-by-me', params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: response => {
          this.vehicles.set(response.data.content ?? []);
          this.page.set(response.data.number);
          this.totalElements.set(response.data.totalElements);
          this.totalPages.set(Math.ceil(response.data.totalElements / this.pageSize()));
        },
        error: error => {
          this.vehicles.set([]);
          this.totalPages.set(0);
          this.totalElements.set(0);
          this.error.set(
            error?.error?.status?.message ||
            error?.error?.message ||
            this.languageService.text('Unable to load your vehicles. Please try again.', 'आपके वाहन लोड नहीं हो सके। कृपया फिर से प्रयास करें।')
          );
        }
      });
  }

  updatePageSize(value: string): void {
    const pageSize = Number(value);
    if (pageSize !== 4 && pageSize !== 6 && pageSize !== 8 && pageSize !== 10) return;
    this.pageSize.set(pageSize);
    this.loadVehicles(0);
  }

  latestReportLocation(report: VehicleMissingReport): string {
    return [report.missingAddress, report.city, report.district, report.state]
      .filter((value): value is string => !!value?.trim())
      .join(', ') || this.languageService.text('Location unavailable', 'स्थान उपलब्ध नहीं');
  }

  reportMissingVehicle(vehicle: UserVehicle): void {
    void this.router.navigate(['/dashboard/report-missing'], {
      state: {
        vehicle: {
          regNumber: vehicle.regNumber,
          vehicleCompany: vehicle.vehicleCompany ?? '',
          vehicleModel: vehicle.vehicleModel ?? '',
          type: vehicle.type ?? '',
          color: vehicle.color ?? '',
          chassisNumber: vehicle.chassisNumber ?? '',
          engineNumber: vehicle.engineNumber ?? '',
          owner: vehicle.owner ?? '',
          ownerMobile: vehicle.ownerMobile ?? ''
        }
      }
    });
  }
}
