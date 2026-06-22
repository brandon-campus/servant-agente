# Agente IA Servant — Documento Maestro del Proyecto

> Versión: 1.0
> Fecha: Junio 2026
> Autor: Brandon Candia para David Yañez — Servant Argentina
> Estado: Pre-desarrollo

---

## 1. El Problema

Servant Argentina es una empresa con múltiples unidades de negocio: reparación de celulares, compra/venta de equipos, cursos presenciales, cursos online, venta de máquinas y herramientas para técnicos, repuestos por mayor y alquiler de espacios para podcast y eventos. Cada área tiene su propio perfil de cliente, sus propias preguntas frecuentes y su propio proceso de cierre.

Hoy, todas esas consultas llegan sin filtro al mismo canal de atención. Una persona del equipo (Leila) recibe preguntas de alumnos interesados en los cursos, de técnicos buscando repuestos, de clientes con el celu roto y de empresas queriendo reservar un espacio — todo mezclado, sin orden, sin prioridad y sin respuestas automatizadas.

El resultado es tiempo perdido en consultas repetitivas que podrían responderse solas, y foco perdido en lo que realmente requiere intervención humana: cerrar una venta, coordinar un turno o confirmar una reserva.

---

## 2. La Solución

Un agente conversacional con IA alojado en su propio dominio (`agenteservant.vercel.app`) que:

- Recibe al cliente con el tono y la identidad visual de Servant
- Le presenta las áreas disponibles y lo guía al sector correcto
- Responde preguntas específicas de cada área usando los manuales oficiales de Servant
- Avisa al cliente cuando es necesario hablar con un humano y notifica a Leila en tiempo real
- Permite que Leila tome el chat manualmente desde un dashboard privado con login

---

## 3. Usuario Objetivo

### Usuario primario — El cliente de Servant
Personas de entre 18 y 45 años que llegan con una necesidad específica: reparar un celular, aprender a ser técnico, comprar insumos o reservar un espacio. Usan el celular como primer dispositivo. Esperan respuesta rápida y clara, sin tener que explicar de qué área son.

### Usuario secundario — Leila (operadora del dashboard)
Persona del equipo de Servant encargada de gestionar la comunicación digital. No tiene conocimientos técnicos. Necesita una interfaz simple para ver conversaciones activas, intervenir manualmente, actualizar información de las áreas y revisar métricas sin depender de un desarrollador.

### Usuarios terciarios (fase 2+)
- Técnicos compradores recurrentes de repuestos e insumos
- Empresas o creadores que buscan alquilar los espacios de Servant
- Nuevos agentes del equipo que puedan sumarse al dashboard

---

## 4. Propuesta de Valor

> "Servant responde solo, las 24 horas. Leila solo interviene cuando importa."

- ✅ Un solo punto de entrada para 7 áreas de negocio distintas
- ✅ Respuestas instantáneas basadas en los manuales reales de Servant
- ✅ Derivación inteligente a humano solo cuando hay intención de compra o reserva
- ✅ Dashboard simple que cualquier persona del equipo puede operar sin ayuda técnica
- ✅ Identidad visual 100% alineada con la marca Servant (amarillo, azul oscuro, tipografía bold)

---

## 5. Funcionalidades

### MVP — Fase 1 ⭐

**Módulo 1: Agente Conversacional (Vista pública)**
- Pantalla de bienvenida con nombre, avatar y tagline de Servant
- Menú de áreas presentado como opciones seleccionables (botones o texto)
- Flujo independiente por área: cada área tiene su propio contexto y no se mezcla con las otras
- Respuestas generadas con IA basadas en los PDFs/manuales de cada área (ingestados en Supabase)
- Manejo de preguntas frecuentes por área
- Visualización de precios cuando corresponde
- Mensaje de derivación a humano cuando el cliente quiere cerrar una compra, turno o reserva
- Indicador de "Leila te va a atender en breve" con estado visible para el cliente
- Chat en tiempo real entre cliente y Leila (una vez derivado)
- Diseño responsivo: mobile first
- Identidad visual Servant: fondo azul/violeta oscuro, acentos amarillo `#FFD700`, tipografía bold

