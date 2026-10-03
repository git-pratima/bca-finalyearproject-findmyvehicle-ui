import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';

@Component({

  selector: 'app-cta',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    ScrollRevealDirective
  ],

  templateUrl: './cta.html',

  styleUrl: './cta.scss'

})

export class CtaComponent {

}
