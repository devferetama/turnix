export const es = {
  metadata: {
    description:
      "Turnix es una plataforma SaaS multi-tenant para reservas de citas, agendamiento, filas y operaciones de atención.",
  },
  branding: {
    appName: "Turnix",
    tagline: "Citas y operaciones de atención",
  },
  common: {
    localeSwitcher: {
      label: "Idioma",
      es: "ES",
      en: "EN",
    },
    theme: {
      light: "Cambiar a tema claro",
      dark: "Cambiar a tema oscuro",
      system: "Cambiar a tema del sistema",
    },
    shell: {
      workspace: "Espacio de trabajo",
      backoffice: "Backoffice",
      userMenuPlaceholder: "Placeholder del menú de usuario",
      sharedFoundation:
        "La reserva pública y la operación protegida comparten una base frontend modular.",
      tenantReady:
        "Navegación y autorización preparadas para múltiples tenants.",
    },
    actions: {
      goHome: "Ir al inicio",
      openDashboard: "Abrir dashboard",
      bookAppointment: "Reservar hora",
      staffLogin: "Ingreso de staff",
      beginBookingFlow: "Comenzar flujo de reserva",
      exploreBackofficeFoundation: "Explorar base del backoffice",
      startBooking: "Comenzar reserva",
      lookupAppointment: "Buscar cita",
      openStaffBackoffice: "Abrir backoffice del staff",
      continueWithService: "Continuar con este servicio",
      browseServices: "Ver servicios",
      changeService: "Cambiar servicio",
      confirmAppointment: "Confirmar cita",
      viewAppointment: "Ver cita",
      returnHome: "Volver al inicio",
      bookAnotherAppointment: "Reservar otra cita",
      startNewBooking: "Comenzar una nueva reserva",
      signInWithCredentials: "Ingresar con credenciales",
      continueWithGoogle: "Continuar con Google",
      googlePrepared: "Provider de Google preparado",
      newOperationalAction: "Nueva acción operativa",
      newService: "Nuevo servicio",
      previous: "Anterior",
      next: "Siguiente",
      retry: "Reintentar",
      closeNavigation: "Cerrar navegación",
      signOut: "Cerrar sesión",
      signingOut: "Cerrando sesión...",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
    },
    labels: {
      service: "Servicio",
      branch: "Sucursal",
      when: "Cuándo",
      contact: "Contacto",
      email: "Correo",
      phone: "Teléfono",
      password: "Contraseña",
      fullName: "Nombre completo",
      tenantSlug: "Slug del tenant",
      bookingCode: "Código de reserva",
      availableSlots: "Bloques disponibles",
      role: "Rol",
      status: "Estado",
    },
    messages: {
      loadingApp: "Cargando espacio Turnix...",
      routeNotFound: "Ruta no encontrada",
      routeNotFoundTitle:
        "Esta ruta no forma parte del workspace actual de Turnix.",
      routeNotFoundDescription:
        "La base ya está lista para reserva pública y operación protegida, pero esta ruta todavía no fue implementada.",
    },
    table: {
      result: "registro",
      results: "registros",
      page: "Página",
      of: "de",
      searchRecords: "Buscar registros...",
      noResultsFound: "No se encontraron resultados",
      adjustFilters:
        "Ajusta los filtros o agrega más datos para poblar esta tabla.",
    },
    statuses: {
      pending: "pendiente",
      confirmed: "confirmada",
      checked_in: "check-in",
      in_progress: "en atención",
      completed: "completada",
      cancelled: "cancelada",
      no_show: "ausente",
      rescheduled: "reagendada",
      open: "abierto",
      full: "lleno",
      blocked: "bloqueado",
      active: "activo",
      inactive: "inactivo",
      configured: "configurado",
      ready: "listo",
      in_review: "en revisión",
    },
    roles: {
      SUPER_ADMIN: "super admin",
      TENANT_ADMIN: "admin tenant",
      OPERATOR: "operador",
      VIEWER: "visualizador",
    },
  },
  navigation: {
    dashboard: {
      title: "Dashboard",
      description: "Vista operacional, volumen y acciones rápidas.",
    },
    appointments: {
      title: "Citas",
      description:
        "Monitorea reservas, estados y el flujo diario de atención.",
    },
    services: {
      title: "Servicios",
      description:
        "Configura catálogo, duración y estado de actividad de los servicios.",
    },
    branches: {
      title: "Sucursales",
      description:
        "Administra ubicaciones, direcciones y estado operativo de las sucursales.",
    },
    settings: {
      title: "Configuración",
      description:
        "Ajustes de tenant, autenticación, agendamiento y gobernanza.",
    },
  },
  publicLayout: {
    tenantWorkspace: "Workspace de Servicios Municipales",
  },
  home: {
    experiences: [
      {
        title: "Experiencia pública",
        description:
          "Diseñada para claridad, baja fricción y revisión rápida de disponibilidad sin autenticación administrativa.",
      },
      {
        title: "Backoffice protegido",
        description:
          "Preparado para operaciones por rol, configuración de servicios, gestión de agenda y reportería.",
      },
    ],
    architecture:
      "La arquitectura mantiene alineados modelos de dominio, queries, formularios, tablas y protección de rutas en ambas experiencias desde el inicio.",
    foundationTitle: "Decisiones base de Turnix",
    foundationDescription:
      "El starter está estructurado para reserva pública hoy y operaciones multi-tenant integradas con NestJS a medida que la plataforma crece.",
  },
  booking: {
    hero: {
      eyebrow: "Reserva pública",
      title:
        "Flujos de cita rápidos y de baja fricción para ciudadanos y clientes.",
      description:
        "Turnix comienza con instituciones públicas, pero la base de reservas está diseñada para escalar a cualquier organización que coordine servicios, filas y flujos de atención.",
      signals: [
        "Reserva guiada en múltiples pasos",
        "Experiencia pública clara",
        "Lista para consulta y reagendamiento",
      ],
      whyTitle: "Por qué importa la base",
      whyDescription:
        "La experiencia pública y la operacional comparten una plataforma, pero cada una está optimizada para su propio contexto.",
      highlights: [
        {
          title: "Reserva rápida",
          description:
            "Flujos de baja fricción para ciudadanos y clientes en cualquier dispositivo.",
        },
        {
          title: "Control operativo",
          description:
            "Bases listas para backoffice para staff, operadores y administradores.",
        },
        {
          title: "Preparado para tenants",
          description:
            "Listo para crecer hacia múltiples organizaciones y acceso por rol.",
        },
      ],
    },
    overview: {
      title: "Diseñado para operación real de reservas",
      description:
        "El flujo público es liviano por defecto, pero la estructura ya está lista para consulta de reservas, cancelación, reagendamiento y rutas interceptadas con modales.",
      cards: [
        "El descubrimiento de servicios sigue siendo simple y rápido.",
        "La selección de la cita queda separada limpiamente de la captura de identidad.",
        "La confirmación puede crecer hacia consulta y gestión post-reserva.",
      ],
    },
    flow: {
      title: "Flujo de cita",
      stepLabel: "Paso",
      steps: [
        "Seleccionar servicio",
        "Elegir bloque e ingresar datos",
        "Revisar confirmación",
      ],
    },
    servicesPage: {
      title: "Elige un servicio",
      description:
        "Los componentes compartidos del diseño viven en la capa de plataforma, mientras esta UI de reservas se mantiene dentro del módulo public-booking.",
      filterEyebrow: "Encuentra el servicio correcto",
      filterDescription:
        "Busca en el catálogo público y elige el servicio adecuado antes de seleccionar un horario.",
      searchPlaceholder: "Buscar por nombre del servicio o palabra clave",
      loading: "Cargando servicios públicos disponibles...",
      cardDescription:
        "Un servicio público listo para una reserva guiada, clara y confiable.",
      minuteBlock: "minutos de cita",
      durationLabel: "Duración estimada",
      branchLabel: "Cobertura de atención",
      multipleBranches: "Disponible en varias sucursales",
      bookingPolicyLabel: "Política de reserva",
      bookingPolicyInstant:
        "Este servicio puede confirmar de inmediato cuando eliges un bloque disponible.",
      bookingPolicyApproval:
        "Este servicio puede requerir revisión manual antes de quedar confirmado.",
      instantConfirmation: "Confirmación inmediata",
      requiresApproval: "Requiere aprobación",
      retry: "Reintentar",
      errorTitle: "No pudimos cargar los servicios públicos",
      errorDescription:
        "Revisa la conexión con la API pública o inténtalo nuevamente en unos minutos.",
      emptyTitle: "No hay servicios públicos disponibles ahora",
      emptyDescription:
        "Prueba otra búsqueda o vuelve más tarde cuando se publiquen nuevos servicios.",
    },
    formPage: {
      title: "Completa tu cita",
      description:
        "Selecciona un bloque disponible, ingresa tus datos de contacto y confirma la reserva.",
    },
    confirmationPage: {
      title: "Confirmación de reserva",
      description:
        "Esta página está posicionada para crecer hacia futuras consultas, cancelaciones y reagendamientos.",
    },
    lookupPage: {
      title: "Busca tu cita",
      description:
        "Ingresa el código de confirmación para revisar los detalles de la cita o cancelarla si el estado actual todavía lo permite.",
    },
    appointmentPage: {
      title: "Detalle de la cita",
      description:
        "Revisa el estado, la sucursal y los datos de la reserva usando el código público de confirmación.",
    },
    form: {
      incompleteDetails: "Completa todos los datos requeridos para la reserva.",
      loadingService: "Cargando servicio seleccionado...",
      serviceLoadErrorTitle: "No pudimos cargar el servicio seleccionado",
      serviceLoadErrorDescription:
        "La consulta del catálogo falló antes de preparar el formulario de reserva.",
      retryServices: "Recargar servicios",
      serviceNotFoundTitle: "Este servicio ya no está disponible",
      serviceNotFoundDescription:
        "Vuelve al catálogo y elige otro servicio público para continuar.",
      selectServiceFirstTitle: "Primero selecciona un servicio",
      selectServiceFirstDescription:
        "El flujo de reserva mantiene separadas la elección del servicio y la del bloque para que futuras cancelaciones, consultas y modales evolucionen limpiamente.",
      selectedService: "Servicio seleccionado",
      selectedServiceDescription:
        "Puedes volver atrás y elegir otro servicio antes de confirmar la cita.",
      branchSummaryLabel: "Cobertura de sucursales",
      branchSummaryDescription:
        "Este servicio está disponible en más de un punto de atención público.",
      confirmationSummaryLabel: "Qué ocurre después",
      confirmationSummaryInstant:
        "Cuando envíes la reserva recibirás una confirmación directa con los detalles de la cita.",
      confirmationSummaryApproval:
        "Cuando envíes la reserva puede quedar pendiente hasta que el equipo la revise.",
      chooseTimeTitle: "Elige un horario y completa la reserva",
      chooseTimeDescription:
        "La selección del bloque se mantiene en estado cliente para que el flujo público pueda abarcar múltiples pasos sin introducir un store global innecesario.",
      dateFilterLabel: "Fecha preferida",
      dateFilterHint:
        "Opcional. Déjalo vacío para ver los próximos bloques disponibles.",
      branchFilterLabel: "Sucursal preferida",
      branchFilterHint:
        "Opcional. Útil cuando este servicio se ofrece en varias ubicaciones.",
      branchFilterAll: "Todas las sucursales",
      loadingTimes: "Cargando horarios disponibles...",
      slotLoadErrorTitle: "No pudimos cargar los bloques disponibles",
      slotLoadErrorDescription:
        "Prueba otra fecha o recarga la consulta para ver los próximos horarios públicos.",
      retrySlots: "Recargar bloques",
      noSlots: "Actualmente no hay bloques disponibles para este servicio.",
      noSlotsForDate:
        "No hay bloques disponibles para la fecha seleccionada. Prueba otro día o limpia el filtro.",
      slotOptionsLabel: "opción(es) disponible(s)",
      slotsRemainingSuffix: "bloque(s) restantes",
      slotError: "Selecciona un bloque disponible antes de continuar.",
      firstNameLabel: "Nombre",
      firstNameError: "Ingresa el nombre de la persona que reserva.",
      firstNamePlaceholder: "Juana",
      lastNameLabel: "Apellido",
      lastNameError: "Ingresa el apellido de la persona que reserva.",
      lastNamePlaceholder: "Pérez",
      emailError: "Ingresa un correo de contacto válido.",
      emailPlaceholder: "juana@ejemplo.cl",
      phoneLabel: "Teléfono",
      phonePlaceholder: "+56 9 1111 2222",
      documentTypeLabel: "Tipo de documento",
      documentTypePlaceholder: "RUT, pasaporte, cédula...",
      documentNumberLabel: "Número de documento",
      documentNumberPlaceholder: "Número de documento opcional",
      citizenNotesLabel: "Notas adicionales",
      citizenNotesPlaceholder:
        "Agrega una nota opcional para el equipo de atención, accesibilidad o llegada.",
      optionalHint: "Opcional",
      submitting: "Enviando reserva...",
      submitFailed: "No pudimos confirmar la reserva. Inténtalo nuevamente.",
      clearDate: "Limpiar fecha",
      preparedAppointment:
        "minutos de cita preparados para una reserva pública en múltiples pasos.",
    },
    lookup: {
      cardTitle: "Buscar por código de cita",
      cardDescription:
        "Usa el código de reserva de tu confirmación para ver los detalles de la cita y las acciones disponibles.",
      helpText:
        "El código normalmente comienza con APT y puedes pegarlo tal como apareció en la pantalla o mensaje de confirmación.",
      codeHint: "No distingue mayúsculas",
      codePlaceholder: "APT-20260328-ABC123",
      codeError: "Ingresa un código de cita válido.",
      submitting: "Buscando cita...",
      submit: "Ver cita",
      submitFailed:
        "No pudimos encontrar una cita para ese código. Revísalo e inténtalo nuevamente.",
      sideTitle: "Qué puedes hacer aquí",
      sideDescription:
        "Este flujo de consulta está pensado para ser simple y útil para ciudadanos que vuelven después de reservar.",
      highlights: [
        {
          title: "Revisar el estado actual",
          description:
            "Confirma si la cita está pendiente, confirmada, completada o ya cancelada.",
        },
        {
          title: "Verificar sucursal y horario",
          description:
            "Consulta la ubicación, la fecha y el tramo horario antes de planificar la visita.",
        },
        {
          title: "Cancelar si todavía se puede",
          description:
            "Si la cita sigue en un estado cancelable, el flujo público permitirá liberar ese bloque.",
        },
      ],
    },
    confirmation: {
      missingTitle: "No se encontró confirmación de reserva",
      missingDescription:
        "Completa primero el flujo de reserva o conecta esta página a una futura ruta de consulta de reservas.",
      confirmedTitle: "Cita confirmada",
      confirmedDescription:
        "Los detalles de la cita quedaron listos para revisar, guardar o compartir con el ciudadano.",
      branchLabel: "Sucursal",
      contactLabel: "Reserva para",
      contactFallback: "No se entregaron datos de contacto.",
      summaryTitle: "Qué conviene recordar",
      summaryDescription:
        "Mantén a mano el código de reserva. Será útil cuando existan herramientas de consulta, cancelación y reagendamiento.",
      statusLabel: "Estado actual",
      noteFallback:
        "No se agregaron notas adicionales a esta cita. Puedes llegar unos minutos antes con tu código de reserva.",
    },
    appointmentDetail: {
      loading: "Cargando detalles de la cita...",
      title: "Tu cita está lista para revisar",
      description:
        "Usa esta página para confirmar el estado actual, el servicio, la sucursal y los próximos pasos.",
      notFoundTitle: "No pudimos encontrar esa cita",
      notFoundDescription:
        "Revisa el código e inténtalo nuevamente, o inicia una nueva reserva si ya no tienes la confirmación.",
      errorTitle: "No pudimos cargar la cita en este momento",
      errorDescription:
        "Inténtalo nuevamente en unos minutos. Si el problema persiste, confirma que la API pública esté disponible.",
      retry: "Reintentar consulta",
      lookupAnother: "Buscar otro código",
      summaryTitle: "Antes de tu visita",
      summaryDescription:
        "Mantén el código a mano y revisa sucursal, fecha y estado antes de llegar.",
      durationLabel: "Duración estimada",
      durationUnit: "minutos",
      noAddress: "Los detalles de ubicación se confirmarán en la sucursal.",
      cancelledAtLabel: "Cancelada el",
      optionalHint: "Opcional",
      cancel: {
        show: "Cancelar cita",
        hide: "Ocultar formulario de cancelación",
        title: "Cancelar esta cita",
        description:
          "Si cambiaron tus planes, puedes liberar el bloque reservado para que otra persona lo use.",
        reasonLabel: "Motivo",
        reasonPlaceholder: "Ya no podré asistir.",
        detailsLabel: "Detalles adicionales",
        detailsPlaceholder:
          "Contexto opcional para el equipo de atención, por ejemplo un conflicto de horario o traslado.",
        submit: "Confirmar cancelación",
        submitting: "Cancelando cita...",
        submitFailed:
          "No pudimos cancelar la cita. Revisa el estado actual e inténtalo nuevamente.",
        success:
          "La cita se canceló correctamente y el bloque quedó liberado.",
        keepAppointment: "Mantener cita",
        availableDescription:
          "Esta cita todavía está en un estado cancelable. Si lo necesitas, puedes cancelarla desde aquí.",
        unavailableDescription:
          "La cancelación ya no está disponible para el estado actual de la cita.",
      },
      reschedule: {
        show: "Reagendar cita",
        hide: "Ocultar formulario de reagendamiento",
        title: "Elige un nuevo horario",
        description:
          "Selecciona otro bloque público disponible para el mismo servicio y confirma el cambio cuando estés listo.",
        currentTimeLabel: "Cita actual",
        dateLabel: "Fecha preferida",
        dateHint:
          "Parte por la fecha actual de la cita y limpia el filtro si quieres revisar otros días.",
        branchLabel: "Sucursal",
        branchHint:
          "Opcional cuando el servicio ofrece disponibilidad pública en varias sucursales.",
        branchAll: "Todas las sucursales disponibles",
        loadingService:
          "Revisando si esta cita todavía se puede reagendar...",
        unavailableTitle: "El reagendamiento no está disponible ahora",
        serviceUnavailableDescription:
          "Esta cita ya no puede moverse en línea, o el servicio dejó de estar disponible públicamente para reagendar.",
        loadingSlots: "Cargando nuevos bloques disponibles...",
        slotLoadError:
          "No pudimos cargar los bloques públicos de este servicio por ahora.",
        noSlots:
          "Actualmente no hay bloques alternativos disponibles para esta cita.",
        slotLabel: "Nuevo bloque horario",
        reasonLabel: "Motivo",
        reasonPlaceholder: "Necesito un horario más tarde ese día.",
        detailsLabel: "Detalles adicionales",
        detailsPlaceholder:
          "Contexto opcional para que el equipo entienda el cambio.",
        submit: "Confirmar reagendamiento",
        submitting: "Reagendando cita...",
        submitFailed:
          "No pudimos reagendar la cita. Elige otro bloque o inténtalo nuevamente en unos minutos.",
        success: "La cita fue reagendada correctamente.",
        keepCurrent: "Mantener cita actual",
        availableDescription:
          "Esta cita todavía puede moverse a otro bloque público si necesitas otro horario.",
        unavailableDescription:
          "El reagendamiento ya no está disponible para el estado actual de la cita.",
      },
    },
  },
  auth: {
    login: {
      eyebrow: "Acceso Turnix",
      title:
        "Operaciones protegidas para equipos de agenda y personal de atención.",
      description:
        "La base de autenticación ahora se conecta al login real del backend y mantiene las sesiones protegidas validadas en servidor.",
      features: [
        {
          title: "Identidad backoffice",
          description:
            "La sesión real de la API trae contexto de tenant, rol y access token para la operación protegida.",
        },
        {
          title: "Rutas protegidas",
          description:
            "Todas las rutas del backoffice están resguardadas en proxy y validadas en el servidor.",
        },
        {
          title: "Credenciales listas para backend",
          description:
            "El login por credenciales ya funciona contra NestJS, con espacio para futuros flujos de refresh token.",
        },
      ],
      cardTitle: "Ingresa al backoffice",
      cardDescription:
        "Usa tus credenciales internas para acceder a las operaciones protegidas de Turnix.",
      validationError: "Revisa los campos correo y contraseña.",
      authError:
        "La autenticación falló. Verifica tu correo y contraseña.",
      emailError: "Ingresa un correo válido.",
      passwordError: "La contraseña debe tener al menos 8 caracteres.",
      signingIn: "Ingresando...",
      developmentHint:
        "Las credenciales de desarrollo están habilitadas porque no hay una URL de API configurada:",
      emailLabel: "correo",
      passwordLabel: "contraseña",
    },
  },
  dashboard: {
    page: {
      title: "Dashboard operacional",
      description:
        "Una vista operacional real para que el staff monitoree la salud de la cola, la cobertura de servicios y las próximas citas que requieren atención.",
    },
    loading: "Cargando resumen operacional...",
    refreshing: "Actualizando dashboard...",
    ready: "Dashboard conectado a datos operacionales reales.",
    partialData:
      "Algunas secciones están temporalmente no disponibles, pero el dashboard sigue mostrando la información que sí pudo cargarse.",
    updatedAtLabel: "Snapshot operacional en vivo",
    unavailableValue: "—",
    summaryErrorTitle: "No pudimos cargar el resumen operacional",
    summaryErrorDescription:
      "Reintenta en unos minutos. Si el problema persiste, confirma que los endpoints protegidos de citas, servicios y sucursales estén disponibles.",
    insightsUnavailable:
      "Los insights operacionales volverán a aparecer aquí cuando el resumen esté disponible nuevamente.",
    metrics: {
      appointments_today: {
        label: "Citas de hoy",
        description:
          "Todas las citas agendadas durante el día local actual para el tenant.",
      },
      confirmed_appointments: {
        label: "Citas confirmadas",
        description:
          "Citas confirmadas que siguen esperando atención o gestión operativa.",
      },
      completed_appointments: {
        label: "Citas completadas",
        description:
          "Citas finalizadas y ya cerradas por el equipo de operaciones.",
      },
      cancelled_appointments: {
        label: "Citas canceladas",
        description:
          "Citas canceladas desde el flujo público o desde backoffice.",
      },
      no_show_appointments: {
        label: "Ausencias",
        description:
          "Citas marcadas como no asistidas y que ya no requieren acción.",
      },
      active_services: {
        label: "Servicios activos",
        description:
          "Servicios del tenant que hoy están habilitados para operación y agenda.",
      },
    },
    highlights: {
      title: "Highlights operacionales",
      description:
        "Señales rápidas para entender cobertura de sucursales y presión de la cola sin salir del dashboard.",
      items: {
        active_branches: {
          label: "Sucursales activas",
          description:
            "Sucursales actualmente activas y disponibles para trabajo de agenda en backoffice.",
        },
        today_pending: {
          label: "Pendientes hoy",
          description:
            "Citas todavía pendientes en el día actual y que probablemente requieren confirmación o revisión.",
        },
        live_queue: {
          label: "Cola en curso",
          description:
            "Citas con check-in realizado o que están siendo atendidas en este momento.",
        },
        upcoming_next_24h: {
          label: "Próximas 24 horas",
          description:
            "Citas operacionales agendadas desde ahora hasta las próximas 24 horas.",
        },
      },
    },
    statusBreakdown: {
      title: "Distribución por estado",
      description:
        "Un desglose liviano del ciclo de vida de las citas del tenant.",
      empty:
        "La distribución por estado aparecerá cuando haya datos de citas disponibles.",
    },
    upcomingTitle: "Próximo flujo de atención",
    upcomingDescription:
      "Las próximas citas operacionales que probablemente el staff tocará pronto.",
    upcomingTable: {
      code: "Código",
      service: "Servicio",
      branch: "Sucursal",
      citizen: "Ciudadano",
      scheduledStart: "Agendada",
      status: "Estado",
      loading: "Cargando próximas citas...",
      refreshing: "Actualizando cola próxima...",
      resultsLabel: "citas próximas en cola",
      openQueue: "Abrir citas",
      emptyTitle: "No hay próximas citas",
      emptyDescription:
        "Cuando se agenden nuevas citas futuras, aparecerán aquí para revisión rápida del equipo.",
      errorTitle: "No pudimos cargar las próximas citas",
      errorDescription:
        "Reintenta en unos minutos. La cola de citas puede estar actualizándose.",
    },
  },
  appointments: {
    page: {
      title: "Citas",
      description:
        "Administra la cola de citas del tenant, controla el ciclo de vida y crea reservas de backoffice sin salir del workspace operativo.",
    },
    actions: {
      create: "Crear cita",
      clearFilters: "Limpiar filtros",
      closePanel: "Cerrar panel",
      retry: "Reintentar",
    },
    filters: {
      title: "Filtros operativos",
      description:
        "Acota la cola de citas por estado, sucursal, servicio, fecha o búsqueda de ciudadano antes de abrir el detalle.",
      searchLabel: "Buscar",
      searchPlaceholder: "Buscar por código, nombre o correo del ciudadano",
      statusLabel: "Estado",
      statusAll: "Todos los estados",
      serviceLabel: "Servicio",
      serviceAll: "Todos los servicios",
      branchLabel: "Sucursal",
      branchAll: "Todas las sucursales",
      dateFromLabel: "Desde",
      dateToLabel: "Hasta",
      resultsLabel: "citas en vista",
      syncing: "Actualizando citas...",
    },
    table: {
      title: "Cola de citas del tenant",
      description:
        "Mantén la lista visible mientras revisas detalles, aplicas cambios de estado y creas nuevas citas de backoffice.",
      code: "Código",
      service: "Servicio",
      branch: "Sucursal",
      citizen: "Ciudadano",
      scheduledStart: "Agendada",
      status: "Estado",
      source: "Origen",
      actions: "Acciones",
      view: "Ver",
      loading: "Cargando citas...",
      updating: "Actualizando citas...",
      noCitizenEmail: "Sin correo registrado",
      emptyTitle: "No hay citas disponibles",
      emptyDescription:
        "Ajusta los filtros o crea la próxima cita operativa para este tenant.",
    },
    editor: {
      emptyTitle: "Selecciona una cita o crea una nueva reserva",
      emptyDescription:
        "El workspace de detalle se mantiene en la misma página para que la cola siga visible mientras trabajas.",
      emptyHint:
        "Elige cualquier fila para inspeccionar su ciclo de vida, o crea una nueva cita desde el encabezado.",
      createTitle: "Crear cita",
      createDescription:
        "Captura una reserva de backoffice con validación tenant-aware y el mismo patrón operacional usado en el resto de Turnix.",
      loading: "Cargando detalle de la cita...",
      detailDescription:
        "Revisa datos de la cita, actualiza el estado del ciclo de vida y gestiona cancelaciones desde este panel lateral.",
      loadErrorTitle: "No pudimos cargar esta cita",
      loadError:
        "Falló la solicitud del detalle de la cita. Reintenta o vuelve a la cola.",
    },
    form: {
      schedulingTitle: "Datos de agenda",
      citizenTitle: "Información del ciudadano",
      assignmentTitle: "Asignación y origen",
      notesTitle: "Notas opcionales",
      branchLabel: "Sucursal",
      branchPlaceholder: "Selecciona una sucursal",
      branchError: "Selecciona una sucursal.",
      serviceLabel: "Servicio",
      servicePlaceholder: "Selecciona un servicio",
      serviceError: "Selecciona un servicio.",
      dateLabel: "Fecha del bloque",
      dateError: "Selecciona una fecha.",
      slotLabel: "Bloque horario",
      slotPlaceholder: "Selecciona un bloque abierto",
      slotError: "Selecciona un bloque o ingresa un ID de bloque.",
      slotLoading: "Cargando bloques disponibles...",
      slotEmpty:
        "No se encontraron bloques abiertos para la sucursal, servicio y fecha actuales.",
      slotManualHint: "Fallback manual",
      slotManualDescription:
        "Todavía no hay un endpoint protegido de catálogo de bloques en este entorno. Igual puedes pegar un ID de bloque directamente.",
      slotManualPlaceholder: "Ingresa un ID de bloque",
      slotAvailabilityLabel: "cupos disponibles",
      citizenModeLabel: "Modo ciudadano",
      citizenModeCreate: "Crear o encontrar ciudadano",
      citizenModeExisting: "Usar ID de ciudadano existente",
      citizenIdLabel: "ID de ciudadano",
      citizenIdHint: "Úsalo cuando el ciudadano ya exista en el tenant.",
      citizenIdPlaceholder: "Ingresa un ID de ciudadano existente",
      citizenIdError: "Ingresa un ID de ciudadano existente.",
      citizenFirstNameLabel: "Nombre",
      citizenFirstNameError: "Ingresa el nombre del ciudadano.",
      citizenLastNameLabel: "Apellido",
      citizenLastNameError: "Ingresa el apellido del ciudadano.",
      citizenEmailLabel: "Correo",
      citizenEmailError: "Ingresa un correo válido o déjalo vacío.",
      citizenPhoneLabel: "Teléfono",
      citizenDocumentTypeLabel: "Tipo de documento",
      citizenDocumentNumberLabel: "Número de documento",
      sourceLabel: "Origen",
      staffUserIdLabel: "ID de staff user",
      staffUserIdHint:
        "Opcional mientras aún no exista un lookup dedicado de staff.",
      staffUserIdPlaceholder: "ID opcional de staff user",
      citizenNotesLabel: "Notas del ciudadano",
      internalNotesLabel: "Notas internas",
      loadingLookups:
        "Cargando datos de lookup de sucursales, servicios y bloques...",
      validationError:
        "Revisa los campos de la cita y completa la información operativa requerida.",
      submitCreate: "Crear cita",
      creating: "Creando cita...",
      createReady: "La cita fue creada y ya aparece en la cola.",
      createFailed:
        "No pudimos crear la cita. Revisa el bloque, el ciudadano y los datos operativos e inténtalo nuevamente.",
    },
    detail: {
      summaryTitle: "Resumen de la cita",
      serviceLabel: "Servicio y sucursal",
      citizenLabel: "Ciudadano",
      slotTitle: "Información del bloque",
      slotCapacityLabel: "Capacidad reservada",
      notesTitle: "Notas",
      noCitizenNotes: "No hay notas del ciudadano para esta cita.",
      noInternalNotes: "No hay notas internas para esta cita.",
    },
    statusActions: {
      title: "Acciones del ciclo de vida",
      description:
        "Usa solo transiciones soportadas por backend para que el backoffice se mantenga alineado con el historial de estados.",
      noteLabel: "Nota de estado",
      notePlaceholder:
        "Nota opcional para guardar en el historial de estados de la cita.",
      noActions:
        "No hay más acciones de ciclo de vida disponibles para esta cita.",
      updated: "Estado de la cita actualizado.",
      failed:
        "No pudimos actualizar el estado de la cita. Revisa el estado actual e inténtalo nuevamente.",
      buttons: {
        CONFIRMED: "Confirmar cita",
        CHECKED_IN: "Registrar check-in",
        IN_PROGRESS: "Iniciar atención",
        COMPLETED: "Completar cita",
        NO_SHOW: "Marcar ausente",
      },
      success: {
        CONFIRMED: "Cita confirmada.",
        CHECKED_IN: "Check-in registrado.",
        IN_PROGRESS: "La cita quedó en atención.",
        COMPLETED: "Cita completada.",
        NO_SHOW: "La cita quedó marcada como ausente.",
      },
    },
    cancellation: {
      title: "Cancelación",
      description:
        "Usa el flujo dedicado de cancelación cuando la cita todavía puede liberar capacidad del bloque.",
      showForm: "Cancelar cita",
      hideForm: "Ocultar formulario de cancelación",
      reasonLabel: "Motivo",
      reasonPlaceholder: "El ciudadano solicitó cancelar",
      detailsLabel: "Detalles",
      detailsPlaceholder:
        "Registra cualquier detalle operativo que deba quedar en el historial del backoffice.",
      submit: "Confirmar cancelación",
      cancelling: "Cancelando cita...",
      success: "Cita cancelada y capacidad del bloque liberada.",
      failed:
        "No pudimos cancelar la cita. Revisa el estado actual e inténtalo nuevamente.",
      unavailable:
        "La cancelación no está disponible para el estado actual de esta cita.",
      noReason: "No se registró un motivo de cancelación.",
    },
    reschedule: {
      title: "Reagendamiento",
      description:
        "Mueve la cita a otro bloque del tenant sin perder de vista el workspace de detalle.",
      showForm: "Reagendar cita",
      hideForm: "Ocultar formulario de reagendamiento",
      currentSlotLabel: "Bloque actual",
      branchLabel: "Sucursal",
      branchPlaceholder: "Selecciona una sucursal para buscar bloques",
      dateLabel: "Fecha del nuevo bloque",
      slotLabel: "Nuevo bloque",
      slotLoading: "Cargando bloques de reemplazo...",
      slotEmpty:
        "No hay bloques de reemplazo disponibles para la sucursal y fecha seleccionadas.",
      slotManualHint: "Fallback manual",
      slotManualDescription:
        "Si el endpoint de lookup de bloques no está disponible en este entorno, igual puedes pegar un ID de bloque.",
      slotManualPlaceholder: "Ingresa un nuevo ID de bloque",
      reasonLabel: "Motivo",
      reasonPlaceholder: "El ciudadano pidió otro horario.",
      detailsLabel: "Detalles",
      detailsPlaceholder:
        "Registra contexto operativo adicional para el historial del reagendamiento.",
      submit: "Confirmar reagendamiento",
      submitting: "Reagendando cita...",
      success: "La cita fue reagendada y la cola ya se actualizó.",
      failed:
        "No pudimos reagendar la cita. Revisa el nuevo bloque e inténtalo nuevamente.",
      unavailable:
        "El reagendamiento no está disponible para el estado actual de esta cita.",
      keepCurrent: "Mantener bloque actual",
    },
    history: {
      title: "Historial de estados",
      empty: "Todavía no hay historial de estados para esta cita.",
    },
    options: {
      statuses: {
        PENDING: "Pendiente",
        CONFIRMED: "Confirmada",
        CHECKED_IN: "Check-in",
        IN_PROGRESS: "En atención",
        COMPLETED: "Completada",
        CANCELLED: "Cancelada",
        NO_SHOW: "Ausente",
        RESCHEDULED: "Reagendada",
      },
      sources: {
        WEB: "Web",
        STAFF: "Staff",
        API: "API",
        IMPORT: "Importación",
      },
    },
  },
  services: {
    page: {
      title: "Servicios",
      description:
        "Administra el catálogo de servicios del tenant, mantén la configuración consistente y deja lista la base para agendamiento y reserva pública futura.",
    },
    actions: {
      create: "Crear servicio",
      clearFilters: "Limpiar filtros",
      closeEditor: "Cerrar editor",
      retry: "Reintentar",
    },
    filters: {
      title: "Filtros del catálogo",
      description:
        "Busca y acota el catálogo de servicios del tenant antes de abrir un servicio en el panel de edición.",
      searchLabel: "Buscar",
      searchPlaceholder: "Buscar por nombre o slug del servicio",
      visibilityLabel: "Visibilidad",
      statusLabel: "Estado",
      visibilityAll: "Todas las visibilidades",
      statusAll: "Todos los estados",
      statusActive: "Solo activos",
      statusInactive: "Solo inactivos",
      resultsLabel: "servicios en vista",
      syncing: "Actualizando catálogo...",
    },
    table: {
      service: "Servicio",
      visibility: "Visibilidad",
      mode: "Modalidad",
      duration: "Duración",
      status: "Estado",
      actions: "Acciones",
      edit: "Editar",
      minutesShort: "min",
      loading: "Cargando catálogo de servicios...",
      emptyTitle: "No hay servicios que coincidan con estos filtros",
      emptyDescription:
        "Ajusta los filtros o crea el primer servicio para este tenant.",
      updating: "Actualizando lista...",
      catalogTitle: "Catálogo de servicios del tenant",
      catalogDescription:
        "Mantén la lista visible mientras revisas configuraciones y abres cualquier servicio para editarlo.",
    },
    editor: {
      emptyTitle: "Selecciona un servicio o crea uno nuevo",
      emptyDescription:
        "El editor se mantiene en la misma página para que el catálogo siga visible mientras trabajas.",
      emptyHint:
        "Elige cualquier fila de la tabla para editarla, o crea un servicio nuevo desde el encabezado.",
      createTitle: "Crear servicio",
      createDescription:
        "Define la configuración de backoffice que luego soportará agendamiento y reserva pública.",
      editTitle: "Editar servicio",
      editDescription:
        "Actualiza la configuración del servicio del tenant actual sin salir del catálogo.",
      loading: "Cargando detalle del servicio...",
      loadErrorTitle: "No pudimos cargar este servicio",
      loadError:
        "Falló la consulta del detalle del servicio. Reintenta o vuelve al catálogo.",
    },
    form: {
      generalTitle: "Información general",
      planningTitle: "Capacidad y tiempos",
      rulesTitle: "Reglas de reserva",
      linkingTitle: "Vínculos opcionales con sucursal y categoría",
      nameLabel: "Nombre",
      nameError: "Ingresa un nombre para el servicio.",
      slugLabel: "Slug",
      slugHint: "Solo letras minúsculas, números y guiones.",
      slugPlaceholder: "renovacion-licencia-conducir",
      slugError: "Usa solo letras minúsculas, números y guiones.",
      descriptionLabel: "Descripción",
      descriptionPlaceholder:
        "Agrega una descripción breve de uso interno para el backoffice.",
      visibilityLabel: "Visibilidad",
      modeLabel: "Modalidad",
      durationLabel: "Duración (minutos)",
      durationError: "Ingresa una duración mayor que cero.",
      bufferBeforeLabel: "Buffer previo (minutos)",
      bufferAfterLabel: "Buffer posterior (minutos)",
      bufferError: "Usa cero o un número positivo.",
      slotCapacityLabel: "Capacidad por bloque",
      slotCapacityError: "La capacidad debe ser al menos 1.",
      branchIdLabel: "ID de sucursal",
      categoryIdLabel: "ID de categoría",
      branchIdHint:
        "Opcional mientras todavía no exista selector de sucursales.",
      categoryIdHint:
        "Opcional mientras la gestión de categorías aún no esté disponible.",
      branchIdPlaceholder: "UUID opcional",
      categoryIdPlaceholder: "UUID opcional",
      referenceError: "Ingresa un UUID válido o deja el campo vacío.",
      submitCreate: "Crear servicio",
      submitUpdate: "Guardar cambios",
      creating: "Creando servicio...",
      updating: "Guardando cambios...",
      createReady: "Servicio creado. Puedes seguir editando el mismo registro.",
      updateReady: "Cambios guardados correctamente.",
      validationError: "Revisa los campos destacados antes de continuar.",
      createFailed: "No pudimos crear el servicio.",
      updateFailed: "No pudimos guardar los cambios.",
      loadFailed: "No pudimos cargar el catálogo de servicios.",
      allowOnlineBookingTitle: "Permitir reserva online",
      allowOnlineBookingDescription:
        "Mantén esto activo cuando el servicio deba aparecer en futuros flujos de reserva pública.",
      requiresApprovalTitle: "Requerir aprobación",
      requiresApprovalDescription:
        "Activa aprobación manual cuando las reservas deban revisarse antes de confirmarse.",
      requiresAuthenticationTitle: "Requerir autenticación",
      requiresAuthenticationDescription:
        "Úsalo para servicios que solo deban ser reservados por usuarios autenticados.",
      allowsCancellationTitle: "Permitir cancelación",
      allowsCancellationDescription:
        "Permite que futuros flujos de reserva cancelen citas de este servicio.",
      allowsRescheduleTitle: "Permitir reagendamiento",
      allowsRescheduleDescription:
        "Permite que futuros flujos de reserva reagenden citas de este servicio.",
      isActiveTitle: "Mantener servicio activo",
      isActiveDescription:
        "Los servicios inactivos siguen visibles en el catálogo, pero se consideran no disponibles para operación.",
    },
    options: {
      visibility: {
        PUBLIC: "Público",
        PRIVATE: "Privado",
        INTERNAL: "Interno",
      },
      mode: {
        IN_PERSON: "Presencial",
        REMOTE: "Remoto",
        HYBRID: "Híbrido",
      },
    },
    names: {
      svc_civil_records: "Asistencia de registros civiles",
      svc_building_permits: "Orientación para permisos de edificación",
      svc_social_programs: "Orientación sobre beneficios sociales",
      svc_environmental_claims: "Mesa de reclamos ambientales",
    },
  },
  branches: {
    page: {
      title: "Sucursales",
      description:
        "Administra las ubicaciones del tenant, sus datos operativos y su estado de activación para futuros módulos de enrutamiento y agenda.",
    },
    actions: {
      create: "Crear sucursal",
      clearFilters: "Limpiar filtros",
      closeEditor: "Cerrar editor",
      retry: "Reintentar",
    },
    filters: {
      title: "Filtros de sucursales",
      description:
        "Busca en el catálogo de sucursales del tenant y mantén el editor abierto junto a la lista mientras trabajas.",
      searchLabel: "Buscar",
      searchPlaceholder: "Buscar por nombre o slug de la sucursal",
      statusLabel: "Estado",
      statusAll: "Todos los estados",
      statusActive: "Solo activas",
      statusInactive: "Solo inactivas",
      resultsLabel: "sucursales en vista",
      syncing: "Actualizando sucursales...",
    },
    table: {
      name: "Sucursal",
      slug: "Slug",
      city: "Ciudad",
      country: "País",
      status: "Estado",
      actions: "Acciones",
      edit: "Editar",
      loading: "Cargando catálogo de sucursales...",
      emptyTitle: "No hay sucursales que coincidan con estos filtros",
      emptyDescription:
        "Ajusta los filtros o crea la primera sucursal para este tenant.",
      updating: "Actualizando lista...",
      catalogTitle: "Catálogo de sucursales del tenant",
      catalogDescription:
        "Revisa la cobertura de sucursales y abre cualquier registro en el editor lateral sin salir de la página.",
      notProvided: "No informado",
    },
    editor: {
      emptyTitle: "Selecciona una sucursal o crea una nueva",
      emptyDescription:
        "El editor se mantiene fijo junto a la lista para que la gestión de sucursales sea rápida y clara.",
      emptyHint:
        "Elige cualquier fila de la tabla para editarla, o crea una nueva sucursal desde el encabezado.",
      createTitle: "Crear sucursal",
      createDescription:
        "Captura los datos de ubicación y operación que reutilizarán los próximos módulos.",
      editTitle: "Editar sucursal",
      editDescription:
        "Actualiza los datos de la sucursal del tenant actual sin salir del catálogo.",
      loading: "Cargando detalle de la sucursal...",
      loadErrorTitle: "No pudimos cargar esta sucursal",
      loadError:
        "Falló la consulta del detalle de la sucursal. Reintenta o vuelve al catálogo.",
    },
    form: {
      generalTitle: "Información general",
      locationTitle: "Datos de ubicación",
      operationsTitle: "Estado operativo",
      nameLabel: "Nombre",
      nameError: "Ingresa un nombre para la sucursal.",
      slugLabel: "Slug",
      slugHint: "Solo letras minúsculas, números y guiones.",
      slugPlaceholder: "sucursal-centro",
      slugError: "Usa solo letras minúsculas, números y guiones.",
      descriptionLabel: "Descripción",
      descriptionPlaceholder:
        "Agrega una descripción breve para ayudar al equipo de backoffice a identificar esta sucursal.",
      timezoneLabel: "Timezone",
      timezoneHint:
        "Timezone IANA opcional, por ejemplo America/Santiago.",
      timezonePlaceholder: "America/Santiago",
      addressLine1Label: "Dirección línea 1",
      addressLine1Placeholder: "Av. Principal 123",
      addressLine2Label: "Dirección línea 2",
      addressLine2Placeholder: "Piso 2, Oficina B",
      cityLabel: "Ciudad",
      stateLabel: "Región o estado",
      countryLabel: "País",
      postalCodeLabel: "Código postal",
      submitCreate: "Crear sucursal",
      submitUpdate: "Guardar cambios",
      creating: "Creando sucursal...",
      updating: "Guardando cambios...",
      createReady: "Sucursal creada. Puedes seguir editando el mismo registro.",
      updateReady: "Cambios guardados correctamente.",
      validationError: "Revisa los campos destacados antes de continuar.",
      createFailed: "No pudimos crear la sucursal.",
      updateFailed: "No pudimos guardar los cambios.",
      loadFailed: "No pudimos cargar el catálogo de sucursales.",
      isActiveTitle: "Mantener sucursal activa",
      isActiveDescription:
        "Las sucursales inactivas siguen visibles en el catálogo, pero futuros módulos de enrutamiento y agenda deberían tratarlas como no disponibles.",
    },
  },
  settings: {
    page: {
      title: "Configuración",
      description:
        "El layout protegido ya está preparado para áreas anidadas de configuración, acceso por roles y gobernanza por tenant.",
    },
    areas: {
      tenant_profile: {
        title: "Perfil del tenant",
        description:
          "Identidad del workspace, timezone por defecto y configuración de marca para el servicio público.",
      },
      authentication: {
        title: "Autenticación",
        description:
          "Provider de credenciales activo, Google OAuth preparado y validación en servidor lista.",
      },
      scheduling_rules: {
        title: "Reglas de agenda",
        description:
          "Generación de bloques, feriados, políticas de capacidad y placeholders de orquestación de filas.",
      },
    },
    scaffold:
      "Esta área está scaffolded para que la configuración específica del tenant pueda pasar de setup estático a flujos administrados sin rediseñar el shell del backoffice.",
  },
} as const;
