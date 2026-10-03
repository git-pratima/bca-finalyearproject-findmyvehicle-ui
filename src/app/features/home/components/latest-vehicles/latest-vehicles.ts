import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { RecentMissingVehiclesData } from '../../../../core/models/home-dashboard.model';

@Component({ selector: 'app-latest-vehicles', standalone: true, imports: [CommonModule, MatIconModule, RouterLink], templateUrl: './latest-vehicles.html', styleUrl: './latest-vehicles.scss' })
export class LatestVehiclesComponent {
  @Input() recentMissingVehicles: RecentMissingVehiclesData | null = null;
}
