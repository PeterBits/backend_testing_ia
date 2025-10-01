# 🏋️ Gym App - Features TODO List

Este documento contiene todas las posibles features que se han discutido para la aplicación de gym tracking.

## ✅ Completadas

### Historial de Progreso
- [x] Modelo de base de datos para WorkoutSession y SessionExercise
- [x] API endpoints para crear/leer/actualizar/eliminar sesiones de entrenamiento
- [x] Tracking de peso/reps/series por ejercicio a lo largo del tiempo
- [x] Estadísticas de progreso (max weight, max reps, promedios)
- [x] Filtros por fecha, rutina, estado de completitud
- [x] Sesiones en progreso vs completadas
- [x] Link opcional a rutina
- [x] Notas por sesión y por ejercicio
- [x] Tests completos (controller + validation)
- [x] Documentación actualizada

---

## 📊 Seguimiento y Analytics

### Gráficos de Evolución
- [ ] Endpoint para obtener datos históricos formateados para gráficos
- [ ] Tracking de evolución de peso corporal con gráfico de tendencia
- [ ] Gráficos de progreso por ejercicio (peso/reps en el tiempo)
- [ ] Visualización de volumen total de entrenamiento (sets × reps × weight)
- [ ] Comparativas semana/mes/año

### Personal Records (PRs)
- [ ] Sistema para detectar y registrar récords personales automáticamente
- [ ] Endpoint para obtener PRs por ejercicio
- [ ] Notificación/flag cuando se logra un nuevo PR
- [ ] Historial de PRs con fechas
- [ ] PRs por categoría: 1RM, max reps, max volumen

### Calendario de Entrenamientos
- [ ] Vista de calendario con sesiones completadas
- [ ] Indicadores visuales de días entrenados vs días descansados
- [ ] Racha de días consecutivos entrenando
- [ ] Planning de entrenamientos futuros
- [ ] Recordatorios para días programados

---

## 💪 Funcionalidad de Entrenamiento

### Templates de Rutinas
- [ ] Biblioteca de rutinas predefinidas (push/pull/legs, full body, etc.)
- [ ] Sistema de tags/categorías para rutinas (fuerza, hipertrofia, cardio)
- [ ] Duplicar rutinas existentes como template
- [ ] Compartir templates entre usuarios
- [ ] Rating y comentarios en templates públicos

### Rest Timer
- [ ] Timer integrado para descansos entre series
- [ ] Configuración de tiempo por defecto por ejercicio
- [ ] Notificaciones al finalizar descanso
- [ ] Historial de tiempos de descanso reales
- [ ] Auto-start timer al completar serie

### Sustitución de Ejercicios
- [ ] Sistema de ejercicios alternativos por grupo muscular
- [ ] Sugerencias de sustitución basadas en equipamiento disponible
- [ ] Nivel de dificultad similar
- [ ] Mantener progresión al sustituir ejercicio

### Warm-up/Cool-down
- [ ] Secciones separadas en rutinas para calentamiento
- [ ] Secciones para enfriamiento/estiramiento
- [ ] Templates de warm-up por grupo muscular
- [ ] Tracking opcional de estas secciones

---

## 🎯 Social y Motivación

### Feed de Actividad
- [ ] Feed para ver entrenamientos de otros usuarios (con privacidad configurable)
- [ ] Sistema de seguimiento (follow/unfollow)
- [ ] Reacciones/likes a entrenamientos
- [ ] Comentarios en sesiones públicas
- [ ] Configuración de privacidad (público/privado/solo seguidores)

### Sistema de Logros/Badges
- [ ] Badges por hitos alcanzados (primera sesión, 10 sesiones, 100 sesiones, etc.)
- [ ] Logros por racha de días consecutivos
- [ ] Logros por PRs alcanzados
- [ ] Logros por volumen total acumulado
- [ ] Sistema de puntos/experiencia
- [ ] Niveles de usuario basados en actividad

### Comentarios Trainer-Atleta
- [ ] Sistema de mensajería/chat entre trainer y atleta
- [ ] Comentarios del trainer en rutinas asignadas
- [ ] Feedback del atleta post-entrenamiento
- [ ] Notificaciones de mensajes nuevos
- [ ] Adjuntar media (fotos/videos) en mensajes

