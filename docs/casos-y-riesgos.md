# Casos y riesgos priorizados

## Cobertura mínima implementada

| ID | Capa | Escenario | Comprobaciones de aceptación |
|---|---|---|---|
| API-01 | API | Crear y consultar reserva, dos conjuntos de datos | 201, identidad, roomid, bookingid, fechas, depósito, email y teléfono |
| API-02 | API | Crear sin `firstname` | 400, mensaje de validación y ausencia en la lista de la habitación |
| E2E-01 | UI + API | Crear desde UI y consultar el mismo huésped por API | Confirmación y coincidencia de habitación, fechas e identidad |

Todos los casos usan el backend real. El runner se configura para dos workers; la demostración sólo se considera verificada cuando se ejecute `npm test` y se conserve su reporte.

## Tres casos para priorizar después

| Prioridad | Caso no automatizado | Riesgo que cubre | Aserción principal |
|---|---|---|---|
| P1 | Dos reservas solapadas para la misma habitación | Doble asignación y corrupción de disponibilidad bajo concurrencia | Una solicitud se rechaza o la disponibilidad se actualiza de acuerdo con el contrato; verificar persistencia de ambas |
| P1 | Fechas ausentes, formato inválido o checkout anterior/igual al checkin | Reserva imposible, errores de parsing o estado inconsistente | Rechazo explícito 4xx y ninguna reserva persistida |
| P2 | Lectura, actualización y borrado sin token o con token inválido | Acceso no autorizado a datos de huéspedes o modificación de reservas | 401/403 y registro sin cambios; usar reservas sintéticas propias |

Son candidatos para ciclos siguientes, no forman parte del resultado mínimo ni se reportan como ejecutados.