**Áreas incluidas en Fase 1:**
1. Reparar mi celu
2. Comprar un celu
3. Cursos presenciales
4. Cursos online
5. Máquinas y herramientas
6. Repuestos por mayor
7. Alquilar espacios

*Nota: David Yañez mencionó que puede haber hasta 3 áreas adicionales aún no definidas. Se reserva espacio en la arquitectura para agregarlas sin rediseño.*

**Módulo 2: Dashboard de Administración (Vista privada — Leila)**
- Login con usuario y contraseña (acceso restringido)
- Notificación en tiempo real cuando el agente deriva a un humano
- Vista de conversaciones activas y derivadas
- Chat en tiempo real con el cliente desde el dashboard
- Historial de conversaciones por área y por fecha
- Métricas básicas:
  - Total de consultas por día / semana / mes
  - Consultas por área
  - Cantidad de derivaciones a humano
  - Temas más consultados
- Editor de contenido por área: Leila puede actualizar la información de los manuales desde el panel, sin tocar código
- Gestión de áreas: activar/desactivar áreas del menú del agente

---

### Fase 2

- Registro opcional del cliente (nombre + email o teléfono) al inicio del chat para captura de leads
- Integración con WhatsApp (Opción B del presupuesto)
- Exportación de historial de conversaciones a CSV o Google Sheets
- Respuestas predefinidas rápidas para Leila (atajos de texto)
- Métricas avanzadas: tiempo promedio de respuesta, tasa de conversión por área

### Fase 3

- Agentes especializados por área (cada área tiene su propio modelo entrenado con su propio contexto)
- Sistema de turnos o reservas directo desde el chat (para Reparaciones y Alquiler de Espacios)
- Notificaciones por email o WhatsApp a Leila cuando hay derivaciones fuera del horario de atención
- Multi-agente: posibilidad de que más de una persona del equipo atienda desde el dashboard

---

## 6. Roadmap de Desarrollo

| Etapa | Nombre | Entregable | Tiempo estimado |
|-------|--------|------------|-----------------|
| 1 | Setup & Arquitectura | Repositorio, Supabase configurado, estructura de tablas, variables de entorno | Semana 1 |
| 2 | Ingesta de Manuales | PDFs de las 7 áreas procesados y vectorizados en Supabase | Semana 1 |
| 3 | Agente Conversacional (MVP) | Flujo funcional con menú, respuestas por área y derivación | Semana 2 |
| 4 | Chat en tiempo real | Sistema de mensajes cliente ↔ Leila con notificaciones | Semana 2–3 |
| 5 | Dashboard de Administración | Login, vistas de conversaciones, métricas básicas, editor de manuales | Semana 3 |
| 6 | UI / Identidad Servant | Diseño final con colores, tipografía y assets de marca aplicados | Semana 3–4 |
| 7 | QA & Ajustes | Pruebas funcionales, correcciones, revisión con David y Leila | Semana 4 |
| 8 | Deploy & Capacitación | Subida a Vercel, dominio configurado, sesión de onboarding con Leila | Semana 4 |

**Plazo total estimado: 30 días calendario desde el kick-off.**

---

## 7. Alcance y Entregables

### Entregables incluidos

- Agente conversacional web con IA desplegado en Vercel (`agenteservant.vercel.app` o dominio a definir)
- 7 flujos conversacionales configurados (uno por área de Servant)
- Ingesta y vectorización de los manuales de cada área
- Dashboard privado con login para Leila
- Sistema de chat en tiempo real entre cliente y operadora
- Notificaciones de derivación en el dashboard
- Métricas básicas de uso
- Editor de contenido para que Leila actualice la información sin código
- Sesión de capacitación para Leila (1 hora, remota)
- 15 días de soporte post-entrega para correcciones menores

### Fuera de alcance

