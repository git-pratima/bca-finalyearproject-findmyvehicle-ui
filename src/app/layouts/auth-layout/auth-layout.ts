import { Component } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

import { RouterOutlet } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

@Component({

    selector: 'app-auth-layout',

    standalone: true,

    imports: [
        RouterOutlet,
        MatIconModule,
        TranslatePipe

    ],

    templateUrl: './auth-layout.html',

    styleUrl: './auth-layout.scss'

})

export class AuthLayoutComponent {

}