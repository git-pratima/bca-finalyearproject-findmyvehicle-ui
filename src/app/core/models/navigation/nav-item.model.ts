export interface NavItem {

  label: string;

  icon: string;

  route: string;

  requiresAuth?: boolean;

  guestOnly?: boolean;

}