export const ApiEndpoints = {

  AUTH: {

    LOGIN: '/auth/login',

    REGISTER: '/auth/register',

    GOOGLE: '/oauth2/authorization/google',

    LOGOUT: '/auth/logout'

  },

  USER: {

    PROFILE: '/users/profile',

    UPDATE_PROFILE: '/users/profile'

  },

  VEHICLE: {

    SEARCH: '/vehicles/search',

    REPORT_MISSING: '/reportMissingVehicle',

    REPORT_FOUND: '/vehicles/report-found',

    MY_REPORTS: '/vehicles/my-reports'

  }

} as const;
