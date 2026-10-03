import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../../shared/components/layout/header/header';
import { FooterComponent } from '../../shared/components/layout/footer/footer';
import { MobileNavComponent } from '../../shared/components/layout/mobile-nav/mobile-nav';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MobileNavComponent
  ],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss'
})
export class PublicLayoutComponent {

  drawerOpen = false;

  toggleDrawer(): void {

    this.drawerOpen = !this.drawerOpen;

  }

  closeDrawer(): void {

    this.drawerOpen = false;

  }

}