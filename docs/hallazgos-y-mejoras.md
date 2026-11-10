# Hallazgos y mejoras

Fecha de inspección: 2026-11-10. Entorno: demo compartido `https://automationintesting.online`.

Este documento separa observaciones reproducidas de hipótesis. La ejecución completa se registra en [reporte de ejecución](./reporte-ejecucion.md); la UI sigue bloqueada por el demo y no se considera aprobada.

## Observaciones reproducidas

| ID | Evidencia | Esperado/contrato consultado | Observado | Clasificación | Mejora o seguimiento |
|---|---|---|---|---|---|
| OBS-01 | `POST /api/auth/login` con credenciales públicas del demo respondió y devolvió un token (10-nov-2026; no se conserva el valor). | Login del demo habilita lecturas que requieren token. | Token presente. | Comportamiento esperado; observación de setup. | Centralizar login en fixture; nunca imprimir ni guardar token. |
| OBS-02 | `GET /api/booking` sin token devolvió HTTP 401. | Las lecturas de booking validan sesión; también lo confirma el controller de referencia. | HTTP 401. | Comportamiento esperado; hallazgo de autenticación. | Documentar y probar el flujo protegido; no llamar GET como anónimo. |
| OBS-03 | `GET /api/room?checkin=2026-12-10&checkout=2026-12-12` devolvió HTTP 200 y tres habitaciones en el chequeo exploratorio. | Consulta de habitaciones para fechas futuras. | Había disponibilidad en la ventana revisada. | Estado del demo en ese instante, no garantía futura. | Consultar disponibilidad en cada prueba y no hardcodear IDs/días. |
| BUG-01 | El test API autenticado creó una reserva (HTTP 201), la encontró por `GET /api/booking?roomid=1`, y luego `GET /api/booking/{bookingid}` respondió HTTP 500. En la misma ejecución, la lectura por habitación seguía operativa. | El endpoint individual de consulta debe devolver el registro existente. | HTTP 500 en consulta individual tras creación; consulta de lista devuelve huésped/habitación/fechas. | Defecto reproducido del demo; no se atribuye a un problema de datos del test. | El caso mínimo comprueba la misma reserva vía lista autenticada, conservando el 500 como hallazgo explícito. Investigar stack/error del servicio antes de cerrar. |
| BUG-02 | Prueba UI API-01 navegó a `/reservation/1?checkin=2027-01-12&checkout=2027-01-14`; la página quedó en el spinner y no renderizó `Book This Room`. `GET /api/room/1` respondió HTTP 500 y `GET /api/report/room/1` también 500; `/api/branding` respondió 200. | La reserva debe cargar habitación, disponibilidad/calendario y permitir confirmar. | El flujo no pudo llegar al formulario ni crear la reserva desde UI. | Bloqueo reproducible del demo para el escenario UI en esta ejecución. | Investigar las respuestas 500 de room/report; no simularlas ni marcar el E2E como aprobado. Mantener el test fallido como evidencia. |
| OBS-04 | Dos intentos API paralelos obtuvieron HTTP 409 al crear después de ver habitaciones disponibles; una repetición focalizada posterior sobre fechas disponibles obtuvo 201. | La plataforma puede rechazar una reserva en conflicto. | Resultado no estable en demo compartido; el 409 inicial no se reprodujo al repetir el caso y no se conserva cuerpo de respuesta. | Posible contención externa/estado compartido; causa no confirmada. | No agregar reintentos de escritura ni declarar defecto de disponibilidad sin evidencia adicional; volver a consultar disponibilidad en el instante de reservar. |
| OBS-05 | Tras crear reserva con `email` y `phone`, la lectura de la lista devolvió huésped, roomid y fechas pero no los campos de contacto. El modelo/DAO de referencia construye la reserva persistida sólo con roomid, nombre, apellido, depósito y fechas. | Se solicitan datos de huésped relevantes; los campos que el contrato define como retornables deben coincidir. | Contacto opcional enviado no está disponible en la lectura por diseño/implementación de referencia. | Limitación observada; no se afirma incumplimiento Postman sin cotejar su esquema. | La aserción mínima valida nombre y apellido, habitación y fechas; registrar el contrato de email/teléfono antes de definirlos como persistencia esperada. |

## Diferencias y defectos

BUG-01 y BUG-02 son hallazgos del entorno demo observados mediante solicitudes reales y artefactos de Playwright. No se modificó el producto bajo prueba. El 409 no se clasificó como defecto confirmado. La documentación Postman debe cotejarse campo por campo antes de concluir sobre la persistencia de `email`/`phone`.

## Mejoras aplicadas al harness

1. Clientes `auth`, `room` y `booking` independientes de los Page Objects.
2. Token protegido dentro de fixture de prueba; no se escribe a logs ni a artefactos.
3. Datos de huésped únicos y consulta de disponibilidad antes de reservar.
4. Verificación negativa incluye lectura posterior para descartar persistencia.
5. Dos workers, reporte HTML, trace, video y screenshot ante fallo.
6. La skill impide tratar una prueba no ejecutada como aprobada y guía la clasificación de errores del demo.
7. El API exitoso verifica la reserva por lista autenticada; el endpoint de consulta individual con 500 queda reportado por separado en vez de eliminar la cobertura del caso mínimo.

## Reutilización futura

Convertir los clientes y fixtures actuales en base para smoke de API; ampliar regresión con fechas frontera, conflictos y autorización negativa. Para ambientes CI, parametrizar `BASE_URL`/credenciales por variables protegidas y mantener al demo público sólo como smoke de baja frecuencia. Un ambiente efímero aislado es preferible para pruebas que escriben o compiten por disponibilidad.
