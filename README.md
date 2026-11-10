# Restful Booker Quality Engineer

Suite pequeña de pruebas de API y UI para [Restful Booker Platform](https://automationintesting.online/), implementada en TypeScript con Playwright Test. Prueba el demo real con datos sintéticos; no levanta ni modifica el producto.

## Alcance

- **API exitosa (parametrizada):** crea una reserva en habitación disponible y consulta el mismo registro; comprueba estado, huésped, habitación, fechas y depósito.
- **API negativa:** omite `firstname`, espera rechazo `400` y comprueba por API que no se guardó esa reserva.
- **UI → API:** confirma una reserva desde la interfaz, verifica la confirmación y recupera por API la misma combinación de huésped, habitación y fechas.
- Las fixtures y los nombres aleatorios aíslan pruebas paralelas. El config usa dos workers, reporte HTML, trazas, video y capturas pertinentes ante fallos.

## Requisitos e instalación

Requiere Node.js 24 LTS (o una versión compatible con las dependencias) y npm.

```bash
npm ci
npx playwright install chromium
```

En Linux CI se puede instalar dependencias del sistema con `npx playwright install --with-deps chromium`. Copia `.env.example` a `.env` si necesitas configurar `BASE_URL`; usa `BOOKING_USERNAME` y `BOOKING_PASSWORD` sólo cuando cambien las credenciales públicas del demo. No guardes credenciales reales en el repositorio.

El demo compartido puede reiniciarse o cambiar disponibilidad. Cada prueba calcula fechas futuras, consulta primero habitaciones disponibles y usa datos sintéticos. No ejecutes escrituras sobre entornos distintos al autorizado.

## Ejecución y evidencia

```bash
npm run test:api
npm run test:ui
npm test
npm run typecheck
npm run report
```

`npm test` lanza toda la suite con `workers: 2`. El reporte persistente se escribe en `playwright-report/`; capturas, trazas y video de errores en `test-results/`. Para ver evidencia:

```bash
npx playwright show-report
```

Conserva el código de salida del runner en CI. Un test omitido, bloqueado o no ejecutado no se cuenta como aprobado.

**Ejecución de esta entrega:** 3 de 4 tests aprobados; el escenario UI→API falla antes de reservar porque el demo devolvió HTTP 500 al cargar los recursos de habitación/calendario. El estado esperado, la evidencia y las limitaciones están en [docs/reporte-ejecucion.md](docs/reporte-ejecucion.md) y [docs/hallazgos-y-mejoras.md](docs/hallazgos-y-mejoras.md). Screenshot del fallo: [docs/evidence/booking-ui-spinner.png](docs/evidence/booking-ui-spinner.png). El HTML report y trace completos se conservan localmente, pero no se publican sin revisar su contenido por tokens/datos.

## Diseño

```text
tests/api/        Clientes separados de autenticación, habitaciones y reservas
tests/fixtures/   APIRequestContext, autenticación y datos/fechas por prueba
tests/pages/      Page Object para el flujo de reserva UI
tests/api/        Casos funcionales API (incluye dos conjuntos de datos)
tests/ui/         Flujo integrado UI → API
.github/agents/   Agente enfocado en pruebas de reservas
.github/skills/   Skill reutilizable de implementación y verificación
docs/             Riesgos, hallazgos, ejecución y adopción
```

Las lecturas de reservas requieren autenticación: la fixture inicia sesión por `/api/auth/login` y envía el token como cookie. La creación se realiza por `/api/booking`; disponibilidad por `/api/room?checkin=...&checkout=...`. Los clientes devuelven errores explícitamente y no sustituyen respuestas fallidas.

## Uso del agente y skill

- Agente de workspace: [`.github/agents/restful-booker-test-engineer.agent.md`](.github/agents/restful-booker-test-engineer.agent.md).
- Skill invocable: [`.github/skills/restful-booker-playwright/SKILL.md`](.github/skills/restful-booker-playwright/SKILL.md).
- La skill se guardó en un commit separado antes de delegar el escenario integrado: `fe0862240d85e844c007d977afaf309d211a73ea` (`Add Playwright booking testing skill`).
- Para replicar la delegación, seleccionar el agente **Restful Booker Test Engineer** en Copilot Chat y pedir el escenario UI→API; la skill contiene entradas, proceso, comandos y criterios. La implementación de este reto se delegó a un agente general con instrucciones explícitas para leer la skill y el rol del agente del repositorio. La evidencia disponible se resume en [docs/reporte-ejecucion.md](docs/reporte-ejecucion.md).

## Contrato y documentación

Consulta la [colección Postman de Restful Booker Platform](https://www.postman.com/automation-in-testing/restful-booker-collections/documentation/ci13ds3/restful-booker-platform) y compara sus expectativas con el demo; registra diferencias, status y evidencia en [docs/hallazgos-y-mejoras.md](docs/hallazgos-y-mejoras.md). Casos manuales priorizados y riesgos: [docs/casos-y-riesgos.md](docs/casos-y-riesgos.md). Skills futuras y propuesta de adopción: [docs/skills-propuestas.md](docs/skills-propuestas.md).

## Reutilización y gates

Los clientes API, las fechas futuras y el fixture sirven de base para nuevas pruebas funcionales. En CI, `npm run test:api` es un gate rápido de smoke y `npm test` (incluida UI) un gate de regresión; conservar reportes y fallar el pipeline ante código distinto de cero. No se requiere Azure ni despliegue. Antes de ejecutar más carga, concurrencia alta o escrituras destructivas en el demo compartido, acordar un entorno aislado.

## Fuente de referencia

Los requisitos de este harness siguen el alcance mínimo de la prueba técnica. Se consultó el repositorio público `mwinteringham/restful-booker-platform` para revisar la validación del modelo Booking, autorización de lectura y comportamiento de UI; no se modificó ese repositorio.
