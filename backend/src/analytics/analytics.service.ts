import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

async registrarEvento(
  type: string,
  companyId: string,
  sucursalId?: string,
  serviceId?: string,
  visitorId?: string,
) {
  return this.prisma.analyticsEvent.create({
    data: {
      type,
      companyId,
      sucursalId: sucursalId || undefined,
      serviceId: serviceId || undefined,
      visitorId: visitorId || undefined,
    },
  });
}
   async obtenerEstadisticas(companyId: string) {
    const eventos = await this.prisma.analyticsEvent.findMany({
      where: {
        companyId,
      },
include: {
  service: true,
  sucursal: true,
},
      orderBy: {
        createdAt: 'desc',
      },
    });

  const contar = (types: string[]) =>
  eventos.filter((evento) => types.includes(evento.type)).length;

const vistasPerfil = contar([
  'PROFILE_VIEW',
  'VISTA_DE_PERFIL',
]);

const vistasServicio = eventos.filter(
  (evento) =>
    ['SERVICE_VIEW', 'VISTA_DE_SERVICIO'].includes(
      evento.type,
    ) &&
    evento.serviceId &&
    evento.service,
).length;

const whatsapp = contar([
  'WHATSAPP_CLICK',
  'WHATSAPP_CLIC',
  'WhatsApp',
  'whatsapp',
]);

const telefono = contar([
  'PHONE_CLICK',
  'CLIC EN EL TELÉFONO',
]);

const email = contar([
  'EMAIL_CLICK',
  'CORREO ELECTRÓNICO_CLIC',
]);

const mapa = contar([
  'MAP_CLICK',
]);

const facebook = contar([
  'FACEBOOK_CLICK',
]);

const total =
  vistasPerfil +
  vistasServicio +
  whatsapp +
  telefono +
  email +
  mapa +
  facebook;
const visitantesUnicosSet = new Set(
  eventos
    .map((evento) => evento.visitorId)
    .filter((visitorId): visitorId is string => Boolean(visitorId))
);

const visitantesServicioSet = new Set(
  eventos
    .filter(
      (evento) =>
        ['SERVICE_VIEW', 'VISTA_DE_SERVICIO'].includes(evento.type) &&
        evento.visitorId,
    )
    .map((evento) => evento.visitorId)
    .filter(
      (visitorId): visitorId is string =>
        Boolean(visitorId),
    ),
);

const visitantesQueVieronServicio =
  visitantesServicioSet.size;

const tiposContacto = new Set([
  'WHATSAPP_CLICK',
  'WHATSAPP_CLIC',
  'PHONE_CLICK',
  'CLIC EN EL TELÉFONO',
  'EMAIL_CLICK',
  'CORREO ELECTRÓNICO_CLIC',
  'MAP_CLICK',
  'FACEBOOK_CLICK',
]);

const visitantesContacto = new Set(
  eventos
    .filter(
      (evento) =>
        tiposContacto.has(evento.type) &&
        evento.visitorId
    )
    .map((evento) => evento.visitorId)
    .filter((visitorId): visitorId is string => Boolean(visitorId))
);

const visitantesUnicos = visitantesUnicosSet.size;

const visitantesQueContactaron = visitantesContacto.size;

const tasaConversion =
  visitantesUnicos > 0
    ? Math.round(
        (visitantesQueContactaron / visitantesUnicos) * 100
      )
    : 0;

    const serviciosMap = new Map<
      string,
      {
        serviceId: string;
        nombre: string;
        vistas: number;
      }
    >();

    for (const evento of eventos) {
if (
  ['SERVICE_VIEW', 'VISTA_DE_SERVICIO'].includes(evento.type) &&
  evento.serviceId &&
  evento.service
      ) {
        const existente = serviciosMap.get(evento.serviceId);

        if (existente) {
          existente.vistas++;
        } else {
          serviciosMap.set(evento.serviceId, {
            serviceId: evento.serviceId,
            nombre: evento.service.nombre,
            vistas: 1,
          });
        }
      }
    }

const serviciosMasVistos = Array.from(
  serviciosMap.values(),
).sort((a, b) => b.vistas - a.vistas);

// ==========================================
// ESTADÍSTICAS POR SUCURSAL
// ==========================================

const sucursalesActivas =
  await this.prisma.sucursal.findMany({
    where: {
      companyId,
      activo: true,
    },
    select: {
      id: true,
      nombre: true,
    },
  });

const sucursalesMap = new Map<
  string,
  {
    sucursalId: string;
    nombre: string;
    total: number;
    vistasPerfil: number;
    vistasServicio: number;
    whatsapp: number;
    telefono: number;
    email: number;
    mapa: number;
    facebook: number;
  }
>();

// Registrar primero todas las sucursales activas,
// incluso las que todavía tienen 0 interacciones.
for (const sucursal of sucursalesActivas) {
  sucursalesMap.set(sucursal.id, {
    sucursalId: sucursal.id,
    nombre: sucursal.nombre,
    total: 0,
    vistasPerfil: 0,
    vistasServicio: 0,
    whatsapp: 0,
    telefono: 0,
    email: 0,
    mapa: 0,
    facebook: 0,
  });
}

// Acumular únicamente eventos pertenecientes
// a sucursales activas actuales.
for (const evento of eventos) {
  if (!evento.sucursalId) {
    continue;
  }

  const existente = sucursalesMap.get(
    evento.sucursalId,
  );

  if (!existente) {
    continue;
  }

  existente.total++;

  if (
    [
      'PROFILE_VIEW',
      'VISTA_DE_PERFIL',
    ].includes(evento.type)
  ) {
    existente.vistasPerfil++;
  }

  if (
    [
      'SERVICE_VIEW',
      'VISTA_DE_SERVICIO',
    ].includes(evento.type)
  ) {
    existente.vistasServicio++;
  }

  if (
    [
      'WHATSAPP_CLICK',
      'WHATSAPP_CLIC',
      'WhatsApp',
      'whatsapp',
    ].includes(evento.type)
  ) {
    existente.whatsapp++;
  }

  if (
    [
      'PHONE_CLICK',
      'CLIC EN EL TELÉFONO',
    ].includes(evento.type)
  ) {
    existente.telefono++;
  }

  if (
    [
      'EMAIL_CLICK',
      'CORREO ELECTRÓNICO_CLIC',
    ].includes(evento.type)
  ) {
    existente.email++;
  }

  if (evento.type === 'MAP_CLICK') {
    existente.mapa++;
  }

  if (evento.type === 'FACEBOOK_CLICK') {
    existente.facebook++;
  }
}

const estadisticasSucursales =
  Array.from(sucursalesMap.values()).sort(
    (a, b) => b.total - a.total,
  );
 
    return {
      companyId,

      resumen: {
        total,
        vistasPerfil,
        vistasServicio,
        whatsapp,
        telefono,
        email,
        mapa,
        facebook,
visitantesUnicos,
visitantesQueVieronServicio,
visitantesQueContactaron,
tasaConversion,
      },

      serviciosMasVistos,
      estadisticasSucursales,
    };
  }
 async obtenerEstadisticasGlobales(period?: string) {
let desde: Date | undefined;
let desdeAnterior: Date | undefined;
let hastaAnterior: Date | undefined;

const ahora = new Date();

// =====================================================
// PERÍODOS DE ANÁLISIS
// =====================================================

if (period === 'today') {
  desde = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate(),
    0,
    0,
    0,
    0,
  );
}
if (period === 'today') {
  desdeAnterior = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - 1,
    0,
    0,
    0,
    0,
  );

  hastaAnterior = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate(),
    0,
    0,
    0,
    0,
  );
}
if (period === '7d') {
  desde = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - 6,
    0,
    0,
    0,
    0,
  );

  desdeAnterior = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - 13,
    0,
    0,
    0,
    0,
  );

  hastaAnterior = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - 6,
    0,
    0,
    0,
    0,
  );
}

