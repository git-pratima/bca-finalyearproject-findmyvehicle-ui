import { DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';

import { ApiEndpoints } from '../../../../core/constants/api-endpoints';
import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

type AppFeedback = {
  id: number;
  rating: number;
  comment: string | null;
  seen: 'Y' | 'N' | string;
  seenBy: string | null;
  feedbackGivenBy: string | null;
  createdDate: string | null;
};

type AppFeedbackListResponse = {
  status: { status: number; message: string };
  data: {
    content: AppFeedback[];
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
  selector: 'app-application-feedback',
  imports: [DatePipe, MatIconModule, TranslatePipe],
  templateUrl: './app-feedback.html',
  styleUrl: './app-feedback.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFeedbackComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly languageService = inject(LanguageService);

  readonly feedback = signal<AppFeedback[]>([]);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly updatingFeedbackId = signal<number | null>(null);
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
    this.apiService.get<AppFeedbackListResponse>(ApiEndpoints.APP_FEEDBACK.LIST, params)
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
          console.error('Failed to load application feedback.', error);
          this.feedback.set([]);
          this.error.set(
            error?.error?.status?.message ??
              error?.error?.message ??
              this.languageService.text('Unable to load application feedback. Please try again.', 'ऐप प्रतिक्रिया लोड नहीं हो सकी। कृपया फिर से प्रयास करें।')
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

  toggleSeen(feedback: AppFeedback): void {
    if (this.updatingFeedbackId() !== null) return;
    const seen = feedback.seen === 'Y' ? 'N' : 'Y';
    this.updatingFeedbackId.set(feedback.id);
    this.error.set('');

    this.apiService
      .patch<unknown>(`${ApiEndpoints.APP_FEEDBACK.LIST}/${feedback.id}/seen?seen=${seen}`, null)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.updatingFeedbackId.set(null))
      )
      .subscribe({
        next: () => {
          this.feedback.update(items =>
            items.map(item => item.id === feedback.id ? { ...item, seen } : item)
          );
        },
        error: error => {
          console.error('Failed to update application feedback seen state.', error);
          this.error.set(
            error?.error?.status?.message ??
              error?.error?.message ??
              this.languageService.text('Unable to update feedback status. Please try again.', 'प्रतिक्रिया की स्थिति अपडेट नहीं हो सकी। कृपया फिर से प्रयास करें।')
          );
        }
      });
  }

}
