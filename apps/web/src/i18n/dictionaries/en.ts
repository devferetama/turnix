export const en = {
  metadata: {
    description:
      "Turnix is a multi-tenant SaaS platform for appointment booking, scheduling, queues, and service-attention operations.",
  },
  branding: {
    appName: "Turnix",
    tagline: "Appointments and service operations",
  },
  common: {
    localeSwitcher: {
      label: "Language",
      es: "ES",
      en: "EN",
    },
    theme: {
      light: "Switch to light theme",
      dark: "Switch to dark theme",
      system: "Switch to system theme",
    },
    shell: {
      workspace: "Workspace",
      backoffice: "Backoffice",
      userMenuPlaceholder: "User menu placeholder",
      sharedFoundation:
        "Public booking and protected operations share a single modular frontend foundation.",
      tenantReady: "Tenant-aware navigation and authorization ready.",
    },
    actions: {
      goHome: "Go to home",
      openDashboard: "Open dashboard",
      bookAppointment: "Book appointment",
      staffLogin: "Staff login",
      beginBookingFlow: "Begin booking flow",
      exploreBackofficeFoundation: "Explore backoffice foundation",
      startBooking: "Start booking",
      lookupAppointment: "Find appointment",
      openStaffBackoffice: "Open staff backoffice",
      continueWithService: "Continue with this service",
      browseServices: "Browse services",
      changeService: "Change service",
      confirmAppointment: "Confirm appointment",
      viewAppointment: "View appointment",
      returnHome: "Return home",
      bookAnotherAppointment: "Book another appointment",
      startNewBooking: "Start a new booking",
      signInWithCredentials: "Sign in with credentials",
      continueWithGoogle: "Continue with Google",
      googlePrepared: "Google provider prepared",
      newOperationalAction: "New operational action",
      newService: "New service",
      previous: "Previous",
      next: "Next",
      retry: "Try again",
      closeNavigation: "Close navigation",
      signOut: "Sign out",
      signingOut: "Signing out...",
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
    labels: {
      service: "Service",
      branch: "Branch",
      when: "When",
      contact: "Contact",
      email: "Email",
      phone: "Phone",
      password: "Password",
      fullName: "Full name",
      tenantSlug: "Tenant slug",
      bookingCode: "Booking code",
      availableSlots: "Available slots",
      role: "Role",
      status: "Status",
    },
    messages: {
      loadingApp: "Loading Turnix workspace...",
      routeNotFound: "Route not found",
      routeNotFoundTitle: "This path is not part of the current Turnix workspace.",
      routeNotFoundDescription:
        "The starter is ready for public booking and protected operations, but this route has not been implemented yet.",
    },
    table: {
      result: "record",
      results: "records",
      page: "Page",
      of: "of",
      searchRecords: "Search records...",
      noResultsFound: "No results found",
      adjustFilters: "Adjust filters or add more data to populate this table.",
    },
    statuses: {
      pending: "pending",
      confirmed: "confirmed",
      checked_in: "checked in",
      in_progress: "in progress",
      completed: "completed",
      cancelled: "cancelled",
      no_show: "no show",
      rescheduled: "rescheduled",
      open: "open",
      full: "full",
      blocked: "blocked",
      active: "active",
      inactive: "inactive",
      configured: "configured",
      ready: "ready",
      in_review: "in review",
    },
    roles: {
      SUPER_ADMIN: "super admin",
      TENANT_ADMIN: "tenant admin",
      OPERATOR: "operator",
      VIEWER: "viewer",
    },
  },
  navigation: {
    dashboard: {
      title: "Dashboard",
      description: "Operational overview, volume, and quick actions.",
    },
    appointments: {
      title: "Appointments",
      description: "Monitor bookings, statuses, and daily service flow.",
    },
    services: {
      title: "Services",
      description: "Configure service catalog, durations, and activity status.",
    },
    branches: {
      title: "Branches",
      description: "Manage branch locations, address data, and active status.",
    },
    settings: {
      title: "Settings",
      description:
        "Tenant, authentication, scheduling, and governance settings.",
    },
  },
  publicLayout: {
    tenantWorkspace: "Municipal Services Workspace",
  },
  home: {
    experiences: [
      {
        title: "Public experience",
        description:
          "Designed for clarity, low-friction booking, and fast availability review without administrative authentication.",
      },
      {
        title: "Protected backoffice",
        description:
          "Prepared for role-aware operations, service configuration, scheduling management, and reporting.",
      },
    ],
    architecture:
      "The architecture keeps domain models, queries, forms, tables, and route protection aligned across both experiences from the start.",
    foundationTitle: "Turnix foundation choices",
    foundationDescription:
      "The starter is structured for public booking today and multi-tenant, NestJS-backed operations as the platform grows.",
  },
  booking: {
    hero: {
      eyebrow: "Public booking",
      title:
        "Fast, low-friction appointment flows for citizens and customers.",
      description:
        "Turnix starts with public institutions, but the booking foundation is designed to scale across any organization that coordinates services, queues, and attention flows.",
      signals: [
        "Guided multi-step booking",
        "Clear public-service experience",
        "Ready for lookup and rescheduling",
      ],
      whyTitle: "Why the foundation matters",
      whyDescription:
        "The public and operational experiences share one platform, but each is optimized for its own context.",
      highlights: [
        {
          title: "Fast booking",
          description:
            "Low-friction flows for citizens and customers on any device.",
        },
        {
          title: "Operational control",
          description:
            "Backoffice-ready foundations for staff, operators, and admins.",
        },
        {
          title: "Tenant-ready",
          description:
            "Prepared for multi-organization growth and role-aware access.",
        },
      ],
    },
    overview: {
      title: "Designed for real booking operations",
      description:
        "The public flow is lightweight by default, but the structure is ready for booking lookup, cancellation, rescheduling, and intercepting modal routes.",
      cards: [
        "Service discovery stays simple and fast.",
        "Appointment selection is cleanly separated from identity capture.",
        "Confirmation can grow into lookup and post-booking management.",
      ],
    },
    flow: {
      title: "Appointment flow",
      stepLabel: "Step",
      steps: [
        "Select service",
        "Choose slot and add details",
        "Review confirmation",
      ],
    },
    servicesPage: {
      title: "Choose a service",
      description:
        "Shared design-system components live in the platform layer, while this booking UI stays inside the public-booking module.",
      filterEyebrow: "Find the right service",
      filterDescription:
        "Search the public catalog and choose the service that matches your visit before selecting a time.",
      searchPlaceholder: "Search by service name or keyword",
      loading: "Loading available public services...",
      cardDescription:
        "A public-facing service ready for calm, guided appointment booking.",
      minuteBlock: "minute appointment",
      durationLabel: "Estimated duration",
      branchLabel: "Location coverage",
      multipleBranches: "Multiple branches available",
      bookingPolicyLabel: "Booking policy",
      bookingPolicyInstant:
        "This service can confirm immediately when an available slot is selected.",
      bookingPolicyApproval:
        "This service may require manual review before final confirmation.",
      instantConfirmation: "Instant confirmation",
      requiresApproval: "Approval required",
      retry: "Try again",
      errorTitle: "We couldn't load public services",
      errorDescription:
        "Check the public booking API connection or try again in a moment.",
      emptyTitle: "No public services are available right now",
      emptyDescription:
        "Try a different search term or come back later when new services are published.",
    },
    formPage: {
      title: "Complete your appointment",
      description:
        "Select an available slot, capture contact details, and confirm the booking.",
    },
    confirmationPage: {
      title: "Booking confirmation",
      description:
        "This page is positioned to grow into future lookup, cancellation, and reschedule flows.",
    },
    lookupPage: {
      title: "Find your appointment",
      description:
        "Enter the confirmation code to review appointment details or cancel it when the current status still allows it.",
    },
    appointmentPage: {
      title: "Appointment details",
      description:
        "Review the appointment status, location, and booking details using the public confirmation code.",
    },
    form: {
      incompleteDetails: "Please complete all required booking details.",
      loadingService: "Loading selected service...",
      serviceLoadErrorTitle: "We couldn't load the selected service",
      serviceLoadErrorDescription:
        "The service catalog request failed before the booking form could be prepared.",
      retryServices: "Reload services",
      serviceNotFoundTitle: "This service is no longer available",
      serviceNotFoundDescription:
        "Return to the catalog and choose another public service to continue.",
      selectServiceFirstTitle: "Select a service first",
      selectServiceFirstDescription:
        "The booking flow keeps service choice and slot selection separate so future cancellation, lookup, and modal routes can evolve cleanly.",
      selectedService: "Service selected",
      selectedServiceDescription:
        "You can go back and choose another service before confirming the appointment.",
      branchSummaryLabel: "Branch coverage",
      branchSummaryDescription:
        "This service is available across more than one public attention point.",
      confirmationSummaryLabel: "What happens next",
      confirmationSummaryInstant:
        "Once you submit, you'll receive a direct confirmation with your appointment details.",
      confirmationSummaryApproval:
        "Once you submit, the request may remain pending until the team reviews it.",
      chooseTimeTitle: "Choose a time and complete the booking",
      chooseTimeDescription:
        "Slot selection is kept in client state so the public flow can span multiple steps without introducing a global application store.",
      dateFilterLabel: "Preferred date",
      dateFilterHint: "Optional. Leave empty to browse the next available slots.",
      branchFilterLabel: "Preferred branch",
      branchFilterHint: "Optional. Useful when this service is offered in multiple locations.",
      branchFilterAll: "All branches",
      loadingTimes: "Loading available times...",
      slotLoadErrorTitle: "We couldn't load available slots",
      slotLoadErrorDescription:
        "Try another date or retry the request to see the next public times.",
      retrySlots: "Reload slots",
      noSlots: "No slots are currently available for this service.",
      noSlotsForDate:
        "No slots are available for the selected date. Try another day or clear the date filter.",
      slotOptionsLabel: "available option(s)",
      slotsRemainingSuffix: "slot(s) remaining",
      slotError: "Select an available time slot before continuing.",
      firstNameLabel: "First name",
      firstNameError: "Enter the booking person's first name.",
      firstNamePlaceholder: "Jane",
      lastNameLabel: "Last name",
      lastNameError: "Enter the booking person's last name.",
      lastNamePlaceholder: "Citizen",
      emailError: "Enter a valid contact email.",
      emailPlaceholder: "jane@example.org",
      phoneLabel: "Phone",
      phonePlaceholder: "+1 555 123 4567",
      documentTypeLabel: "Document type",
      documentTypePlaceholder: "Passport, ID card, national ID...",
      documentNumberLabel: "Document number",
      documentNumberPlaceholder: "Optional document number",
      citizenNotesLabel: "Additional notes",
      citizenNotesPlaceholder:
        "Optional note for the service team, accessibility support, or arrival details.",
      optionalHint: "Optional",
      submitting: "Submitting booking...",
      submitFailed: "We couldn't confirm the booking. Please try again.",
      clearDate: "Clear date",
      preparedAppointment: "minute appointment prepared for multi-step public booking.",
    },
    lookup: {
      cardTitle: "Search by appointment code",
      cardDescription:
        "Use the booking code from your confirmation to view the appointment details and next available actions.",
      helpText:
        "The code usually starts with APT and is safe to paste exactly as received in the confirmation screen or message.",
      codeHint: "Case-insensitive",
      codePlaceholder: "APT-20260328-ABC123",
      codeError: "Enter a valid appointment code.",
      submitting: "Checking appointment...",
      submit: "View appointment",
      submitFailed:
        "We couldn't find an appointment for that code. Check it and try again.",
      sideTitle: "What you can do here",
      sideDescription:
        "This lookup flow is designed to be calm and practical for citizens returning after the original booking.",
      highlights: [
        {
          title: "Review current status",
          description:
            "Check whether the appointment is pending, confirmed, completed, or already cancelled.",
        },
        {
          title: "Verify location and time",
          description:
            "See the branch, date, and time window before planning the visit.",
        },
        {
          title: "Cancel when still allowed",
          description:
            "If the appointment is still in a cancellable state, the public flow will let you release the slot.",
        },
      ],
    },
    confirmation: {
      missingTitle: "No booking confirmation found",
      missingDescription:
        "Complete the booking flow first or connect this page to a future booking lookup route.",
      confirmedTitle: "Appointment confirmed",
      confirmedDescription:
        "Your appointment details are ready to review, save, or share with the citizen.",
      branchLabel: "Branch",
      contactLabel: "Booked for",
      contactFallback: "Contact details were not provided.",
      summaryTitle: "What to remember",
      summaryDescription:
        "Keep the booking code close. It will be useful when lookup, cancellation, and reschedule tools are added.",
      statusLabel: "Current status",
      noteFallback:
        "No extra notes were added to this appointment. You can arrive a few minutes early with your booking code.",
    },
    appointmentDetail: {
      loading: "Loading appointment details...",
      title: "Your appointment is ready to review",
      description:
        "Use this page to confirm the current status, service, branch, and next steps.",
      notFoundTitle: "We couldn't find that appointment",
      notFoundDescription:
        "Check the code and try again, or start a new booking if you no longer have the confirmation.",
      errorTitle: "We couldn't load the appointment right now",
      errorDescription:
        "Try again in a moment. If the problem persists, confirm that the public booking API is available.",
      retry: "Retry lookup",
      lookupAnother: "Search another code",
      summaryTitle: "Before your visit",
      summaryDescription:
        "Keep the code close and double-check the branch, date, and appointment status before arriving.",
      durationLabel: "Estimated duration",
      durationUnit: "minutes",
      noAddress: "Location details will be confirmed at the branch.",
      cancelledAtLabel: "Cancelled on",
      optionalHint: "Optional",
      cancel: {
        show: "Cancel appointment",
        hide: "Hide cancellation form",
        title: "Cancel this appointment",
        description:
          "If your plans changed, you can release the reserved slot so another citizen can use it.",
        reasonLabel: "Reason",
        reasonPlaceholder: "I am no longer able to attend.",
        detailsLabel: "Additional details",
        detailsPlaceholder:
          "Optional context for the service team, such as a scheduling issue or travel conflict.",
        submit: "Confirm cancellation",
        submitting: "Cancelling appointment...",
        submitFailed:
          "We couldn't cancel the appointment. Review its current status and try again.",
        success:
          "The appointment was cancelled successfully and the slot was released.",
        keepAppointment: "Keep appointment",
        availableDescription:
          "This appointment is still in a cancellable state. If needed, you can cancel it from this page.",
        unavailableDescription:
          "Cancellation is no longer available for the current appointment state.",
      },
      reschedule: {
        show: "Reschedule appointment",
        hide: "Hide reschedule form",
        title: "Choose a new time",
        description:
          "Select another available public slot for the same service and confirm the change when you are ready.",
        currentTimeLabel: "Current appointment",
        dateLabel: "Preferred date",
        dateHint:
          "Start with the current appointment date, then clear the filter if you want to browse other days.",
        branchLabel: "Branch",
        branchHint:
          "Optional when the service offers public availability across multiple branches.",
        branchAll: "All available branches",
        loadingService: "Checking whether this appointment can still be rescheduled...",
        unavailableTitle: "Rescheduling is not available right now",
        serviceUnavailableDescription:
          "This appointment can no longer be moved online, or the service is no longer publicly available for rescheduling.",
        loadingSlots: "Loading new available slots...",
        slotLoadError:
          "We couldn't load the public slots for this service right now.",
        noSlots:
          "No alternative slots are currently available for this appointment.",
        slotLabel: "New time slot",
        reasonLabel: "Reason",
        reasonPlaceholder: "I need a later time that day.",
        detailsLabel: "Additional details",
        detailsPlaceholder:
          "Optional context to help the service team understand the change.",
        submit: "Confirm reschedule",
        submitting: "Rescheduling appointment...",
        submitFailed:
          "We couldn't reschedule the appointment. Select another slot or try again in a moment.",
        success: "The appointment was rescheduled successfully.",
        keepCurrent: "Keep current appointment",
        availableDescription:
          "This appointment can still be moved to another public slot if you need a different time.",
        unavailableDescription:
          "Rescheduling is no longer available for the current appointment state.",
      },
    },
  },
  auth: {
    login: {
      eyebrow: "Turnix access",
      title: "Protected operations for scheduling teams and service staff.",
      description:
        "The auth foundation now connects to the real backend login and keeps protected sessions validated on the server.",
      features: [
        {
          title: "Backoffice identity",
          description:
            "The real API session carries tenant, role, and access token context for protected operations.",
        },
        {
          title: "Protected routes",
          description:
            "All backoffice routes are guarded in proxy and validated on the server.",
        },
        {
          title: "Backend-ready credentials",
          description:
            "Credentials login works against NestJS now, with room for future refresh-token evolution.",
        },
      ],
      cardTitle: "Sign in to the backoffice",
      cardDescription:
        "Use your internal credentials to access protected Turnix operations.",
      validationError: "Check the email and password fields.",
      authError: "Authentication failed. Verify your email and password.",
      emailError: "Enter a valid email address.",
      passwordError: "Password must contain at least 8 characters.",
      signingIn: "Signing in...",
      developmentHint:
        "Development credentials are enabled because no backend API URL is configured:",
      emailLabel: "email",
      passwordLabel: "password",
    },
  },
  dashboard: {
    page: {
      title: "Operational dashboard",
      description:
        "A real operational overview for staff to monitor queue health, service coverage, and the next appointments that need attention.",
    },
    loading: "Loading operational summary...",
    refreshing: "Refreshing dashboard...",
    ready: "Dashboard connected to live operational data.",
    partialData:
      "Some sections are temporarily unavailable, but the dashboard is still showing the data that could be loaded.",
    updatedAtLabel: "Live operational snapshot",
    unavailableValue: "—",
    summaryErrorTitle: "We couldn't load the operational summary",
    summaryErrorDescription:
      "Try again in a moment. If the issue persists, confirm that the protected appointments, services, and branches endpoints are available.",
    insightsUnavailable:
      "Operational insights will appear here once the summary data becomes available again.",
    metrics: {
      appointments_today: {
        label: "Appointments today",
        description:
          "All appointments scheduled during the current local day across the tenant.",
      },
      confirmed_appointments: {
        label: "Confirmed appointments",
        description:
          "Appointments that are confirmed and still waiting to be served.",
      },
      completed_appointments: {
        label: "Completed appointments",
        description:
          "Finished appointments already closed by the operations team.",
      },
      cancelled_appointments: {
        label: "Cancelled appointments",
        description:
          "Appointments cancelled through public or backoffice flows.",
      },
      no_show_appointments: {
        label: "No-shows",
        description:
          "Appointments marked as unattended and no longer actionable.",
      },
      active_services: {
        label: "Active services",
        description:
          "Tenant services currently enabled for operational scheduling.",
      },
    },
    highlights: {
      title: "Operational highlights",
      description:
        "Quick signals to understand branch coverage and queue pressure without leaving the dashboard.",
      items: {
        active_branches: {
          label: "Active branches",
          description:
            "Branches currently active and available for backoffice scheduling work.",
        },
        today_pending: {
          label: "Pending today",
          description:
            "Appointments still pending on the current day and likely needing confirmation or review.",
        },
        live_queue: {
          label: "Live queue",
          description:
            "Appointments already checked in or currently in progress right now.",
        },
        upcoming_next_24h: {
          label: "Next 24 hours",
          description:
            "Operational appointments scheduled from now through the next 24 hours.",
        },
      },
    },
    statusBreakdown: {
      title: "Status distribution",
      description:
        "A lightweight lifecycle breakdown of the appointment portfolio for this tenant.",
      empty:
        "Status distribution will appear once appointment data is available.",
    },
    upcomingTitle: "Upcoming attention flow",
    upcomingDescription:
      "The next operational appointments that staff are likely to touch soon.",
    upcomingTable: {
      code: "Code",
      service: "Service",
      branch: "Branch",
      citizen: "Citizen",
      scheduledStart: "Scheduled",
      status: "Status",
      loading: "Loading upcoming appointments...",
      refreshing: "Refreshing upcoming queue...",
      resultsLabel: "appointments queued next",
      openQueue: "Open appointments",
      emptyTitle: "No upcoming appointments",
      emptyDescription:
        "When new future appointments are scheduled, they will appear here for quick operational review.",
      errorTitle: "We couldn't load upcoming appointments",
      errorDescription:
        "Try again in a moment. The appointments queue may still be updating.",
    },
  },
  appointments: {
    page: {
      title: "Appointments",
      description:
        "Manage the tenant appointment queue, monitor lifecycle status, and create backoffice bookings without leaving the operations workspace.",
    },
    actions: {
      create: "Create appointment",
      clearFilters: "Clear filters",
      closePanel: "Close panel",
      retry: "Try again",
    },
    filters: {
      title: "Operational filters",
      description:
        "Narrow the appointments queue by lifecycle, branch, service, date, or citizen search before opening an appointment detail panel.",
      searchLabel: "Search",
      searchPlaceholder: "Search by code, citizen name, or email",
      statusLabel: "Status",
      statusAll: "All statuses",
      serviceLabel: "Service",
      serviceAll: "All services",
      branchLabel: "Branch",
      branchAll: "All branches",
      dateFromLabel: "From date",
      dateToLabel: "To date",
      resultsLabel: "appointments in view",
      syncing: "Refreshing appointments...",
    },
    table: {
      title: "Tenant appointment queue",
      description:
        "Keep the list visible while you open details, complete lifecycle actions, and create new backoffice bookings.",
      code: "Code",
      service: "Service",
      branch: "Branch",
      citizen: "Citizen",
      scheduledStart: "Scheduled",
      status: "Status",
      source: "Source",
      actions: "Actions",
      view: "View",
      loading: "Loading appointments...",
      updating: "Updating appointments...",
      noCitizenEmail: "No citizen email",
      emptyTitle: "No appointments available",
      emptyDescription:
        "Adjust the filters or create the next operational appointment for this tenant.",
    },
    editor: {
      emptyTitle: "Select an appointment or create a new booking",
      emptyDescription:
        "The detail workspace stays on the same page so the queue remains visible while you review status and appointment data.",
      emptyHint:
        "Choose any row to inspect the appointment lifecycle, or create a new appointment from the page header.",
      createTitle: "Create appointment",
      createDescription:
        "Capture a backoffice booking with tenant-aware validation and the same operational patterns used across the rest of Turnix.",
      loading: "Loading appointment details...",
      detailDescription:
        "Review appointment data, update lifecycle state, and handle cancellations from this side panel.",
      loadErrorTitle: "We couldn't load this appointment",
      loadError:
        "The appointment detail request failed. Try again or return to the queue.",
    },
    form: {
      schedulingTitle: "Scheduling details",
      citizenTitle: "Citizen information",
      assignmentTitle: "Assignment and source",
      notesTitle: "Optional notes",
      branchLabel: "Branch",
      branchPlaceholder: "Select a branch",
      branchError: "Select a branch.",
      serviceLabel: "Service",
      servicePlaceholder: "Select a service",
      serviceError: "Select a service.",
      dateLabel: "Slot date",
      dateError: "Select a date.",
      slotLabel: "Time slot",
      slotPlaceholder: "Select an open slot",
      slotError: "Select a slot or enter a slot ID.",
      slotLoading: "Loading available slots...",
      slotEmpty:
        "No open slots were found for the current branch, service, and date.",
      slotManualHint: "Manual fallback",
      slotManualDescription:
        "A protected slot lookup endpoint is not available yet for this environment. You can still paste a slot ID directly.",
      slotManualPlaceholder: "Enter a slot ID",
      slotAvailabilityLabel: "spots left",
      citizenModeLabel: "Citizen mode",
      citizenModeCreate: "Create or find citizen",
      citizenModeExisting: "Use existing citizen ID",
      citizenIdLabel: "Citizen ID",
      citizenIdHint: "Use this when the citizen already exists in the tenant.",
      citizenIdPlaceholder: "Enter an existing citizen ID",
      citizenIdError: "Enter an existing citizen ID.",
      citizenFirstNameLabel: "First name",
      citizenFirstNameError: "Enter the citizen first name.",
      citizenLastNameLabel: "Last name",
      citizenLastNameError: "Enter the citizen last name.",
      citizenEmailLabel: "Email",
      citizenEmailError: "Enter a valid email or leave it empty.",
      citizenPhoneLabel: "Phone",
      citizenDocumentTypeLabel: "Document type",
      citizenDocumentNumberLabel: "Document number",
      sourceLabel: "Source",
      staffUserIdLabel: "Staff user ID",
      staffUserIdHint:
        "Optional until dedicated staff lookup endpoints are available.",
      staffUserIdPlaceholder: "Optional staff user ID",
      citizenNotesLabel: "Citizen notes",
      internalNotesLabel: "Internal notes",
      loadingLookups: "Loading branch, service, and slot lookup data...",
      validationError:
        "Review the appointment fields and complete the required operational data.",
      submitCreate: "Create appointment",
      creating: "Creating appointment...",
      createReady: "Appointment created and added to the queue.",
      createFailed:
        "We couldn't create the appointment. Review the slot, citizen, and lifecycle data and try again.",
    },
    detail: {
      summaryTitle: "Appointment summary",
      serviceLabel: "Service and branch",
      citizenLabel: "Citizen",
      slotTitle: "Slot information",
      slotCapacityLabel: "Reserved capacity",
      notesTitle: "Notes",
      noCitizenNotes: "No citizen notes recorded for this appointment.",
      noInternalNotes: "No internal notes recorded for this appointment.",
    },
    statusActions: {
      title: "Lifecycle actions",
      description:
        "Use only backend-supported transitions so the backoffice view stays aligned with the appointment status history.",
      noteLabel: "Status note",
      notePlaceholder:
        "Optional note to store in the appointment status history.",
      noActions: "No further lifecycle actions are available for this appointment.",
      updated: "Appointment status updated.",
      failed:
        "We couldn't update the appointment status. Review the current lifecycle state and try again.",
      buttons: {
        CONFIRMED: "Confirm appointment",
        CHECKED_IN: "Check in citizen",
        IN_PROGRESS: "Start service",
        COMPLETED: "Complete appointment",
        NO_SHOW: "Mark as no-show",
      },
      success: {
        CONFIRMED: "Appointment confirmed.",
        CHECKED_IN: "Citizen checked in.",
        IN_PROGRESS: "Appointment marked as in progress.",
        COMPLETED: "Appointment completed.",
        NO_SHOW: "Appointment marked as no-show.",
      },
    },
    cancellation: {
      title: "Cancellation",
      description:
        "Use the dedicated cancellation flow when the appointment can still release slot capacity.",
      showForm: "Cancel appointment",
      hideForm: "Hide cancellation form",
      reasonLabel: "Reason",
      reasonPlaceholder: "Citizen requested cancellation",
      detailsLabel: "Details",
      detailsPlaceholder:
        "Capture any operational detail that should remain in the backoffice history.",
      submit: "Confirm cancellation",
      cancelling: "Cancelling appointment...",
      success: "Appointment cancelled and slot capacity released.",
      failed:
        "We couldn't cancel the appointment. Review its current status and try again.",
      unavailable:
        "Cancellation is not available for the current appointment status.",
      noReason: "No cancellation reason was recorded.",
    },
    reschedule: {
      title: "Reschedule",
      description:
        "Move the appointment to another tenant slot while keeping the detail workspace open.",
      showForm: "Reschedule appointment",
      hideForm: "Hide reschedule form",
      currentSlotLabel: "Current slot",
      branchLabel: "Branch",
      branchPlaceholder: "Select a branch for slot lookup",
      dateLabel: "New slot date",
      slotLabel: "New slot",
      slotLoading: "Loading replacement slots...",
      slotEmpty:
        "No replacement slots are available for the selected branch and date.",
      slotManualHint: "Manual fallback",
      slotManualDescription:
        "If the slot lookup endpoint is unavailable in this environment, you can still paste a slot ID directly.",
      slotManualPlaceholder: "Enter a new slot ID",
      reasonLabel: "Reason",
      reasonPlaceholder: "Citizen requested a different time.",
      detailsLabel: "Details",
      detailsPlaceholder:
        "Capture extra operational context for the reschedule history.",
      submit: "Confirm reschedule",
      submitting: "Rescheduling appointment...",
      success: "Appointment rescheduled and queue data refreshed.",
      failed:
        "We couldn't reschedule the appointment. Review the new slot and try again.",
      unavailable:
        "Rescheduling is not available for the current appointment status.",
      keepCurrent: "Keep current slot",
    },
    history: {
      title: "Status history",
      empty: "No status history is available for this appointment yet.",
    },
    options: {
      statuses: {
        PENDING: "Pending",
        CONFIRMED: "Confirmed",
        CHECKED_IN: "Checked in",
        IN_PROGRESS: "In progress",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
        NO_SHOW: "No-show",
        RESCHEDULED: "Rescheduled",
      },
      sources: {
        WEB: "Web",
        STAFF: "Staff",
        API: "API",
        IMPORT: "Import",
      },
    },
  },
  services: {
    page: {
      title: "Services",
      description:
        "Manage the tenant service catalog, keep configuration consistent, and prepare the groundwork for future scheduling and public booking flows.",
    },
    actions: {
      create: "Create service",
      clearFilters: "Clear filters",
      closeEditor: "Close editor",
      retry: "Try again",
    },
    filters: {
      title: "Catalog filters",
      description:
        "Search and narrow the tenant service catalog before opening a service in the editor panel.",
      searchLabel: "Search",
      searchPlaceholder: "Search by service name or slug",
      visibilityLabel: "Visibility",
      statusLabel: "Status",
      visibilityAll: "All visibilities",
      statusAll: "All statuses",
      statusActive: "Active only",
      statusInactive: "Inactive only",
      resultsLabel: "services in view",
      syncing: "Refreshing catalog...",
    },
    table: {
      service: "Service",
      visibility: "Visibility",
      mode: "Mode",
      duration: "Duration",
      status: "Status",
      actions: "Actions",
      edit: "Edit",
      minutesShort: "min",
      loading: "Loading service catalog...",
      emptyTitle: "No services match these filters",
      emptyDescription:
        "Adjust the filters or create the first service for this tenant.",
      updating: "Updating list...",
      catalogTitle: "Tenant service catalog",
      catalogDescription:
        "Keep the list visible while you review configuration and open any service for editing.",
    },
    editor: {
      emptyTitle: "Select a service or create a new one",
      emptyDescription:
        "The editor stays on the same page so the catalog remains visible while you work.",
      emptyHint:
        "Choose any row from the table to edit it, or create a new service from the page header.",
      createTitle: "Create service",
      createDescription:
        "Define the backoffice configuration that will later support scheduling and public booking.",
      editTitle: "Edit service",
      editDescription:
        "Update the service configuration for the current tenant without leaving the catalog.",
      loading: "Loading service details...",
      loadErrorTitle: "We couldn't load this service",
      loadError:
        "The service detail request failed. Try again or return to the catalog.",
    },
    form: {
      generalTitle: "General information",
      planningTitle: "Capacity and timing",
      rulesTitle: "Booking rules",
      linkingTitle: "Optional branch and category links",
      nameLabel: "Name",
      nameError: "Enter a service name.",
      slugLabel: "Slug",
      slugHint: "Lowercase letters, numbers, and hyphens only.",
      slugPlaceholder: "driver-license-renewal",
      slugError: "Use lowercase letters, numbers, and hyphens only.",
      descriptionLabel: "Description",
      descriptionPlaceholder:
        "Add a short internal description for the backoffice team.",
      visibilityLabel: "Visibility",
      modeLabel: "Mode",
      durationLabel: "Duration (minutes)",
      durationError: "Enter a duration greater than zero.",
      bufferBeforeLabel: "Buffer before (minutes)",
      bufferAfterLabel: "Buffer after (minutes)",
      bufferError: "Use zero or a positive number.",
      slotCapacityLabel: "Slot capacity",
      slotCapacityError: "Slot capacity must be at least 1.",
      branchIdLabel: "Branch ID",
      categoryIdLabel: "Category ID",
      branchIdHint: "Optional until branch selectors are implemented.",
      categoryIdHint: "Optional until category management is available.",
      branchIdPlaceholder: "Optional UUID",
      categoryIdPlaceholder: "Optional UUID",
      referenceError: "Enter a valid UUID or leave this field empty.",
      submitCreate: "Create service",
      submitUpdate: "Save changes",
      creating: "Creating service...",
      updating: "Saving changes...",
      createReady: "Service created. You can keep editing the same record.",
      updateReady: "Changes saved successfully.",
      validationError: "Please review the highlighted fields before continuing.",
      createFailed: "We couldn't create the service.",
      updateFailed: "We couldn't save the changes.",
      loadFailed: "We couldn't load the service catalog.",
      allowOnlineBookingTitle: "Allow online booking",
      allowOnlineBookingDescription:
        "Keep this enabled when the service should be available in future public booking flows.",
      requiresApprovalTitle: "Require approval",
      requiresApprovalDescription:
        "Enable manual approval when bookings should be reviewed before confirmation.",
      requiresAuthenticationTitle: "Require authentication",
      requiresAuthenticationDescription:
        "Use this for services that should only be booked by authenticated users.",
      allowsCancellationTitle: "Allow cancellation",
      allowsCancellationDescription:
        "Permit future booking flows to cancel appointments for this service.",
      allowsRescheduleTitle: "Allow reschedule",
      allowsRescheduleDescription:
        "Permit future booking flows to reschedule appointments for this service.",
      isActiveTitle: "Keep service active",
      isActiveDescription:
        "Inactive services stay in the catalog but are treated as unavailable for operational use.",
    },
    options: {
      visibility: {
        PUBLIC: "Public",
        PRIVATE: "Private",
        INTERNAL: "Internal",
      },
      mode: {
        IN_PERSON: "In person",
        REMOTE: "Remote",
        HYBRID: "Hybrid",
      },
    },
    names: {
      svc_civil_records: "Civil Records Assistance",
      svc_building_permits: "Building Permit Orientation",
      svc_social_programs: "Social Benefits Guidance",
      svc_environmental_claims: "Environmental Claims Desk",
    },
  },
  branches: {
    page: {
      title: "Branches",
      description:
        "Manage tenant branch locations, operational metadata, and activation state for future routing and scheduling.",
    },
    actions: {
      create: "Create branch",
      clearFilters: "Clear filters",
      closeEditor: "Close editor",
      retry: "Try again",
    },
    filters: {
      title: "Branch filters",
      description:
        "Search the tenant branch catalog and keep the editor open beside the list while you work.",
      searchLabel: "Search",
      searchPlaceholder: "Search by branch name or slug",
      statusLabel: "Status",
      statusAll: "All statuses",
      statusActive: "Active only",
      statusInactive: "Inactive only",
      resultsLabel: "branches in view",
      syncing: "Refreshing branches...",
    },
    table: {
      name: "Branch",
      slug: "Slug",
      city: "City",
      country: "Country",
      status: "Status",
      actions: "Actions",
      edit: "Edit",
      loading: "Loading branch catalog...",
      emptyTitle: "No branches match these filters",
      emptyDescription:
        "Adjust the filters or create the first branch for this tenant.",
      updating: "Updating list...",
      catalogTitle: "Tenant branch catalog",
      catalogDescription:
        "Review branch coverage and open any record in the side editor without leaving the page.",
      notProvided: "Not provided",
    },
    editor: {
      emptyTitle: "Select a branch or create a new one",
      emptyDescription:
        "The editor stays docked beside the list so branch management remains fast and focused.",
      emptyHint:
        "Choose any branch row to edit it, or create a new branch from the page header.",
      createTitle: "Create branch",
      createDescription:
        "Capture the location and operational details that future modules will reuse.",
      editTitle: "Edit branch",
      editDescription:
        "Update branch details for the current tenant without leaving the catalog.",
      loading: "Loading branch details...",
      loadErrorTitle: "We couldn't load this branch",
      loadError:
        "The branch detail request failed. Try again or return to the catalog.",
    },
    form: {
      generalTitle: "General information",
      locationTitle: "Location details",
      operationsTitle: "Operational status",
      nameLabel: "Name",
      nameError: "Enter a branch name.",
      slugLabel: "Slug",
      slugHint: "Lowercase letters, numbers, and hyphens only.",
      slugPlaceholder: "downtown-office",
      slugError: "Use lowercase letters, numbers, and hyphens only.",
      descriptionLabel: "Description",
      descriptionPlaceholder:
        "Add a short internal description to help the backoffice team identify this branch.",
      timezoneLabel: "Timezone",
      timezoneHint: "Optional IANA timezone, for example America/Santiago.",
      timezonePlaceholder: "America/Santiago",
      addressLine1Label: "Address line 1",
      addressLine1Placeholder: "123 Main Street",
      addressLine2Label: "Address line 2",
      addressLine2Placeholder: "Floor 2, Suite B",
      cityLabel: "City",
      stateLabel: "State or region",
      countryLabel: "Country",
      postalCodeLabel: "Postal code",
      submitCreate: "Create branch",
      submitUpdate: "Save changes",
      creating: "Creating branch...",
      updating: "Saving changes...",
      createReady: "Branch created. You can keep editing the same record.",
      updateReady: "Changes saved successfully.",
      validationError: "Please review the highlighted fields before continuing.",
      createFailed: "We couldn't create the branch.",
      updateFailed: "We couldn't save the changes.",
      loadFailed: "We couldn't load the branch catalog.",
      isActiveTitle: "Keep branch active",
      isActiveDescription:
        "Inactive branches stay in the catalog, but future routing and scheduling should treat them as unavailable.",
    },
  },
  settings: {
    page: {
      title: "Settings",
      description:
        "The protected layout is ready for nested settings sections, role-based access, and tenant-scoped governance.",
    },
    areas: {
      tenant_profile: {
        title: "Tenant profile",
        description:
          "Workspace identity, timezone defaults, and public-service brand configuration.",
      },
      authentication: {
        title: "Authentication",
        description:
          "Credentials provider active, Google OAuth prepared, server validation ready.",
      },
      scheduling_rules: {
        title: "Scheduling rules",
        description:
          "Slot generation, holidays, capacity policies, and queue orchestration placeholders.",
      },
    },
    scaffold:
      "This area is scaffolded so tenant-specific configuration can move from static setup into managed workflows without redesigning the backoffice shell.",
  },
} as const;
