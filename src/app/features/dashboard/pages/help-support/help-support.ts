import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { HelpSupportService, NearbyHelpPlace } from '../../services/help-support.service';

type HelpCategory = {
  id: 'fuel' | 'police' | 'hospital' | 'emergency';
  title: string;
  icon: string;
};

@Component({
  selector: 'app-help-support',
  imports: [DecimalPipe, MatIconModule],
  templateUrl: './help-support.html',
  styleUrl: './help-support.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpSupportComponent {
  readonly help = inject(HelpSupportService);
  readonly categories: HelpCategory[] = [
    { id: 'fuel', title: 'Nearest petrol pump', icon: 'local_gas_station' },
    { id: 'police', title: 'Nearest police station', icon: 'local_police' },
    { id: 'hospital', title: 'Nearest hospital', icon: 'local_hospital' },
    { id: 'emergency', title: 'Nearest emergency service', icon: 'emergency' }
  ];

  placeFor(category: HelpCategory['id']): NearbyHelpPlace | null {
    return this.help.places().find(place => place.category === category) ?? null;
  }

  dialablePhone(phone: string | null): string | null {
    return this.help.dialablePhone(phone);
  }

  mapUrl(place: NearbyHelpPlace): string {
    return this.help.mapUrl(place);
  }
}
