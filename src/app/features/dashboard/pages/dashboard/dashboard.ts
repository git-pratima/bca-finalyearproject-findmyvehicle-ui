import { Component, computed, DestroyRef, ElementRef, HostBinding, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, finalize, fromEvent, map, Subscription } from 'rxjs';

import { ThemeService } from '../../../../core/services/theme.service';
import { TokenService } from '../../../../core/services/token.service';
import { AuthService, ChangePasswordRequest, ChangePasswordResponse } from '../../../../core/services/auth.service';
import { ProfileService, UserProfileRequest, UserProfileResponse } from '../../../../core/services/profile.service';
import { ApiService } from '../../../../core/services/api.service';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';

type DashboardVehicle = {
  id: number;
  name: string | null;
  registration: string | null;
  missingDetailsId?: number | null;
  location: string | null;
  reportedAt: string | null;
  image: string | null;
  chassis: string | null;
  engine: string | null;
  color: string | null;
  description: string | null;
  status: string | null;
  owner?: string | null;
  ownerMobile?: string | null;
  type?: string | null;
  vehicleCompany?: string | null;
};

type VehicleLookupMissingDetail = {
  id: number;
  missingDate: string | null;
  missingTime: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  pinCode: string | null;
  missingAddress: string | null;
  description: string | null;
  vehicleStatus: string | null;
};

type VehicleLookupData = {
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
  missingDetails: VehicleLookupMissingDetail[] | null;
};

type VehicleLookupResponse = {
  status: { status: number; message: string };
  data: VehicleLookupData;
};