### Compartir Rutinas
- [ ] Exportar rutina a formato JSON/PDF
- [ ] Importar rutina desde archivo
- [ ] Generar link para compartir rutina
- [ ] QR code para compartir rutina
- [ ] Marketplace de rutinas públicas

---

## 📅 Planificación Avanzada

### Periodización
- [ ] Sistema de mesociclos (4-12 semanas)
- [ ] Fases de entrenamiento (fuerza, hipertrofia, deload, etc.)
- [ ] Progresión automática de peso/volumen por semana
- [ ] Calendario de periodización
- [ ] Plantillas de periodización predefinidas

### Auto-regulación
- [ ] Sistema RPE (Rate of Perceived Exertion) por serie
- [ ] Ajuste automático de pesos basado en RPE
- [ ] RIR (Reps in Reserve) tracking
- [ ] Recomendaciones de ajuste de intensidad
- [ ] Historial de RPE por ejercicio

### Rutinas Recurrentes
- [ ] Programar rutinas para días específicos (Lunes: Push, Miércoles: Pull, etc.)
- [ ] Repetición semanal/mensual
- [ ] Rotación automática de rutinas (A/B, A/B/C splits)
- [ ] Notificaciones de rutina programada
- [ ] Vista de calendario con rutinas asignadas

### Plantillas de Mesociclos
- [ ] Templates de ciclos completos de 4-16 semanas
- [ ] Progresión predefinida por semana
- [ ] Mesociclos por objetivo (fuerza, hipertrofia, pérdida grasa)
- [ ] Duplicar y modificar mesociclos existentes
- [ ] Tracking de progreso del mesociclo actual

---

## 🍎 Nutrición y Salud

### Tracking de Macros
- [ ] Registro básico de calorías diarias
- [ ] Tracking de proteína/carbohidratos/grasas
- [ ] Objetivos de macros personalizados
- [ ] Gráficos de adherencia nutricional
- [ ] Relación con días de entrenamiento

### Registro de Peso Corporal
- [ ] Pesajes regulares con historial
- [ ] Gráfico de tendencia de peso
- [ ] Promedio móvil para reducir fluctuaciones
- [ ] Objetivos de peso (ganancia/pérdida/mantenimiento)
- [ ] Tasa de cambio semanal/mensual

### Recordatorios de Hidratación
- [ ] Sistema de recordatorios para beber agua
- [ ] Tracking de vasos/litros de agua diarios
- [ ] Objetivo de hidratación personalizado
- [ ] Recordatorios más frecuentes en días de entrenamiento
- [ ] Estadísticas de adherencia

### Integración con Métricas
- [ ] Correlación entre nutrición y rendimiento
- [ ] Análisis de impacto de déficit/superávit calórico
- [ ] Relación peso corporal vs fuerza
- [ ] Dashboards de salud integral
- [ ] Exportar datos para análisis externo

---

## 👨‍🏫 Experiencia del Trainer

### Dashboard de Atletas
- [ ] Vista consolidada de todos los atletas
- [ ] Métricas de progreso de cada atleta
- [ ] Alertas de inactividad de atletas
- [ ] Comparativas entre atletas
- [ ] Filtros por objetivo/nivel

### Plantillas de Mensajes
- [ ] Respuestas rápidas predefinidas
- [ ] Templates de feedback común
- [ ] Mensajes masivos a grupo de atletas
- [ ] Personalización con variables (nombre, objetivo, etc.)

### Bulk Assignment
- [ ] Asignar una rutina a múltiples atletas a la vez
- [ ] Asignación por grupo/nivel
- [ ] Modificaciones individuales post-asignación
- [ ] Historial de asignaciones

### Compliance Tracking
- [ ] Dashboard de adherencia de atletas
- [ ] % de rutinas completadas vs asignadas
- [ ] Alertas de baja adherencia
- [ ] Reportes de progreso automáticos
- [ ] Métricas de engagement por atleta

---

## 🔧 Mejoras Técnicas y UX

### Sistema de Búsqueda
- [ ] Búsqueda avanzada de ejercicios por nombre, grupo muscular, equipamiento
- [ ] Búsqueda de rutinas propias y públicas
- [ ] Filtros combinados
- [ ] Historial de búsquedas

