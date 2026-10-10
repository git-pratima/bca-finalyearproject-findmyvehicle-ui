import { DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiEndpoints } from '../../../../core/constants/api-endpoints';
import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

type Feedback = {
  id: number;
  rating: number;
  comment: string | null;
  createdDate: string | null;
  missingReport: {
    id: number;
    missingDate: string | null;
    city: string | null;
    district: string | null;
    state: string | null;
    missingAddress: string | null;
    foundDate: string | null;
    vehicleStatus: string | null;
    status?: string | null;
  };
  vehicle: {
    id: number;
    regNumber: string;
    owner: string | null;
    vehicleCompany: string | null;
    vehicleModel: string | null;
  };
};

type FeedbackResponse = {
  status: { status: number; message: string };
  data: {
    content: Feedback[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
};

@Component({
  selector: 'app-feedback',
  imports: [DatePipe, MatIconModule, RouterLink, TranslatePipe],
  templateUrl: './feedback.html',
  styleUrl: './feedback.scss'
})
export class FeedbackComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly languageService = inject(LanguageService);

  readonly feedback = signal<Feedback[]>([]);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly ratingStars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) this.loadFeedback();
  }

  loadFeedback(page = this.page()): void {
    const params = new HttpParams()
      .set('page', page)
      .set('size', this.pageSize());

    this.loading.set(true);
    this.error.set('');
    this.apiService
      .get<FeedbackResponse>(ApiEndpoints.FEEDBACK.LIST, params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: response => {
          this.feedback.set(response.data.content ?? []);
          this.page.set(response.data.number ?? page);
          this.pageSize.set(response.data.size ?? this.pageSize());
          this.totalPages.set(response.data.totalPages ?? 0);
          this.totalElements.set(response.data.totalElements ?? 0);
        },
        error: error => {
          console.error('Failed to load feedback.', error);
          this.feedback.set([]);
          this.error.set(
            error?.error?.status?.message ??
              error?.error?.message ??
              this.languageService.text('Unable to load feedback. Please try again.', 'प्रतिक्रिया लोड नहीं हो सकी। कृपया फिर से प्रयास करें।')
          );
        }
      });
  }

  updatePageSize(value: string): void {
    const size = Number(value);
    if (![10, 20, 50].includes(size)) return;
    this.pageSize.set(size);
    this.loadFeedback(0);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages() && !this.loading()) {
      this.loadFeedback(page);
    }
  }

  location(feedback: Feedback): string {
    return [
      feedback.missingReport.missingAddress,
      feedback.missingReport.city,
      feedback.missingReport.district,
      feedback.missingReport.state
    ].filter((value): value is string => !!value?.trim()).join(', ') || this.languageService.text('Location not provided', 'स्थान उपलब्ध नहीं');
  }

  isRecovered(feedback: Feedback): boolean {
    const report = feedback.missingReport;
    const statuses = [report.vehicleStatus, report.status]
      .filter((status): status is string => typeof status === 'string')
      .map(status => status.toUpperCase());
    return !!report.foundDate ||
      statuses.some(status => ['FOUND', 'CLOSED', 'CLOSE', 'RECOVERED'].includes(status));
  }
}
