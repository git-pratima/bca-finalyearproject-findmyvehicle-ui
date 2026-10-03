import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../constants/api-endpoints';
import { MissingVehicleReport } from '../models/vehicle/missing-vehicle-report.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class VehicleReportService {
  private readonly api = inject(ApiService);
  reportMissingVehicle(vehicle: MissingVehicleReport, imageFiles: File[] = []): Observable<unknown> {
    const formData = new FormData();
    formData.append('vehicle', new Blob([JSON.stringify(vehicle)], { type: 'application/json' }));
    imageFiles.forEach(file => formData.append('imageFile', file, file.name));
    return this.api.post(ApiEndpoints.VEHICLE.REPORT_MISSING, formData);
  }
}
