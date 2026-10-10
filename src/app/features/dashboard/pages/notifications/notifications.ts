import { DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, inject, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

type Notification = {
  id: number;
  vehicleId: number;
  regNo: string;
  imageUrl?: string | null;
  missingDetailsId: number;
  notifiedByUserId: number;
  vehicleOwnerUserId: number;
  seenAt: string;
  seenArea: string;
  liveMapLink: string | null;
  message: string | null;
  seenByVehicleOwner: string;
};

type NotificationsResponse = {
  status: { status: number; message: string };
  data: {
    content: Notification[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
};

@Component({
  selector: 'app-notifications',
  imports: [DatePipe, MatIconModule, MatSnackBarModule, TranslatePipe],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class NotificationsComponent implements OnInit {
  @ViewChild('imageDialog') private imageDialog!: ElementRef<HTMLDialogElement>;

  private readonly apiService = inject(ApiService);
  private readonly dashboardRefreshService = inject(DashboardRefreshService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly snackBar = inject(MatSnackBar);
  private readonly languageService = inject(LanguageService);

  readonly notifications = signal<Notification[]>([]);
  readonly page = signal(0);
  readonly pageSize = signal(6);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly markingSeenId = signal<number | null>(null);
  readonly expandedNotificationIds = signal<Set<number>>(new Set());
  readonly selectedImageUrl = signal<string | null>(null);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) this.loadNotifications();
  }

  loadNotifications(page = this.page()): void {
    const params = new HttpParams()
      .set('page', page)
      .set('size', this.pageSize());

    this.loading.set(true);
    this.error.set('');
    this.apiService
      .get<NotificationsResponse>('/notifications', params)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: response => {
          this.notifications.set(response.data.content ?? []);
          this.page.set(response.data.number ?? page);
          this.pageSize.set(response.data.size ?? this.pageSize());
          this.totalPages.set(response.data.totalPages ?? 0);
          this.totalElements.set(response.data.totalElements ?? 0);
        },
        error: error => {
          console.error('Failed to load notifications.', error);
          this.notifications.set([]);
          this.error.set(
            error?.error?.status?.message ??
              error?.error?.message ??
              this.languageService.text('Unable to load notifications. Please try again.', 'सूचनाएँ लोड नहीं हो सकीं। कृपया फिर से प्रयास करें।')
          );
        }
      });
  }

  updatePageSize(value: string): void {
    const size = Number(value);
    if (![4, 6, 8, 10].includes(size)) return;
    this.pageSize.set(size);
    this.loadNotifications(0);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages() && !this.loading()) {
      this.loadNotifications(page);
    }
  }

  toggleNotification(notificationId: number): void {
    this.expandedNotificationIds.set(
      this.expandedNotificationIds().has(notificationId)
        ? new Set()
        : new Set([notificationId])
    );
  }

  openImage(imageUrl: string): void {
    this.selectedImageUrl.set(imageUrl);
    this.imageDialog.nativeElement.showModal();
  }

  closeImage(): void {
    if (this.imageDialog.nativeElement.open) {
      this.imageDialog.nativeElement.close();
    }
  }

  onImageDialogClosed(): void {
    this.selectedImageUrl.set(null);
  }

  markSeen(notification: Notification): void {
    if (
      notification.seenByVehicleOwner === 'Y' ||
      this.markingSeenId() !== null
    ) return;

    const confirmed = window.confirm(this.languageService.text(
      `Mark the sighting notification for ${notification.regNo} as seen?`,
      `${notification.regNo} के देखे जाने की सूचना को देखा हुआ चिह्नित करें?`
    ));
    if (!confirmed) return;

    this.markingSeenId.set(notification.id);
    this.apiService
      .patch<unknown>(`/notifications/${notification.id}/seen?seen=Y`, null)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.markingSeenId.set(null))
      )
      .subscribe({
        next: () => {
          this.dashboardRefreshService.requestRefresh();
          this.notifications.update(items =>
            items.map(item =>
              item.id === notification.id
                ? { ...item, seenByVehicleOwner: 'Y' }
                : item
            )
          );
          this.snackBar.open(this.languageService.text('Notification marked as seen.', 'सूचना को देखा हुआ चिह्नित किया गया।'), this.languageService.text('Close', 'बंद करें'), {
            duration: 5000
          });
        },
        error: error => {
          console.error('Failed to mark notification as seen.', error);
          this.snackBar.open(
            error?.error?.status?.message ??
              error?.error?.message ??
              this.languageService.text('Unable to mark the notification as seen. Please try again.', 'सूचना को देखा हुआ चिह्नित नहीं किया जा सका। कृपया फिर से प्रयास करें।'),
            this.languageService.text('Close', 'बंद करें'),
            { duration: 6000 }
          );
        }
      });
  }

  isGoogleMapsLink(link: string | null): boolean {
    if (!link) return false;
    try {
      const host = new URL(link).hostname.toLowerCase();
      return host === 'maps.app.goo.gl' ||
        host === 'maps.google.com' ||
        host === 'www.google.com' ||
        host === 'google.com';
    } catch {
      return false;
    }
  }
}
