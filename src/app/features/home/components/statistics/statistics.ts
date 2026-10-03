import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss'
})
export class StatisticsComponent {

  readonly statistics = [
    {
      icon: 'directions_car',
      value: '12,450',
      label: 'Vehicles Reported'
    },
    {
      icon: 'verified',
      value: '3,840',
      label: 'Vehicles Recovered'
    },
    {
      icon: 'groups',
      value: '25,000+',
      label: 'Registered Users'
    },
    {
      icon: 'public',
      value: '500+',
      label: 'Cities Covered'
    }
  ];

}