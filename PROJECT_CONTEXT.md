# 📋 Contexto del Proyecto: Gym Backend API

> **IMPORTANTE PARA COPILOT**: Este documento sirve como contexto completo del proyecto. **SIEMPRE que realices cambios, adiciones o mejoras al proyecto, DEBES actualizar este documento** añadiendo la información en la sección correspondiente con fecha y descripción detallada.

## 📖 Descripción del Proyecto

**Gym Backend API** es una aplicación backend REST desarrollada en Node.js para el seguimiento y gestión de rutinas de gimnasio. Permite a los usuarios registrarse, autenticarse y gestionar sus rutinas de ejercicio de forma segura y eficiente.

### 🎯 Objetivo Principal
Proporcionar una API robusta y segura que permita a las aplicaciones frontend gestionar usuarios y sus rutinas de gimnasio, con autenticación JWT, validaciones completas y operaciones CRUD.

### 🏗️ Arquitectura
- **Patrón**: REST API con arquitectura MVC
- **Base de datos**: SQLite (desarrollo) con migración fácil a PostgreSQL (producción)
- **Autenticación**: JWT (JSON Web Tokens) con bcryptjs
- **ORM**: Prisma para gestión de base de datos
- **Validación**: express-validator para validación de entrada
- **Seguridad**: helmet, CORS, rate limiting

## 🛠️ Stack Tecnológico

### Backend Core
- **Node.js** (v16+): Runtime de JavaScript
- **Express.js**: Framework web minimalista
- **Prisma**: ORM moderno para base de datos
- **SQLite**: Base de datos para desarrollo

### Autenticación y Seguridad
- **jsonwebtoken**: Generación y verificación de JWT
- **bcryptjs**: Hash de contraseñas
- **helmet**: Headers de seguridad
- **cors**: Control de acceso entre dominios
- **express-rate-limit**: Rate limiting para prevenir ataques

### Validación y Middleware
- **express-validator**: Validación de entrada de datos
- **morgan**: Logging de requests HTTP
- **dotenv**: Gestión de variables de entorno

### Testing y Desarrollo
- **jest**: Framework de testing
- **supertest**: Testing de APIs HTTP
- **nodemon**: Recarga automática en desarrollo

## 📊 Modelo de Datos

