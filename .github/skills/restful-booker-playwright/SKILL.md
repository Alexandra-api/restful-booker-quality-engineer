---
name: restful-booker-playwright
description: "Guía la creación, ejecución y reporte de pruebas API y UI para Restful Booker con TypeScript y Playwright Test. Úsala al añadir reservas automatizadas, validar el contrato real, preparar fixtures, depurar fallos o documentar hallazgos."
argument-hint: "Describe el escenario, los datos permitidos y el criterio de aceptación"
---

# Pruebas API y UI de Restful Booker

## Propósito

Implementar pruebas reproducibles contra la aplicación Restful Booker publicada, usando Playwright Test con TypeScript. La prueba API es una llamada HTTP real con `APIRequestContext`; la prueba de interfaz usa Playwright y verifica el registro resultante por API. Esta skill no cambia el producto bajo prueba.

## Entradas necesarias

- Escenario y criterio de aceptación verificable.
- URL de la aplicación (por defecto `https://automationintesting.online`).
- Datos sintéticos y fechas futuras; no reutilizar datos personales.
- Contrato consultado en la documentación Postman y, si hay diferencias, fuente/documentación vigente del proyecto.
- Variables opcionales de autenticación `BOOKING_USERNAME` y `BOOKING_PASSWORD` para lecturas protegidas.

Si faltan datos que impidan una prueba segura o una aserción confiable, no inventes comportamiento: inspecciona el contrato y el entorno de demo, informa la incertidumbre y solicita aclaración cuando corresponda.

## Procedimiento

1. Revisa `package.json`, `playwright.config.ts`, fixtures, clientes API, POM, tests y README existentes antes de editar. Conserva cambios del usuario.
2. Traduce cada criterio en una aserción de negocio observable; confirma endpoint, método, payload, autorización y respuesta contra el contrato documentado.
3. Usa únicamente el entorno de demo autorizado y datos sintéticos. Calcula fechas futuras, comprueba disponibilidad por API antes de reservar y limita reintentos a una política explícita. No elimines ni modifiques reservas ajenas.
4. Mantén clientes API separados de los Page Objects. Centraliza configuración compartida y autenticación en fixtures de alcance por prueba; cada prueba debe crear sus propios datos y poder correr con workers en paralelo.
5. Para UI, usa locators accesibles y estables (`getByRole`, `getByLabel`, `getByPlaceholder`). Encapsula interacciones en Page Objects pequeños. Aprovecha las aserciones auto-waiting de Playwright; no uses pausas fijas ni sleeps.
6. Cubre la respuesta HTTP y el contenido relevante (identidad, habitación, fechas y huésped), no sólo que la operación “funcionó”. En negativos, verifica el rechazo y que el dato no persiste.
7. Ejecuta primero el test focalizado; después corre la suite completa con al menos dos workers. Conserva código de salida, reporte HTML, trazas/capturas/video ante fallos y no marques como aprobado un caso no ejecutado.
8. Revisa fallos reales sin ocultarlos ni debilitar aserciones. Clasifica error de producto, contrato/documentación, entorno compartido, datos o automatización; registra evidencia antes de proponer correcciones.
9. Actualiza el reporte de ejecución y la bitácora de mejoras con fecha, comando, resultado, caso, esperado, observado, evidencia y limitaciones. Separa hechos reproducidos de hipótesis.
10. Resume cualquier corrección humana a la salida de IA y su motivo. No afirmes que un agente o una ejecución se usó si no hay evidencia de esa invocación/ejecución.

## Convenciones de POM y fixtures

- `tests/pages/`: Page Objects de UI, sin aserciones de negocio fuera de las verificaciones de estado de página estrictamente necesarias.
- `tests/api/`: clientes tipados por recurso (`rooms`, `bookings`, `auth`); un cliente no debe absorber locators ni navegación.
- `tests/fixtures/`: fixtures de Playwright con recursos por prueba y limpieza sólo de datos creados por la misma prueba, si el contrato permite limpiarlos con seguridad.
- `tests/*.spec.ts`: describe intención y criterio; usa `test.step` para hitos de negocio, no para ocultar lógica.
- Nombres de datos únicos; los campos requeridos deben corresponder al contrato observado. No uses `any` para evitar tipado.
- Los clientes deben exponer las respuestas HTTP sin convertir errores en respuestas exitosas ni descartar el cuerpo de error.

## Comandos de verificación

```bash
npm ci
npx playwright install --with-deps chromium
npm run typecheck
npm run test:api
npm run test:ui
npm test
npx playwright show-report
```

En Windows, `npx playwright install chromium` instala el navegador; `--with-deps` es para Linux CI. Configura `BASE_URL` y, si el entorno exige credenciales distintas, `BOOKING_USERNAME`/`BOOKING_PASSWORD`.

## Criterios de éxito

- Casos API exitoso, API negativo y UI→API pasan contra el backend real.
- Al menos un escenario se ejecuta con dos conjuntos de datos.
- El escenario UI comprueba confirmación y recupera por API la misma reserva.
- No hay dependencia de orden entre tests ni esperas fijas.
- La ejecución completa se lanzó con dos o más workers; se registran pases, fallos y no ejecutados sin maquillarlos.
- Se conservan `playwright-report/` y evidencia de fallo; el comando devuelve el código de salida original.
- README y `docs/` identifican los comandos, la evidencia y las diferencias de contrato observadas.

## Actuación ante errores

- No repitas requests de escritura a ciegas: una respuesta perdida puede haber creado el registro. Busca primero por habitación y huella única del huésped/fechas.
- Si la app demo devuelve 401/5xx, el contrato cambió o no hay disponibilidad, conserva status/body, distingue fallo de producto de indisponibilidad externa y no sustituyas la prueba por mocks.
- No afirmes que un negative case pasó si la respuesta fue ambigua o si no se comprobó persistencia.
- No desactives TLS, no imprimas tokens ni guardes secretos en logs, capturas, commits o reportes.
- Ante fallo de locator, revisa el DOM y accesibilidad y ajusta el POM; no uses selectores frágiles ni elimines la aserción.
- Si no se puede ejecutar por dependencia o conectividad, reporta `BLOQUEADO/NO EJECUTADO`, el comando, el error y el siguiente paso; nunca lo etiquetes como éxito.
