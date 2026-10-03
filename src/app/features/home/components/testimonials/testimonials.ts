import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss'
})
export class TestimonialsComponent {

  readonly testimonials = [

    {
      name: 'Rahul Sharma',
      city: 'Bengaluru',
      message: 'My stolen bike was found within 48 hours thanks to this platform.'
    },

    {
      name: 'Priya Nair',
      city: 'Mysuru',
      message: 'I received multiple genuine leads and recovered my car safely.'
    },

    {
      name: 'Arjun Kumar',
      city: 'Chennai',
      message: 'The police contacted me after someone recognized my vehicle online.'
    }

  ];

}