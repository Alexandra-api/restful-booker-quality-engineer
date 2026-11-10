# Skills reutilizables propuestas

| Prioridad | Skill | Usuario | Entradas | Salidas | Verificación |
|---|---|---|---|---|---|
| P1 | Diagnóstico de contrato API | QA, backend y agentes | OpenAPI/Postman, request, response, entorno/versión | Matriz contrato-observado, divergencias con evidencia y casos de prueba | Cada afirmación enlaza status/payload capturado y ejecución reproducible; sin inferir campos no documentados |
| P2 | Diseño de pruebas de disponibilidad y fechas | QA funcional y de API | Room API, zona horaria, reglas de calendario, fixtures | Casos frontera de fechas, solapamiento, disponibilidad y matriz de riesgo | Validar límites y combinaciones con pruebas reales aisladas; reportar timezone y datos |
| P2 | Diagnóstico de fallos Playwright | Desarrolladores, QA y agentes | Código de salida, reporte, trace, screenshot/video y logs | Clasificación producto/contrato/datos/entorno/automatización y siguiente paso | No modificar aserciones; reproducir el test focalizado y mantener evidencia antes/después |

## Primera a construir: Diagnóstico de contrato API

Resuelve la repetición de revisar manualmente documentación, requests y respuestas cuando cambia la API. Su usuario principal sería QA y cualquier agente que agregue cobertura de API. Recibiría especificación (colección Postman u OpenAPI), endpoint/método, payload seguro y respuesta observada. Entregaría tabla de campo/status/documentación/observación, casos faltantes y cambios sugeridos, diferenciando hechos de hipótesis. Se verificará contra ejemplos versionados y no podrá declarar contrato incumplido sin request/response guardados sin secretos.

Medir utilidad en cuatro semanas: tiempo medio para validar un cambio de contrato, proporción de hallazgos que el equipo confirma, tasa de falsos positivos y casos de regresión derivados. Un script debe normalizar/limpiar timestamps y secretos de fixtures JSON antes de comparar; una fixture debería centralizar URL, headers y token efímero. Mantener el razonamiento de riesgo y aceptación en la skill, no enterrarlo en el script.
