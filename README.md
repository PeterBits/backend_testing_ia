# 🏋️ Gym Backend API

Backend REST API para una aplicación de seguimiento de rutinas de gimnasio. Construido con Node.js, Express, Prisma y SQLite.

## 🚀 Características

- **Autenticación JWT** - Registro y login de usuarios
- **CRUD de Rutinas** - Crear, leer, actualizar y eliminar rutinas de gimnasio
- **Gestión de Ejercicios** - Cada rutina puede contener múltiples ejercicios
- **Seguridad** - Rate limiting, helmet, CORS, validación de entrada
- **Base de datos** - SQLite para desarrollo, fácil migración a PostgreSQL para producción
- **Validación** - express-validator para validación robusta de datos
- **Logs** - Morgan para logging de requests

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express.js
- **Base de datos**: SQLite (desarrollo) / PostgreSQL (producción)  
- **ORM**: Prisma
- **Autenticación**: JWT + bcryptjs
- **Validación**: express-validator
- **Seguridad**: helmet, cors, express-rate-limit
- **Logs**: morgan

## 📋 Requisitos Previos

- Node.js (v16+ o v18+)
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd gym-back
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y configura las variables:

```env
# Base de datos SQLite para desarrollo
DATABASE_URL="file:./dev.db"

# JWT Secret (usa una clave segura en producción)
JWT_SECRET="gym_backend_super_secret_key_2025_development_only"

# Configuración del servidor
PORT=4000
NODE_ENV=development
```

### 4. Ejecutar migraciones de base de datos
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Iniciar el servidor
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:4000`

## 📊 Esquema de Base de Datos

### Usuario (User)
- `id` - ID único
- `email` - Email único del usuario
- `password` - Contraseña hasheada
- `name` - Nombre opcional
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

### Rutina (Routine)
- `id` - ID único
- `title` - Título de la rutina
- `description` - Descripción opcional
- `userId` - ID del usuario propietario
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización

### Ejercicio (Exercise)
- `id` - ID único
- `name` - Nombre del ejercicio
- `sets` - Número de series
- `reps` - Número de repeticiones
- `rest` - Tiempo de descanso en segundos (opcional)
- `order` - Orden en la rutina (opcional)
- `routineId` - ID de la rutina

## 🔗 Endpoints de la API

### Autenticación

#### POST `/api/auth/register`
Registrar un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "name": "Nombre Usuario"
}
```

#### POST `/api/auth/login`
Iniciar sesión.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

#### GET `/api/auth/profile`
Obtener perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/api/auth/profile`
Actualizar perfil del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@example.com"
}
```

#### PUT `/api/auth/change-password`
Cambiar contraseña.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "contraseñaActual",
  "newPassword": "nuevaContraseña123"
}
```

### Rutinas

#### GET `/api/routines`
Obtener todas las rutinas del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET `/api/routines/:id`
Obtener una rutina específica.

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/api/routines`
Crear una nueva rutina.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Push Day",
  "description": "Rutina de empuje",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 4,
      "reps": 8,
      "rest": 90,
      "order": 1
    },
    {
      "name": "Shoulder Press",  
      "sets": 3,
      "reps": 10,
      "rest": 60,
      "order": 2
    }
  ]
}
```

#### PUT `/api/routines/:id`
Actualizar una rutina existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** (mismo formato que POST)

#### DELETE `/api/routines/:id`
Eliminar una rutina.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET `/api/routines/stats`
Obtener estadísticas de rutinas del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

## 🧪 Testing

### Probar con curl

#### Registro
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Crear rutina
```bash
curl -X POST http://localhost:4000/api/routines \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Push Day",
    "description": "Rutina de empuje",
    "exercises": [
      {
        "name": "Bench Press",
        "sets": 4,
        "reps": 8,
        "rest": 90
      }
    ]
  }'
```

### Ejecutar tests
```bash
npm test
```

## 🔒 Seguridad

- **Contraseñas hasheadas** con bcryptjs (12 rounds)
- **JWT tokens** para autenticación
- **Rate limiting** para prevenir ataques de fuerza bruta
- **Helmet** para headers de seguridad
- **CORS** configurado correctamente
- **Validación de entrada** con express-validator
- **Variables de entorno** para secretos

## 📁 Estructura del Proyecto

```
gym-back/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── dev.db
├── src/
│   ├── controllers/
│   │   ├── auth.js
│   │   └── routines.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── routines.js
│   ├── services/
│   │   └── database.js
│   ├── utils/
│   │   └── auth.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Despliegue en Producción

### Configuración para PostgreSQL

1. Actualizar `DATABASE_URL` en `.env`:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/gym_db"
```

2. Actualizar `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Ejecutar migraciones:
```bash
npx prisma migrate deploy
npx prisma generate
```

### Variables de entorno para producción
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="clave_super_segura_de_produccion"
PORT=4000
NODE_ENV=production
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

- `npm run dev` - Iniciar servidor en modo desarrollo (con nodemon)
- `npm start` - Iniciar servidor en modo producción
- `npm test` - Ejecutar tests
- `npm run test:watch` - Ejecutar tests en modo watch
- `npm run migrate` - Crear una nueva migración
- `npm run prisma:studio` - Abrir Prisma Studio
- `npm run prisma:generate` - Generar cliente de Prisma

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---

¡Listo para entrenar! 💪🏋️‍♂️