### Usuario (User)
```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String    // Hashed con bcryptjs
  name      String?
  routines  Routine[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

### Rutina (Routine)
```prisma
model Routine {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      Int
  exercises   Exercise[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Ejercicio (Exercise)
```prisma
model Exercise {
  id        Int     @id @default(autoincrement())
  name      String
  sets      Int
  reps      Int
  rest      Int?    // Tiempo de descanso en segundos
  order     Int?    // Orden en la rutina
  routine   Routine @relation(fields: [routineId], references: [id], onDelete: Cascade)
  routineId Int
}
```

## 🔗 API Endpoints Implementados

### Autenticación (`/api/auth`)
- **POST** `/register` - Registro de nuevo usuario
- **POST** `/login` - Autenticación de usuario
- **GET** `/profile` - Obtener perfil del usuario autenticado
- **PUT** `/profile` - Actualizar perfil del usuario
- **PUT** `/change-password` - Cambiar contraseña del usuario

### Rutinas (`/api/routines`)
- **GET** `/` - Obtener todas las rutinas del usuario
- **POST** `/` - Crear nueva rutina con ejercicios
- **GET** `/:id` - Obtener rutina específica por ID
- **PUT** `/:id` - Actualizar rutina existente
- **DELETE** `/:id` - Eliminar rutina
- **GET** `/stats` - Obtener estadísticas de rutinas del usuario

### Utilidad
- **GET** `/` - Health check de la API

## 📁 Estructura del Proyecto

```
gym-back/
├── .github/
│   └── copilot-instructions.md      # Instrucciones para Copilot
├── prisma/
│   ├── schema.prisma               # Esquema de base de datos
│   ├── migrations/                 # Migraciones de BD
│   └── dev.db                     # Base de datos SQLite
├── src/
│   ├── controllers/
│   │   ├── auth.js                # Controlador de autenticación
│   │   └── routines.js            # Controlador de rutinas
│   ├── middlewares/
│   │   └── auth.js                # Middleware de autenticación JWT
│   ├── routes/
│   │   ├── auth.js                # Rutas de autenticación
│   │   └── routines.js            # Rutas de rutinas
│   ├── services/
│   │   └── database.js            # Servicio de conexión a BD
│   ├── utils/
│   │   └── auth.js                # Utilidades de autenticación
│   └── server.js                  # Servidor principal Express
├── tests/
│   ├── api.test.js                # Tests de integración
│   └── setup.js                   # Configuración de tests
├── .env                           # Variables de entorno
├── .gitignore                     # Archivos ignorados por Git
├── package.json                   # Dependencias y scripts
├── README.md                      # Documentación principal
├── test-api.js                    # Script de prueba manual
└── PROJECT_CONTEXT.md             # Este archivo de contexto
```

## 🔐 Características de Seguridad Implementadas

### Autenticación
- **Contraseñas hasheadas** con bcryptjs (12 rounds)
- **JWT tokens** con expiración de 7 días
- **Verificación de tokens** en rutas protegidas
- **Validación de fortaleza** de contraseñas

### Protección de API
- **Rate limiting** general (100 req/15min) y específico para auth (5 req/15min)
- **CORS** configurado para dominios específicos
- **Helmet** para headers de seguridad
- **Validación de entrada** en todos los endpoints
- **Sanitización** de datos de entrada

### Base de Datos
- **Consultas parametrizadas** através de Prisma
- **Relaciones con CASCADE DELETE** para integridad
- **Selección específica** de campos para minimizar exposición

## ✅ Funcionalidades Ya Implementadas

### ✅ Completado (Fecha: 23 de Septiembre, 2025)

#### Sistema de Autenticación
- [x] Registro de usuarios con validación
- [x] Login con JWT
- [x] Middleware de autenticación
- [x] Gestión de perfil de usuario
- [x] Cambio de contraseña
- [x] Validación de fortaleza de contraseñas

#### Gestión de Rutinas
- [x] CRUD completo de rutinas
- [x] Asociación de ejercicios a rutinas
- [x] Validación de datos de rutinas y ejercicios
- [x] Estadísticas de usuario
- [x] Filtrado por usuario autenticado

#### Infraestructura
- [x] Servidor Express configurado
- [x] Base de datos SQLite con Prisma
- [x] Migraciones de base de datos
- [x] Variables de entorno
- [x] Logging con Morgan
- [x] Manejo global de errores

#### Testing y Documentación
- [x] Tests unitarios e integración con Jest
- [x] Script de prueba manual
- [x] Documentación completa en README
- [x] Instrucciones específicas para Copilot

#### Seguridad y Validación
- [x] Rate limiting implementado
- [x] CORS configurado
- [x] Headers de seguridad con Helmet
- [x] Validaciones con express-validator
- [x] Sanitización de datos

## 🚧 Trabajo Futuro / Mejoras Pendientes

### 🔄 Por Implementar
- [ ] Recuperación de contraseña por email
- [ ] Refresh tokens para JWT
- [ ] Paginación en listado de rutinas
- [ ] Filtros y búsqueda en rutinas
- [ ] Exportación de rutinas (JSON/PDF)
- [ ] Sistema de categorías para rutinas
- [ ] Compartir rutinas entre usuarios
- [ ] Historial de entrenamientos
- [ ] Métricas y progreso de usuario
- [ ] Notificaciones push
- [ ] API versioning (`/api/v1/`)
- [ ] Migración a PostgreSQL para producción
- [ ] Containerización con Docker
- [ ] CI/CD pipeline
- [ ] Documentación con Swagger/OpenAPI

## 📝 Variables de Entorno

```env
# Base de datos
DATABASE_URL="direccion_url"

# Autenticación
JWT_SECRET="clave_super_secreta"

# Servidor
PORT=numero_puerto
NODE_ENV=entorno
```

## 🧪 Testing

### Ejecutar Tests
```bash
npm test                 # Ejecutar todos los tests
npm run test:watch       # Tests en modo watch
```

### Prueba Manual
```bash
node test-api.js         # Script de prueba completa
```

## 🚀 Scripts Disponibles

```json
{
  "dev": "nodemon src/server.js",           // Desarrollo
  "start": "node src/server.js",            // Producción
  "test": "jest",                           // Tests
  "test:watch": "jest --watch",             // Tests en watch
  "migrate": "npx prisma migrate dev --name", // Nueva migración
  "prisma:studio": "npx prisma studio",    // UI de base de datos
  "prisma:generate": "npx prisma generate" // Generar cliente
}
```

## 🔄 Registro de Cambios

> **INSTRUCCIÓN PARA COPILOT**: Cada vez que realices cambios, añade una entrada aquí con el formato:

### [Fecha] - [Tipo de Cambio]
- **Descripción**: [Descripción detallada del cambio]
- **Archivos modificados**: [Lista de archivos]
- **Razón**: [Por qué se hizo el cambio]
- **Impacto**: [Cómo afecta al proyecto]

---

### 23/09/2025 - Implementación Inicial Completa
- **Descripción**: Creación completa del backend de gimnasio desde cero
- **Archivos creados**: 
  - Estructura completa del proyecto
  - Todos los controladores, rutas, middlewares
  - Base de datos con Prisma
  - Tests y documentación
- **Razón**: Implementar un backend REST completo para gestión de rutinas de gimnasio
- **Impacto**: Backend funcional y listo para producción con todas las características básicas

---

## 🎯 Estado Actual del Proyecto

**Estado**: ✅ **COMPLETAMENTE FUNCIONAL**

- ✅ Servidor ejecutándose en puerto 4000
- ✅ Base de datos SQLite operativa
- ✅ Todos los endpoints funcionando
- ✅ Autenticación JWT implementada
- ✅ Validaciones y seguridad en su lugar
- ✅ Tests básicos pasando
- ✅ Documentación completa

El proyecto está **listo para uso** y puede ser extendido con las funcionalidades adicionales listadas en la sección "Por Implementar".

---

## 📞 Información de Contacto y Mantenimiento

- **Autor**: Pedro
- **Última actualización**: 23 de Septiembre, 2025
- **Versión**: 1.0.0
- **Estado**: Activo

---

> 🤖 **RECORDATORIO PARA COPILOT**: Este documento es la **fuente de verdad** del proyecto. Actualízalo siempre que hagas cambios y manténlo sincronizado con el estado real del código.