### Modo Offline
- [ ] Sincronización de datos cuando hay conexión
- [ ] Modo offline para entrenamientos
- [ ] Cache de rutinas favoritas
- [ ] Indicador de estado de sincronización

### Exportar Datos
- [ ] Exportar historial completo a CSV/Excel
- [ ] Exportar rutinas a PDF
- [ ] Backup completo de datos
- [ ] GDPR compliance - portabilidad de datos

### Notificaciones Push
- [ ] Recordatorios de entrenamientos programados
- [ ] Notificaciones de PRs alcanzados
- [ ] Mensajes del trainer
- [ ] Logros desbloqueados
- [ ] Configuración granular de notificaciones

### Integración con Wearables
- [ ] Importar datos de Apple Watch
- [ ] Integración con Fitbit
- [ ] Sync con Google Fit
- [ ] Datos de frecuencia cardíaca durante entrenamientos

### Modo Oscuro
- [ ] Theme oscuro en frontend
- [ ] Preferencia guardada en perfil de usuario
- [ ] Auto-switch según hora del día

---

## 📈 Analytics Avanzados

### Dashboards Personalizados
- [ ] Widgets configurables
- [ ] Múltiples dashboards por usuario
- [ ] Exportar dashboard a imagen/PDF
- [ ] Templates de dashboards por objetivo

### Predicciones y Recomendaciones
- [ ] ML para predecir 1RM basado en historial
- [ ] Sugerencias de ejercicios según debilidades
- [ ] Recomendaciones de descanso según volumen
- [ ] Predicción de fatiga acumulada

### Análisis de Volumen
- [ ] Tracking de volumen semanal/mensual por grupo muscular
- [ ] Comparación con rangos óptimos
- [ ] Alertas de sobreentrenamiento
- [ ] Balance entre grupos musculares

---

## 🔐 Administración y Seguridad

### Roles Adicionales
- [ ] Rol ADMIN con permisos completos
- [ ] Rol GYM_OWNER para gestión de gym
- [ ] Permisos granulares por feature

### Gestión de Gimnasio
- [ ] Sistema multi-gimnasio
- [ ] Gestión de membresías
- [ ] Check-in de usuarios al gym
- [ ] Ocupación en tiempo real

### Audit Logs
- [ ] Registro de acciones importantes
- [ ] Logs de cambios en datos sensibles
- [ ] Tracking de accesos
- [ ] Reportes de auditoría

---

## 📱 Frontend (Sugerencias)

### Apps Móviles Nativas
- [ ] App iOS nativa (Swift/SwiftUI)
- [ ] App Android nativa (Kotlin)
- [ ] React Native app multiplataforma

### Progressive Web App (PWA)
- [ ] Convertir frontend en PWA
- [ ] Instalable desde navegador
- [ ] Funcionalidad offline
- [ ] Push notifications

### Desktop App
- [ ] App Electron para Windows/Mac/Linux
- [ ] Accesos rápidos de teclado
- [ ] Sincronización con versión web/móvil

---

## 🎯 Prioridades Sugeridas

### Alta Prioridad (Q1 2025)
1. Templates de rutinas predefinidas
2. Gráficos de evolución de progreso
3. Sistema de PRs automático
4. Rest timer integrado
5. Calendario de entrenamientos

### Media Prioridad (Q2 2025)
1. Sistema de logros/badges
2. Tracking básico de nutrición
3. Dashboard mejorado para trainers
4. Rutinas recurrentes/programadas
5. Sustitución de ejercicios

### Baja Prioridad (Q3-Q4 2025)
1. Features sociales (feed, seguimiento)
2. Periodización avanzada
3. Integración con wearables
4. Marketplace de rutinas
5. ML/predicciones

---

## 📝 Notas

- Este documento es una guía viva y debe actualizarse conforme se completen features
- Las prioridades pueden ajustarse según feedback de usuarios
- Cada feature debe incluir tests completos antes de considerarse terminada
- Mantener documentación actualizada en CLAUDE.md para cada feature nueva

---

**Última actualización:** 2025-01-10
**Features completadas:** 1/50+ (2%)
**Próxima feature sugerida:** Templates de rutinas predefinidas