- Diseño o rediseño de la web principal de Servant (servantacademy.com.ar)
- Integración con WhatsApp (corresponde a Opción B — presupuesto separado)
- Sistema de turnos o reservas online
- Pasarela de pagos o ecommerce
- Creación de los manuales de contenido (los provee Servant)
- Mantenimiento mensual continuo (se puede contratar aparte)
- Las 3 áreas adicionales mencionadas por David aún no definidas (*a confirmar — se pueden incorporar en Fase 2*)

### Condiciones de entrega

- Entrega funcional en entorno de producción (Vercel)
- 1 ronda de revisiones incluida antes de la entrega final
- Capacitación incluida para Leila
- Soporte post-entrega: 15 días para correcciones de bugs o ajustes menores

### Honorarios y forma de pago

- **Monto total:** USD 650 (Opción A — Agente Web)
- **Estructura de pago:** 50% al inicio del proyecto (USD 325) · 50% al finalizar (USD 325)
- **Moneda:** USD. Equivalente en ARS disponible al tipo de cambio del día de la transferencia.

---

## 8. Estrategia de Lanzamiento del Cliente

### Plan de onboarding

1. Kick-off con David y Leila (1 hora): revisión de manuales, definición de tono de cada área, confirmación de áreas activas
2. Semana 1–2: Brandon construye el agente y deriva avances por WhatsApp
3. Demo intermedia (semana 2): David y Leila prueban el agente en staging
4. Ajustes finales y deploy en producción (semana 4)
5. Sesión de capacitación para Leila: cómo operar el dashboard, actualizar manuales y revisar métricas

### Capacitación

- Sesión 1:1 remota con Leila al momento de la entrega (1 hora)
- Video-guía grabado del dashboard para consulta futura *[a confirmar si se incluye o es adicional]*
- Documentación básica de uso del panel (PDF o Notion)

### Hitos post-entrega

- Días 1–15: soporte activo de Brandon para correcciones y ajustes menores
- Día 30: revisión de métricas con David — evaluación de áreas más consultadas
- A partir del mes 2: posibilidad de contratar mantenimiento mensual o incorporar Fase 2

---

## 9. Competencia y Alternativas

| Alternativa | Por qué no alcanza |
|-------------|-------------------|
| Responder manualmente por WhatsApp/Instagram | No escala, Leila pierde tiempo en consultas repetitivas |
| Chatbot genérico (ManyChat, Tidio) | No tiene IA real, no entiende preguntas complejas, no maneja múltiples áreas con contexto separado |
| Contratar más personal de atención | Costo fijo alto, no resuelve el problema de filtrado y organización |
| Bot de WhatsApp Business sin IA | Respuestas rígidas, flujo limitado, no se adapta a preguntas libres |

La ventaja diferencial de este agente es que combina IA real (Claude) con los manuales propios de Servant, lo que le permite responder con el conocimiento exacto de la empresa — no respuestas genéricas.

---

## 10. Métricas Clave para Servant

### Producto
- Volumen de consultas diarias / semanales por área
- Porcentaje de consultas resueltas por el agente sin derivación humana
- Tiempo promedio de respuesta de Leila cuando se activa una derivación
- Áreas con mayor volumen de consultas (para priorizar contenido)

### Negocio
- Reducción del tiempo de atención manual de Leila
- Consultas convertidas en ventas, turnos o reservas (seguimiento post-lanzamiento)
- Áreas con mayor tasa de derivación (indica dónde puede mejorar el contenido del agente)

---

## 11. Stack Técnico

| Capa | Herramienta |
|------|------------|
| IA / LLM | Claude (Anthropic API) |
| Frontend | Lovable |
| Base de datos + vectores | Supabase (con pgvector para manuales) |
| Automatizaciones | n8n |
| Deploy | Vercel |
| Almacenamiento de PDFs | Supabase Storage |
| Auth (dashboard) | Supabase Auth |
| Tiempo real (chat) | Supabase Realtime |




---

*Documento generado como base para el desarrollo. Actualizar con cada iteración del proyecto.*