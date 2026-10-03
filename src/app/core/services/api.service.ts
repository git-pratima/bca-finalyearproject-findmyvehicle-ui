import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  get<T>(
    url: string,
    params?: HttpParams
  ): Observable<T> {

    return this.http.get<T>(
      this.config.apiUrl + url,
      { params }
    );

  }

  post<T>(
    url: string,
    body: unknown
  ): Observable<T> {

    return this.http.post<T>(
      this.config.apiUrl + url,
      body
    );

  }

  put<T>(
    url: string,
    body: unknown
  ): Observable<T> {

    return this.http.put<T>(
      this.config.apiUrl + url,
      body
    );

  }

  patch<T>(
    url: string,
    body: unknown
  ): Observable<T> {

    return this.http.patch<T>(
      this.config.apiUrl + url,
      body
    );

  }

  delete<T>(
    url: string
  ): Observable<T> {

    return this.http.delete<T>(
      this.config.apiUrl + url
    );

  }

}