type VehicleSearchResponse = {
  status: { status: number; message: string };
  data: {
    content: VehicleLookupData[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
};

type DashboardPayload = {
  user: { id: number; name: string; email: string; profileImageUrl: string | null };
  summary: {
    totalReports: number;
    recovered: number;
    inProgress: number;
    closed: number;
    totalRegisteredVehicles?: number | null;
  };
  activity: { unreadNotifications: number | null; unreadMessages: number | null };
  unreadNotificationCount?: number | null;
  totalRegisteredVehicles?: number | null;
  recentMissingVehicles: DashboardVehicle[];
};

type DashboardResponse = {
  data: DashboardPayload;
};

type ProfileForm = {
  addressId: number;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type ChangePasswordForm = ChangePasswordRequest;
type VehicleSearchType = 'regNumber' | 'model' | 'missingCity' | 'pinCode';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, FormsModule, MatIconModule, RouterLink, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly themeService = inject(ThemeService);
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly apiService = inject(ApiService);
  private readonly dashboardRefreshService = inject(DashboardRefreshService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private backNavigationSubscription?: Subscription;
  private searchRequestSubscription?: Subscription;
  private globalSearchSubscription?: Subscription;

  readonly mobileMenuOpen = signal(false);
  readonly dashboardData = signal<DashboardPayload | null>(null);
  readonly dashboardLoading = signal(false);
  readonly dashboardError = signal('');
  readonly unreadNotificationCount = computed(() =>
    this.dashboardData()?.unreadNotificationCount ??
    this.dashboardData()?.activity?.unreadNotifications ??
    0
  );
  readonly totalRegisteredVehicles = computed(() =>
    this.dashboardData()?.totalRegisteredVehicles ??
    this.dashboardData()?.summary?.totalRegisteredVehicles ??
    0
  );
  readonly vehicles = computed(() =>
    (this.dashboardData()?.recentMissingVehicles ?? []).map(vehicle => ({
      ...vehicle,
      missingDetailsId: vehicle.missingDetailsId ?? vehicle.id
    }))
  );
  readonly selectedVehicleIndex = signal(0);
  readonly query = signal('');
  readonly searched = signal(false);
  readonly searchLoading = signal(false);
  readonly searchError = signal('');
  readonly searchResult = signal<DashboardVehicle | null>(null);
  readonly globalQuery = signal('');
  readonly globalSearchType = signal<VehicleSearchType>('regNumber');
  readonly globalSearchActive = signal(false);
  readonly globalSearchLoading = signal(false);
  readonly globalSearchError = signal('');
  readonly globalSearchResults = signal<DashboardVehicle[]>([]);
  readonly globalSearchSelectedIndex = signal(0);
  readonly globalSearchPage = signal(0);
  readonly globalSearchPageSize = 3;
  readonly globalSearchTotalPages = signal(0);
  readonly globalSearchTotalElements = signal(0);
  readonly profileMenuOpen = signal(false);
  readonly sidebarProfileOpen = signal(false);
  readonly editProfileOpen = signal(false);
  readonly profileSaved = signal(false);
  readonly profileSaving = signal(false);
  readonly profileLoading = signal(false);
  readonly profileError = signal('');
  readonly profileImage = signal<File | null>(null);
  readonly profileImagePreview = signal<string | null>(null);
  readonly profileImageUrl = signal<string | null>(null);
  readonly changePasswordOpen = signal(false);
  readonly changePasswordSaving = signal(false);
  readonly changePasswordError = signal('');
  readonly changePasswordSuccess = signal('');
  readonly theme = this.themeService.theme;
  readonly userName = this.tokenService.currentUserName;
  readonly userEmail = this.tokenService.currentUserEmail;
  readonly userId = this.tokenService.currentUserId;
  readonly isSocialLogin = this.tokenService.isSocialLogin;
  private readonly currentUrl = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url }
  );
  readonly isChildPage = computed(() => this.currentUrl().startsWith('/dashboard/'));
  readonly isMyReportsPage = computed(() => this.currentUrl().startsWith('/dashboard/my-reports'));
  readonly isMyVehiclesPage = computed(() => this.currentUrl().startsWith('/dashboard/my-vehicles'));
  readonly isAllReportsPage = computed(() => this.currentUrl().startsWith('/dashboard/all-reports'));
  readonly isAllVehiclesPage = computed(() => this.currentUrl().startsWith('/dashboard/all-vehicles'));
  readonly isNotificationsPage = computed(() => this.currentUrl().startsWith('/dashboard/notifications'));
  readonly isFeedbackPage = computed(() => this.currentUrl().startsWith('/dashboard/feedback'));
  readonly isHelpSupportPage = computed(() => this.currentUrl().startsWith('/dashboard/help-support'));
  readonly isSettingsPage = computed(() => this.currentUrl().startsWith('/dashboard/settings'));

  private savedProfile: ProfileForm = this.createProfile();
  profile: ProfileForm = { ...this.savedProfile };
  changePassword: ChangePasswordForm = this.createChangePasswordForm();

  get selectedVehicle(): DashboardVehicle | null {
    if (this.globalSearchActive()) {
      return this.globalSearchResults()[this.globalSearchSelectedIndex()] ?? null;
    }
    return this.searched()
      ? this.searchResult()
      : this.vehicles()[this.selectedVehicleIndex()] ?? null;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.dashboardRefreshService.refreshRequested$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadDashboardData());
    this.loadDashboardData();

    window.history.pushState(null, '', window.location.href);
    this.backNavigationSubscription = fromEvent<PopStateEvent>(window, 'popstate').subscribe(() => {
      window.history.pushState(null, '', window.location.href);
    });
  }

  ngOnDestroy(): void {
    this.backNavigationSubscription?.unsubscribe();
    this.searchRequestSubscription?.unsubscribe();
    this.globalSearchSubscription?.unsubscribe();
  }

  private loadDashboardData(): void {
    this.dashboardLoading.set(true);
    this.dashboardError.set('');
    this.apiService.get<DashboardResponse>('/dashboard')
      .pipe(finalize(() => this.dashboardLoading.set(false)))
      .subscribe({
        next: response => {
          this.dashboardData.set(response.data);
          this.profileImageUrl.set(response.data.user.profileImageUrl);
        },
        error: error => this.dashboardError.set(
          error?.error?.status?.message || 'Unable to load dashboard data. Please try again.'
        )
      });
  }

  @HostBinding('class.has-profile-image')
  get hasProfileImage(): boolean { return !!this.profileImageUrl(); }

  @HostBinding('style.--profile-image-url')
  get profileImageStyle(): string {
    const url = this.profileImageUrl();
    return url ? `url("${url.replaceAll('"', '%22')}")` : 'none';
  }

  @HostListener('document:click', ['$event'])
  closeProfileMenuOnOutsideClick(event: MouseEvent): void {
    if (!this.profileMenuOpen()) return;
    const profileMenu = this.elementRef.nativeElement.querySelector('.profile-menu');
    if (!profileMenu?.contains(event.target as Node)) this.profileMenuOpen.set(false);
  }

  displayName(): string { return this.dashboardData()?.user.name || this.userName() || 'Member'; }

  initials(): string { return this.displayName().split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase(); }

  openEditProfile(): void {
    this.profileMenuOpen.set(false);
    this.sidebarProfileOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.profileSaved.set(false);
    this.profileError.set('');
    const identity = this.tokenService.getUserIdentity();
    const id = identity?.userId ?? this.userId();
    if (id === null) {
      this.profileError.set('Your login session is missing the user ID. Please sign out and sign in again.');
      this.editProfileOpen.set(true);
      return;
    }

    this.profileLoading.set(true);
    this.editProfileOpen.set(true);
    this.profileService.getProfile(id)
      .pipe(finalize(() => this.profileLoading.set(false)))
      .subscribe({
        next: response => this.setProfileFromResponse(response),
        error: error => this.profileError.set(error?.error?.status?.message || error?.error?.message || 'Unable to load your profile. Please try again.')
      });
  }

  closeEditProfile(): void {
    this.editProfileOpen.set(false);
    this.profileError.set('');
  }

  closeEditProfileFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeEditProfile();
  }

  openChangePassword(): void {
    if (this.isSocialLogin()) return;
    this.profileMenuOpen.set(false);
    this.sidebarProfileOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.changePassword = this.createChangePasswordForm();
    this.changePasswordError.set('');
    this.changePasswordOpen.set(true);
  }

  closeChangePassword(): void {
    if (this.changePasswordSaving()) return;
    this.changePasswordOpen.set(false);
    this.changePasswordError.set('');
  }

  closeChangePasswordFromBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeChangePassword();
  }

  savePassword(): void {
    const request: ChangePasswordRequest = { ...this.changePassword };
    if (this.changePasswordSaving()) return;
    if (!request.currentPassword || !request.newPassword || !request.confirmPassword) {
      this.changePasswordError.set('Complete all password fields.');
      return;
    }
    if (request.newPassword.length < 5) {
      this.changePasswordError.set('New password must be at least 5 characters.');
      return;
    }
    if (request.newPassword !== request.confirmPassword) {
      this.changePasswordError.set('New password and confirmation do not match.');
      return;
    }
    this.changePasswordError.set('');
    this.changePasswordSaving.set(true);
    this.authService.changePassword(request).pipe(finalize(() => this.changePasswordSaving.set(false))).subscribe({
      next: (response: ChangePasswordResponse) => {
        this.changePasswordSuccess.set(response?.status?.message || 'Password changed successfully.');
        this.changePasswordOpen.set(false);
        this.changePassword = this.createChangePasswordForm();
      },
      error: error => this.changePasswordError.set(error?.error?.status?.message || error?.error?.message || 'Unable to change password. Please try again.')
    });
  }

  isChangePasswordValid(): boolean {
    const { currentPassword, newPassword, confirmPassword } = this.changePassword;
    return currentPassword.length > 0 && newPassword.length >= 5 && newPassword === confirmPassword;
  }

  saveProfile(): void {
    const name = this.profile.fullName.trim();
    const email = this.profile.email.trim();
    const identity = this.tokenService.getUserIdentity();
    const id = identity?.userId ?? this.userId();
    const authenticatedEmail = identity?.email ?? this.userEmail() ?? email;
    if (this.profileSaving() || this.profileLoading()) return;
    if (!name) {
      this.profileError.set('Enter your full name before saving.');
      return;
    }
    if (!authenticatedEmail) {
      this.profileError.set('Enter your email address before saving.');
      return;
    }
    if (id === null) {
      this.profileError.set('Your login session is missing the user ID. Please sign out and sign in again, then save your profile.');
      return;
    }
    this.profile.fullName = name;
    this.profile.email = authenticatedEmail;
    this.profileError.set('');
    this.profileSaving.set(true);

    const request: UserProfileRequest = {
      id,
      name,
      email: authenticatedEmail,
      phone: this.profile.phone.trim(),
      address: {
        id: this.profile.addressId,
        addressLine1: this.profile.addressLine1.trim(),
        addressLine2: this.profile.addressLine2.trim(),
        city: this.profile.city.trim(),
        // The API expects a State enum.  JSON.stringify omits undefined, whereas
        // an empty string cannot be deserialized into that enum.
        state: this.profile.state || undefined,
        pinCode: this.profile.postalCode.trim(),
        country: this.profile.country.trim()
      }
    };

    this.profileService.createProfile(request, this.profileImage())
      .pipe(finalize(() => this.profileSaving.set(false)))
      .subscribe({
        next: () => {
          this.savedProfile = { ...this.profile };
          this.tokenService.saveUserName(name);
          this.tokenService.saveUserEmail(authenticatedEmail);
          this.profileSaved.set(true);
          this.editProfileOpen.set(false);
        },
        error: error => this.profileError.set(error?.error?.status?.message || error?.error?.message || 'Unable to save your profile. Please try again.')
      });
  }

  onProfileImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.profileError.set('Please select an image file.');
      return;
    }
    const previousPreview = this.profileImagePreview();
    if (previousPreview) URL.revokeObjectURL(previousPreview);
    this.profileImage.set(file);
    this.profileImagePreview.set(URL.createObjectURL(file));
    this.profileError.set('');
  }

  removeProfileImage(): void {
    const preview = this.profileImagePreview();
    if (preview) URL.revokeObjectURL(preview);
    this.profileImage.set(null);
    this.profileImagePreview.set(null);
  }

  toggleTheme(): void { this.themeService.toggleTheme(); }

  logout(): void { this.authService.logout(); this.router.navigate(['/']); }

  selectVehicle(index: number): void {
    this.searched.set(false);
    this.searchResult.set(null);
    this.searchError.set('');
    this.selectedVehicleIndex.set(index);
  }

  updateSearchQuery(value: string): void {
    this.query.set(value);
    this.searched.set(false);
    this.searchResult.set(null);
    this.searchError.set('');
    this.searchRequestSubscription?.unsubscribe();
    this.searchLoading.set(false);
  }

  search(): void {
    const term = this.query().trim().replace(/\s+/g, '').toUpperCase();
    this.searched.set(true);
    this.searchResult.set(null);
    this.searchError.set('');
    this.searchRequestSubscription?.unsubscribe();

    if (!term) {
      this.searchError.set('Enter a registration number to search.');
      return;
    }

    this.searchLoading.set(true);
    this.searchRequestSubscription = this.apiService.get<VehicleLookupResponse>(`/vehicle/${encodeURIComponent(term)}`)
      .pipe(finalize(() => this.searchLoading.set(false)))
      .subscribe({
        next: response => {
          const vehicle = response.data;
          if (!vehicle) {
            this.searchError.set('No vehicle was found for that registration number.');
            return;
          }
          const report = vehicle.missingDetails?.[0];
          const location = report
            ? [report.missingAddress, report.city, report.district, report.state, report.country].filter(Boolean).join(', ')
            : '';
          this.searchResult.set({
            id: vehicle.id,
            name: vehicle.vehicleModel || vehicle.vehicleCompany,
            registration: vehicle.regNumber,
            missingDetailsId: report?.id ?? null,
            location: location || null,
            reportedAt: report?.missingDate
              ? `${report.missingDate}${report.missingTime ? `T${report.missingTime}` : ''}`
              : null,
            image: vehicle.imageUrls?.[0] ?? null,
            chassis: vehicle.chassisNumber,
            engine: vehicle.engineNumber,
            color: vehicle.color,
            description: report?.description ?? null,
            status: vehicle.vehicleStatus || report?.vehicleStatus || null,
            owner: vehicle.owner,
            ownerMobile: vehicle.ownerMobile,
            type: vehicle.type,
            vehicleCompany: vehicle.vehicleCompany
          });
        },
        error: error => this.searchError.set(
          error?.error?.status?.message || error?.error?.message || 'Unable to search for this vehicle. Please try again.'
        )
      });
  }

  updateGlobalQuery(value: string): void {
    this.globalQuery.set(value);
    this.clearGlobalSearchResults();
  }

  updateGlobalSearchType(value: string): void {
    if (value !== 'regNumber' && value !== 'model' && value !== 'missingCity' && value !== 'pinCode') return;
    this.globalSearchType.set(value);
    this.clearGlobalSearchResults();
  }

  selectGlobalSearchVehicle(index: number): void {
    if (index >= 0 && index < this.globalSearchResults().length) {
      this.globalSearchSelectedIndex.set(index);
    }
  }

  private clearGlobalSearchResults(): void {
    if (!this.globalSearchActive()) return;
    this.globalSearchActive.set(false);
    this.globalSearchResults.set([]);
    this.globalSearchSelectedIndex.set(0);
    this.globalSearchError.set('');
    this.globalSearchSubscription?.unsubscribe();
    this.globalSearchLoading.set(false);
  }

  searchDashboardVehicles(page = 0): void {
    const term = this.globalQuery().trim();
    this.globalSearchActive.set(true);
    this.searched.set(false);
    this.searchResult.set(null);
    this.globalSearchResults.set([]);
    this.globalSearchSelectedIndex.set(0);
    this.globalSearchError.set('');
    this.globalSearchPage.set(page);
    this.globalSearchSubscription?.unsubscribe();

    if (!term) {
      this.globalSearchError.set(`Enter a value to search by ${this.globalSearchType()}.`);
      return;
    }

    const params = new HttpParams()
      .set(this.globalSearchType(), term)
      .set('page', page)
      .set('size', this.globalSearchPageSize);
    this.globalSearchLoading.set(true);
    this.globalSearchSubscription = this.apiService.get<VehicleSearchResponse>('/vehicles/search', params)
      .pipe(finalize(() => this.globalSearchLoading.set(false)))
      .subscribe({
        next: response => {
          const resultPage = response.data;
          this.globalSearchResults.set((resultPage.content ?? []).map(vehicle => this.toDashboardVehicle(vehicle)));
          this.globalSearchSelectedIndex.set(0);
          this.globalSearchPage.set(resultPage.number);
          this.globalSearchTotalPages.set(resultPage.totalPages);
          this.globalSearchTotalElements.set(resultPage.totalElements);
        },
        error: error => {
          this.globalSearchTotalPages.set(0);
          this.globalSearchTotalElements.set(0);
          this.globalSearchError.set(
            error?.error?.status?.message || error?.error?.message || 'Unable to search missing vehicles. Please try again.'
          );
        }
      });
  }

  private toDashboardVehicle(vehicle: VehicleLookupData): DashboardVehicle {
    const report = vehicle.missingDetails?.[0];
    const location = report
      ? [report.city, report.district, report.state, report.country].filter(Boolean).join(', ')
      : '';
    return {
      id: vehicle.id,
      name: vehicle.vehicleModel || vehicle.vehicleCompany,
      registration: vehicle.regNumber,
      missingDetailsId: report?.id ?? null,
      location: location || null,
      reportedAt: report?.missingDate
        ? `${report.missingDate}${report.missingTime ? `T${report.missingTime}` : ''}`
        : null,
      image: vehicle.imageUrls?.[0] ?? null,
      chassis: vehicle.chassisNumber,
      engine: vehicle.engineNumber,
      color: vehicle.color,
      description: report?.description ?? null,
      status: vehicle.vehicleStatus || report?.vehicleStatus || null,
      owner: vehicle.owner,
      ownerMobile: vehicle.ownerMobile,
      type: vehicle.type,
      vehicleCompany: vehicle.vehicleCompany
    };
  }

  openVehicleDetails(vehicle: DashboardVehicle): void {
    const registration = vehicle.registration?.trim();
    const missingDetailsId = vehicle.missingDetailsId;
    if (!registration || !missingDetailsId) return;

    void this.router.navigate(['/dashboard/vehicle', registration], {
      queryParams: { missingDetailsId }
    });
  }

  private createProfile(): ProfileForm {
    return {
      addressId: 0,
      fullName: this.userName() || '',
      email: this.userEmail() || '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    };
  }

  private createChangePasswordForm(): ChangePasswordForm {
    return { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  private setProfileFromResponse(response: UserProfileResponse): void {
    const profile = response.data;
    this.profileImageUrl.set(profile.profileImageUrl ?? null);
    const address = profile.address;
    this.profile = {
      addressId: address?.id ?? 0,
      fullName: profile.name ?? '',
      email: profile.email ?? this.userEmail() ?? '',
      phone: profile.phone ?? '',
      addressLine1: address?.addressLine1 ?? '',
      addressLine2: address?.addressLine2 ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      postalCode: address?.pinCode ?? '',
      country: address?.country ?? 'India'
    };
    this.savedProfile = { ...this.profile };
  }
}
