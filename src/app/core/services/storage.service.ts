import { Injectable } from '@angular/core';
import { StorageKeys } from '../constants/storage-keys';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  setAccessToken(token: string): void {

    localStorage.setItem(StorageKeys.ACCESS_TOKEN, token);

  }

  getAccessToken(): string | null {

    return localStorage.getItem(StorageKeys.ACCESS_TOKEN);

  }

  removeAccessToken(): void {

    localStorage.removeItem(StorageKeys.ACCESS_TOKEN);

  }

  clear(): void {

    localStorage.clear();

  }

}