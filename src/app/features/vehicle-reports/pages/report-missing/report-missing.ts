import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../../core/services/language.service';
import { MissingVehicleReport } from '../../../../core/models/vehicle/missing-vehicle-report.model';
import { VehicleReportService } from '../../../../core/services/vehicle-report.service';

@Component({ selector: 'app-report-missing', standalone: true, imports: [ReactiveFormsModule, RouterLink, MatIconModule, TranslatePipe], templateUrl: './report-missing.html', styleUrl: './report-missing.scss' })
export class ReportMissingComponent implements OnInit {
  private readonly fb = inject(FormBuilder); private readonly reports = inject(VehicleReportService); private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly languageService = inject(LanguageService);
  readonly loading = signal(false); readonly submitted = signal(false); readonly error = signal(''); readonly selectedImages = signal<File[]>([]); readonly imagePreviews = signal<string[]>([]);
  readonly photoSlots = [0, 1, 2, 3];
  readonly form = this.fb.nonNullable.group({
    regNumber: ['', [Validators.required,
      Validators.pattern(/^[A-Za-z0-9 -]{6,15}$/)]], 
      vehicleCompany: ['', Validators.required],
      vehicleModel: ['', Validators.required],
      type: ['', Validators.required],
      color: ['', Validators.required],
      chassisNumber: ['', Validators.required],
      engineNumber: ['', Validators.required],
      owner: ['', Validators.required],
      ownerEmail: ['', [Validators.required, Validators.email]],
      ownerMobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      missingDate: ['', Validators.required],
      missingTime: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      district: ['', Validators.required],
      state: ['', Validators.required],
      country: ['INDIA', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      reward: [''],
      description: ['', [Validators.required, Validators.minLength(5)]]
  });
  ngOnInit(): void {
    const navigationState = this.router.getCurrentNavigation()?.extras.state;
    const vehicle = navigationState?.['vehicle'] ??
      (isPlatformBrowser(this.platformId) ? window.history.state?.vehicle : undefined);
    if (!vehicle || typeof vehicle !== 'object') return;

    const details = vehicle as Record<string, unknown>;
    const value = (key: string): string => {
      const candidate = details[key];
      return typeof candidate === 'string' ? candidate : '';
    };
    this.form.patchValue({
      regNumber: value('regNumber'),
      vehicleCompany: value('vehicleCompany'),
      vehicleModel: value('vehicleModel'),
      type: value('type'),
      color: value('color'),
      chassisNumber: value('chassisNumber'),
      engineNumber: value('engineNumber'),
      owner: value('owner'),
      ownerMobile: value('ownerMobile')
    });
  }
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const available = 4 - this.selectedImages().length;
    if (!available) { this.error.set(this.languageService.text('You can upload a maximum of 4 vehicle photos.', 'आप अधिकतम 4 वाहन तस्वीरें अपलोड कर सकते हैं।')); return; }
    if (files.length > available) this.error.set(this.languageService.text(`Only ${available} more vehicle photo${available === 1 ? '' : 's'} can be added.`, `केवल ${available} और वाहन तस्वीरें जोड़ी जा सकती हैं।`)); else this.error.set('');
    const filesToAdd = files.slice(0, available);
    this.selectedImages.update(images => [...images, ...filesToAdd]);
    this.imagePreviews.update(previews => [...previews, ...filesToAdd.map(file => URL.createObjectURL(file))]);
    input.value = '';
  }

  removeImage(index: number): void {
    const preview = this.imagePreviews()[index];
    if (preview) URL.revokeObjectURL(preview);
    this.selectedImages.update(images => images.filter((_, imageIndex) => imageIndex !== index));
    this.imagePreviews.update(previews => previews.filter((_, previewIndex) => previewIndex !== index));
    this.error.set('');
  }
  submit(): void {
    if (this.loading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const labels: Record<string, string> = {
        regNumber: this.languageService.text('registration number', 'पंजीकरण संख्या'),
        vehicleCompany: this.languageService.text('vehicle company', 'वाहन निर्माता कंपनी'),
        vehicleModel: this.languageService.text('vehicle model', 'वाहन का मॉडल'),
        type: this.languageService.text('vehicle type', 'वाहन का प्रकार'),
        color: this.languageService.text('colour', 'रंग'),
        chassisNumber: this.languageService.text('chassis number', 'चेसिस नंबर'),
        engineNumber: this.languageService.text('engine number', 'इंजन नंबर'),
        owner: this.languageService.text('owner name', 'मालिक का नाम'),
        ownerEmail: this.languageService.text('email address', 'ईमेल पता'),
        ownerMobile: this.languageService.text('mobile number', 'मोबाइल नंबर'),
        missingDate: this.languageService.text('missing date', 'लापता होने की तारीख'),
        missingTime: this.languageService.text('missing time', 'लापता होने का समय'),
        address: this.languageService.text('last seen address', 'आखिरी बार देखा गया पता'),
        city: this.languageService.text('city', 'शहर'),
        district: this.languageService.text('district', 'ज़िला'),
        state: this.languageService.text('state', 'राज्य'),
        country: this.languageService.text('country', 'देश'),
        pinCode: this.languageService.text('PIN code', 'पिन कोड'),
        description: this.languageService.text('description', 'विवरण')
      };
      const invalidFields = Object.keys(this.form.controls).filter(key => this.form.controls[key as keyof typeof this.form.controls].invalid).map(key => labels[key] ?? key);
      this.error.set(`${this.languageService.text('Please complete:', 'कृपया ये विवरण भरें:')} ${invalidFields.join(', ')}.`);
      return;
    }
    this.error.set(''); this.loading.set(true); const v = this.form.getRawValue();
    const vehicle: MissingVehicleReport = { color: v.color, ownerEmail: v.ownerEmail, engineNumber: v.engineNumber, chassisNumber: v.chassisNumber, vehicleCompany: v.vehicleCompany, owner: v.owner, ownerMobile: v.ownerMobile, type: v.type, regNumber: v.regNumber.toUpperCase().replace(/\s/g, ''), vehicleModel: v.vehicleModel, vehicleStatus: 'MISSING', missingDetails: { pinCode: v.pinCode, city: v.city, district: v.district, reward: v.reward, state: v.state, missingTime: v.missingTime, missingDate: v.missingDate, address: v.address, country: v.country, description: v.description } };
    this.reports.reportMissingVehicle(vehicle, this.selectedImages()).pipe(finalize(() => this.loading.set(false))).subscribe({ next: () => this.submitted.set(true), error: e => this.error.set(e?.error?.status?.message || e?.error?.message || this.languageService.text('Unable to submit the report. Please try again.', 'रिपोर्ट सबमिट नहीं हो सकी। कृपया फिर से प्रयास करें।')) });
  }
  returnToDashboard(): void { this.router.navigate(['/dashboard']); }
}
