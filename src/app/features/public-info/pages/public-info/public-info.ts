import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

type PublicInfoSection = {
  icon: string;
  title: string;
  body: string;
};

type PublicPageContent = {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: PublicInfoSection[];
  actionLabel: string;
  actionRoute: string;
};

@Component({
  selector: 'app-public-info',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './public-info.html',
  styleUrl: './public-info.scss'
})
export class PublicInfoComponent {
  readonly content = inject(ActivatedRoute).snapshot.data['publicPage'] as PublicPageContent;
}