if (period === '30d') {
  desde = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - 29,
    0,
    0,
    0,
    0,
  );

  desdeAnterior = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - 59,
    0,
    0,
    0,
    0,
  );

  hastaAnterior = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - 29,
    0,
    0,
    0,
    0,
  );
}

if (period === '90d') {
  desde = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() - 89,
    0,
    0,
    0,
    0,
  );
}
desdeAnterior = new Date(
  ahora.getFullYear(),
  ahora.getMonth(),
  ahora.getDate() - 179,
  0,
  0,
  0,
  0,
);

hastaAnterior = new Date(
  ahora.getFullYear(),
  ahora.getMonth(),
  ahora.getDate() - 89,
  0,
  0,
  0,
  0,
);
const eventos = await this.prisma.analyticsEvent.findMany({
  where: desde
    ? {
        createdAt: {
          gte: desde,
        },
      }
    : undefined,

  include: {
    service: true,
  },

  orderBy: {
    createdAt: 'desc',
  },
});
const eventosAnteriores =
  desdeAnterior && hastaAnterior
    ? await this.prisma.analyticsEvent.findMany({
        where: {
          createdAt: {
            gte: desdeAnterior,
            lt: hastaAnterior,
          },
        },
      })
    : [];

  const contar = (types: string[]) =>
    eventos.filter((evento) => types.includes(evento.type)).length;
  const vistasPerfil = contar([
    'PROFILE_VIEW',
    'VISTA_DE_PERFIL',
  ]);

 const vistasServicio = eventos.filter(
  (evento) =>
    ['SERVICE_VIEW', 'VISTA_DE_SERVICIO'].includes(
      evento.type,
    ) &&
    evento.serviceId &&
    evento.service,
).length;

  const whatsapp = contar([
  'WHATSAPP_CLICK',
  'WHATSAPP_CLIC',
  'WhatsApp',
  'whatsapp',
]);

  const telefono = contar([
    'PHONE_CLICK',
    'CLIC EN EL TELÉFONO',
  ]);

  const email = contar([
    'EMAIL_CLICK',
    'CORREO ELECTRÓNICO_CLIC',
    'CORREO ELECTRONICO_CLICK',
  ]);

  const mapa = contar([
    'MAP_CLICK',
  ]);

  const facebook = contar([
    'FACEBOOK_CLICK',
  ]);

  const total =
    vistasPerfil +
    vistasServicio +
    whatsapp +
    telefono +
    email +
    mapa +
    facebook;
