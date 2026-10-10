import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { HomeHeaderData, HomeStatisticData } from '../../../../core/models/home-dashboard.model';

@Component({
  selector: 'app-hero', standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule, ScrollRevealDirective, TranslatePipe],
  templateUrl: './hero.html', styleUrl: './hero.scss'
})
export class HeroComponent {
  @Input() header: HomeHeaderData | null = null;
  @Input() statistics: HomeStatisticData[] = [];

  searchTerm = '';
  searchExpanded = true;

  constructor(private readonly router: Router) {}

  get titleBeforeHighlight(): string {
    const title = this.header?.title ?? '';
    const word = this.header?.highlightedWord ?? '';
    const index = word ? title.indexOf(word) : -1;
    return index < 0 ? title : title.slice(0, index);
  }

  get highlightedTitleWord(): string {
    const title = this.header?.title ?? '';
    const word = this.header?.highlightedWord ?? '';
    return word && title.includes(word) ? word : '';
  }

  get titleAfterHighlight(): string {
    const title = this.header?.title ?? '';
    const word = this.highlightedTitleWord;
    const index = word ? title.indexOf(word) : -1;
    return index < 0 ? '' : title.slice(index + word.length);
  }

  searchVehicles(): void {
    const query = this.searchTerm.trim();
    this.router.navigate(['/search'], { queryParams: query ? { q: query } : {} });
  }
}
