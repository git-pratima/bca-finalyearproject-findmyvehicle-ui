import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero';
import { HowItWorksComponent } from '../../components/how-it-works/how-it-works';
import { LatestVehiclesComponent } from '../../components/latest-vehicles/latest-vehicles';
import { CtaComponent } from '../../components/cta/cta';
import { ApiService } from '../../../../core/services/api.service';
import { ApiEnvelope, HomeDashboardData } from '../../../../core/models/home-dashboard.model';
import { catchError, fromEvent, map, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe,
    HeroComponent,
    HowItWorksComponent,
    LatestVehiclesComponent,
     CtaComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private backNavigationSubscription?: Subscription;

  readonly dashboardData$ = isPlatformBrowser(this.platformId)
    ? this.apiService.get<ApiEnvelope<HomeDashboardData>>('/home/dashboard-data').pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Failed to load home dashboard data.', error);
          return of(null);
        })
      )
    : of(null);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.history.pushState(null, '', window.location.href);
    this.backNavigationSubscription = fromEvent<PopStateEvent>(window, 'popstate')
      .subscribe(() => {
        window.history.pushState(null, '', window.location.href);
      });
  }

  ngOnDestroy(): void {
    this.backNavigationSubscription?.unsubscribe();
  }
}