const contarAnterior = (types: string[]) =>
  eventosAnteriores.filter((evento) =>
    types.includes(evento.type),
  ).length;

const totalAnterior =
  contarAnterior([
    'PROFILE_VIEW',
    'VISTA_DE_PERFIL',
  ]) +
  contarAnterior([
    'SERVICE_VIEW',
    'VISTA_DE_SERVICIO',
  ]) +
  contarAnterior([
    'WHATSAPP_CLICK',
    'WHATSAPP_CLIC',
  ]) +
  contarAnterior([
    'PHONE_CLICK',
    'CLIC EN EL TELÉFONO',
  ]) +
  contarAnterior([
    'EMAIL_CLICK',
    'CORREO ELECTRÓNICO_CLIC',
    'CORREO ELECTRONICO_CLICK',
  ]) +
  contarAnterior([
    'MAP_CLICK',
  ]) +
  contarAnterior([
    'FACEBOOK_CLICK',
  ]);

const cambioTotal =
  totalAnterior > 0
    ? Math.round(
        ((total - totalAnterior) / totalAnterior) * 100,
      )
    : null;
  // ==========================================
  // VISITANTES ÚNICOS
  // ==========================================

  const visitantesUnicosSet = new Set(
    eventos
      .map((evento) => evento.visitorId)
      .filter(
        (visitorId): visitorId is string =>
          Boolean(visitorId),
      ),
  );
  const visitantesServicioSet = new Set(
  eventos
    .filter(
      (evento) =>
        ['SERVICE_VIEW', 'VISTA_DE_SERVICIO'].includes(
          evento.type,
        ) &&
        evento.visitorId,
    )
    .map((evento) => evento.visitorId)
    .filter(
      (visitorId): visitorId is string =>
        Boolean(visitorId),
    ),
);

const visitantesQueVieronServicio =
  visitantesServicioSet.size;
  // ==========================================
  // VISITANTES QUE CONTACTARON
  // ==========================================

  const tiposContacto = new Set([
    'WHATSAPP_CLICK',
    'WHATSAPP_CLIC',
    'PHONE_CLICK',
    'CLIC EN EL TELÉFONO',
    'EMAIL_CLICK',
    'CORREO ELECTRÓNICO_CLIC',
    'CORREO ELECTRONICO_CLICK',
    'MAP_CLICK',
    'FACEBOOK_CLICK',
  ]);

  const visitantesContacto = new Set(
    eventos
      .filter(
        (evento) =>
          tiposContacto.has(evento.type) &&
          evento.visitorId,
      )
      .map((evento) => evento.visitorId)
      .filter(
        (visitorId): visitorId is string =>
          Boolean(visitorId),
      ),
  );

  const visitantesUnicos = visitantesUnicosSet.size;

  const visitantesQueContactaron =
    visitantesContacto.size;

  // ==========================================
  // TASA DE CONVERSIÓN
  // ==========================================

  const tasaConversion =
    visitantesUnicos > 0
      ? Math.round(
          (visitantesQueContactaron /
            visitantesUnicos) *
            100,
        )
      : 0;

  // ==========================================
  // SERVICIOS MÁS VISTOS
  // ==========================================

  const serviciosMap = new Map<
    string,
    {
      serviceId: string;
      nombre: string;
      vistas: number;
    }
  >();

  for (const evento of eventos) {
    if (
      ['SERVICE_VIEW', 'VISTA_DE_SERVICIO'].includes(
        evento.type,
      ) &&
      evento.serviceId &&
      evento.service
    ) {
      const existente = serviciosMap.get(
        evento.serviceId,
      );

      if (existente) {
        existente.vistas++;
      } else {
        serviciosMap.set(evento.serviceId, {
          serviceId: evento.serviceId,
          nombre: evento.service.nombre,
          vistas: 1,
        });
      }
    }
  }

  const serviciosMasVistos = Array.from(
    serviciosMap.values(),
  ).sort((a, b) => b.vistas - a.vistas);

  // ==========================================
  // RESPUESTA GLOBAL
  // ==========================================

return {
  resumen: {
    total,
    vistasPerfil,
    vistasServicio,
    whatsapp,
    telefono,
    email,
    mapa,
    facebook,

    visitantesUnicos,
    visitantesQueVieronServicio,
    visitantesQueContactaron,
    tasaConversion,

    cambioTotal,
  },

  serviciosMasVistos,
};
}
}