import { NavItem } from '../models/navigation/nav-item.model';

export const PUBLIC_NAVIGATION: NavItem[] = [

  {
    label: 'Home',
    icon: 'home',
    route: '/'
  },

  {
    label: 'How It Works',
    icon: 'lightbulb',
    route: '/how-it-works'
  },

  {
    label: 'About Us',
    icon: 'info',
    route: '/about'
  },

  {
    label: 'Contact Us',
    icon: 'mail',
    route: '/contact'
  }

];
