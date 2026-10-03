import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from './config.service';

export interface UserProfileRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: {
    id: number;
    addressLine1: string;
    addressLine2: string;
    city: string;
    /** Omit this optional enum field when no state has been selected. */
    state?: string;
    pinCode: string;
    country: string;
  };
}

export interface UserProfileResponse {
  status: {
    status: number;
    message: string;
  };
  data: UserProfileRequest & {
    profileImageUrl: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  createProfile(profile: UserProfileRequest, imageFile: File | null): Observable<unknown> {
    const formData = new FormData();
    formData.append('userProfile', new Blob([JSON.stringify(profile)], { type: 'application/json' }));
    if (imageFile) formData.append('imageFile', imageFile, imageFile.name);
    return this.http.post(`${this.config.apiUrl}/profile/create`, formData);
  }

  getProfile(userId: number): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.config.apiUrl}/profile/${userId}`);
  }
}
