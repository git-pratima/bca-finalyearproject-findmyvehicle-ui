import { NavItem } from '../models/navigation/nav-item.model';

export const PUBLIC_NAVIGATION: NavItem[] = [

  {
    label: 'Home',
    labelHindi: 'होम',
    icon: 'home',
    route: '/'
  },

  {
    label: 'How It Works',
    labelHindi: 'यह कैसे काम करता है',
    icon: 'lightbulb',
    route: '/how-it-works'
  },

  {
    label: 'About Us',
    labelHindi: 'हमारे बारे में',
    icon: 'info',
    route: '/about'
  },

  {
    label: 'Contact Us',
    labelHindi: 'संपर्क करें',
    icon: 'mail',
    route: '/contact'
  }

];
