import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './features.html',
  styleUrl: './features.scss'
})
export class FeaturesComponent {

  readonly features = [
    {
      icon: 'verified_user',
      title: 'Secure Reporting',
      description: 'Vehicle reports are securely managed with verified information.'
    },
    {
      icon: 'bolt',
      title: 'Fast Vehicle Search',
      description: 'Search vehicle information instantly using registration details.'
    },
    {
      icon: 'groups',
      title: 'Community Support',
      description: 'Citizens can help identify and report missing vehicles.'
    },
    {
      icon: 'location_on',
      title: 'Location Ready',
      description: 'Designed for future GPS and location-based recovery features.'
    },
    {
      icon: 'local_police',
      title: 'Police Friendly',
      description: 'Easy sharing of verified reports with law enforcement.'
    },
    {
      icon: 'devices',
      title: 'Responsive Design',
      description: 'Works seamlessly across desktop, tablet and mobile devices.'
    }
  ];

}