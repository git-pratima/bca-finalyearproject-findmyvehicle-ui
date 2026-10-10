import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './layouts/public-layout/public-layout';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { authGuard } from './core/guards/auth.guard';
import { clearAuthOnHomeGuard } from './core/guards/clear-auth-on-home.guard';

export const routes: Routes = [

  // Public Pages

  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        canActivate: [clearAuthOnHomeGuard],
        data: {
          seo: {
            title: 'Find My Vehicle | Missing & Stolen Vehicle Recovery',
            description: 'Search and report missing or stolen vehicles across India. Find My Vehicle connects owners, communities and authorities to support faster recovery.',
            robots: 'index, follow'
          }
        },
        loadComponent: () =>
          import('./features/home/pages/home/home')
            .then(c => c.HomeComponent)
      },
      {
        path: 'search',
        canActivate: [authGuard],
        data: {
          seo: {
            title: 'Search Missing Vehicles | Find My Vehicle',
            description: 'Search missing and stolen vehicle reports by registration number, model, or location.',
            robots: 'noindex, follow'
          }
        },
        loadComponent: () =>
          import('./features/search/pages/search/search')
            .then(c => c.SearchComponent)
      },
      {
        path: 'how-it-works',
        data: {
          seo: {
            title: 'How It Works | Find My Vehicle',
            description: 'Learn how vehicle reports, community visibility, and useful leads work together.',
            robots: 'index, follow'
          },
          publicPage: {
            eyebrow: 'A clear path forward',
            title: 'How it works',
            introduction: 'A missing vehicle is stressful. Find My Vehicle helps owners share the right information and makes it easier for the community to keep an eye out.',
            sections: [
              { icon: 'edit_note', title: 'Create a report', body: 'Sign in and provide the vehicle details, last known location, and any helpful description. Clear, accurate information helps others recognize what to look for.' },
              { icon: 'verified_user', title: 'Help keep reports useful', body: 'Reports are presented with their vehicle and incident details together, so people can understand the alert and distinguish it from other listings.' },
              { icon: 'campaign', title: 'Build community visibility', body: 'The report can be found by people browsing vehicle alerts. More visibility gives more people a chance to notice a relevant lead.' },
              { icon: 'volunteer_activism', title: 'Share a useful lead', body: 'If you recognize a vehicle, use the available vehicle details to contact its owner. Do not approach a vehicle or put yourself at risk.' }
            ],
            actionLabel: 'Sign in to report a vehicle',
            actionRoute: '/dashboard/report-missing'
          }
        },
        loadComponent: () =>
          import('./features/public-info/pages/public-info/public-info')
            .then(c => c.PublicInfoComponent)
      },
      {
        path: 'about',
        data: {
          seo: {
            title: 'About Us | Find My Vehicle',
            description: 'Find My Vehicle connects vehicle owners and the community around missing vehicle reports.',
            robots: 'index, follow'
          },
          publicPage: {
            eyebrow: 'About Find My Vehicle',
            title: 'Better visibility starts with community',
            introduction: 'Find My Vehicle is a platform for sharing missing vehicle information and helping people act on useful sightings.',
            sections: [
              { icon: 'groups', title: 'A shared effort', body: 'Owners can publish the information people need to recognize a vehicle, while community members can stay aware of reports in their area.' },
              { icon: 'visibility', title: 'Information that is easy to find', body: 'Vehicle and report details are organized together, making it simpler to search, review, and share relevant information.' },
              { icon: 'favorite', title: 'Recovery with care', body: 'We encourage responsible, safety-first participation. Share information with the owner and local authorities when appropriate; never put yourself in danger.' }
            ],
            actionLabel: 'Explore vehicle reports',
            actionRoute: '/search'
          }
        },
        loadComponent: () =>
          import('./features/public-info/pages/public-info/public-info')
            .then(c => c.PublicInfoComponent)
      },
      {
        path: 'contact',
        data: {
          seo: {
            title: 'Contact Us | Find My Vehicle',
            description: 'Find the right way to manage a report or share a vehicle sighting.',
            robots: 'index, follow'
          },
          publicPage: {
            eyebrow: 'Contact and support',
            title: 'How can we help?',
            introduction: 'Choose the option that best matches what you need. Sign in to manage your reports, or open a vehicle listing to share a sighting with its owner.',
            sections: [
              { icon: 'manage_accounts', title: 'Manage your report', body: 'Sign in to review your vehicles and missing reports from your dashboard.' },
              { icon: 'travel_explore', title: 'Looking for a vehicle?', body: 'Sign in to search the vehicle listings and review available report details.' },
              { icon: 'campaign', title: 'Share a sighting', body: 'Open a vehicle details page and use Notify Owner to send a message with what you observed. If there is immediate danger, contact local emergency services.' }
            ],
            actionLabel: 'Go to login',
            actionRoute: '/login'
          }
        },
        loadComponent: () =>
          import('./features/public-info/pages/public-info/public-info')
            .then(c => c.PublicInfoComponent)
      },
      {
        path: 'vehicle/:regNumber',
        data: {
          seo: {
            title: 'Vehicle Details | Find My Vehicle',
            description: 'View details and report a sighting of a missing vehicle.',
            robots: 'noindex, follow'
          }
        },
        loadComponent: () =>
          import('./features/vehicle-details/pages/vehicle-details/vehicle-details')
            .then(c => c.VehicleDetailsComponent)
      }
    ]
  },

  // Member area
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: {
      seo: {
        title: 'Dashboard | Find My Vehicle',
        description: 'Manage your missing vehicle reports and searches.',
        robots: 'noindex, nofollow'
      }
    },
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard')
        .then(c => c.DashboardComponent),
    children: [
      {
        path: 'vehicle/:regNumber',
        data: {
          seo: {
            title: 'Vehicle Details | Find My Vehicle',
            description: 'View details and report a sighting of a missing vehicle.',
            robots: 'noindex, nofollow'
          }
        },
        loadComponent: () =>
          import('./features/vehicle-details/pages/vehicle-details/vehicle-details')
            .then(c => c.VehicleDetailsComponent)
      },
      {
        path: 'my-reports',
        data: {
          seo: {
            title: 'My Reports | Find My Vehicle',
            description: 'View and manage the missing vehicle reports you have submitted.',
            robots: 'noindex, nofollow'
          }
        },
        loadComponent: () =>
          import('./features/dashboard/pages/my-reports/my-reports')
            .then(c => c.MyReportsComponent)
      },
      {
        path: 'my-vehicles',
        data: {
          seo: {
            title: 'My Vehicles | Find My Vehicle',
            description: 'View the vehicles you have registered with Find My Vehicle.',
            robots: 'noindex, nofollow'
          }
        },
        loadComponent: () =>
          import('./features/dashboard/pages/my-vehicles/my-vehicles')
            .then(c => c.MyVehiclesComponent)
      },
      {
        path: 'all-reports',
        data: {
          seo: {
            title: 'All Reports | Find My Vehicle',
            description: 'Browse missing vehicle reports shared on Find My Vehicle.',
            robots: 'noindex, nofollow'
          }
        },
        loadComponent: () =>
          import('./features/dashboard/pages/all-reports/all-reports')
            .then(c => c.AllReportsComponent)
      },
      {
        path: 'all-vehicles',
        data: {
          seo: {
            title: 'All Vehicles | Find My Vehicle',
            description: 'Browse vehicles listed on Find My Vehicle.',
            robots: 'noindex, nofollow'
          }
        },
        loadComponent: () =>
          import('./features/dashboard/pages/all-vehicles/all-vehicles')
            .then(c => c.AllVehiclesComponent)
      },
      {
        path: 'notifications',
        data: {
            seo: {
              title: 'Notifications | Find My Vehicle',
              description: 'Review vehicle sighting notifications.',
              robots: 'noindex, nofollow'
            }
        },
        loadComponent: () =>
            import('./features/dashboard/pages/notifications/notifications')
              .then(c => c.NotificationsComponent)
      },
      {
        path: 'feedback',
        data: {
          seo: {
            title: 'Feedback | Find My Vehicle',
            description: 'Review community feedback for missing vehicle reports.',
            robots: 'noindex, nofollow'
          }
        },
        loadComponent: () =>
          import('./features/dashboard/pages/feedback/feedback')
            .then(c => c.FeedbackComponent)
      },
      {
        path: 'help-support',
        data: {
          seo: {
            title: 'Help & Support | Find My Vehicle',
            description: 'Find nearby emergency services and helpful contact numbers.',
            robots: 'noindex, nofollow'
          }
        },
        loadComponent: () =>
          import('./features/dashboard/pages/help-support/help-support')
            .then(c => c.HelpSupportComponent)
      },
      {
        path: 'settings',
        data: {
          seo: {
            title: 'Settings | Find My Vehicle',
            description: 'Manage your Find My Vehicle appearance preferences.',
            robots: 'noindex, nofollow'
          }
        },
        loadComponent: () =>
          import('./features/dashboard/pages/settings/settings')
            .then(c => c.SettingsComponent)
      },
      {
        path: 'report-missing',
        loadComponent: () => import('./features/vehicle-reports/pages/report-missing/report-missing')
          .then(c => c.ReportMissingComponent)
      }
    ]
  },
  {
    path: 'report-missing',
    redirectTo: 'dashboard/report-missing',
    pathMatch: 'full'
  },
  {
    path: 'report',
    redirectTo: 'dashboard/report-missing',
    pathMatch: 'full'
  },

  // Authentication Pages

  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
      path: 'auth/social-callback',
      data: { seo: { title: 'Signing In | Find My Vehicle', description: 'Completing sign-in.', robots: 'noindex, nofollow' } },
      loadComponent: () =>
        import('./features/auth/pages/social-callback/social-callback')
          .then(c => c.SocialCallback)
    },

      {
        path: 'login',
        data: { seo: { title: 'Login | Find My Vehicle', description: 'Sign in to Find My Vehicle.', robots: 'noindex, nofollow' } },
        loadComponent: () =>
          import('./features/auth/pages/login/login')
            .then(c => c.Login)
      },

      {
        path: 'register',
        data: { seo: { title: 'Register | Find My Vehicle', description: 'Create a Find My Vehicle account.', robots: 'noindex, nofollow' } },
        loadComponent: () =>
          import('./features/auth/pages/register/register')
            .then(c => c.Register)
      },

      {
        path: 'forgot-password',
        data: { seo: { title: 'Reset Password | Find My Vehicle', description: 'Reset your Find My Vehicle password.', robots: 'noindex, nofollow' } },
        loadComponent: () =>
          import('./features/auth/pages/forgot-password/forgot-password')
            .then(c => c.ForgotPassword)
      },

      {
        path: 'verify-email',
        data: { seo: { title: 'Verify Email | Find My Vehicle', description: 'Verify your Find My Vehicle email.', robots: 'noindex, nofollow' } },
        loadComponent: () =>
          import('./features/auth/pages/verify-email/verify-email')
            .then(c => c.VerifyEmail)
      }

    ]
  },

  // Fallback

  {
    path: '**',
    redirectTo: ''
  }

];
