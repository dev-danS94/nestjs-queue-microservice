# Queue Service

Microservicio de colas construido con **NestJS + BullMQ + Redis**. Gestiona el procesamiento asíncrono de jobs y transiciones de estado entre entidades, desacoplando tareas pesadas o programadas del flujo principal de la aplicación.

## ¿Qué hace?

- Recibe jobs vía HTTP desde otros servicios (backend principal, APIs externas, etc.).
- Encola y procesa los jobs en segundo plano con reintentos automáticos y backoff configurable.
- Coordina cambios de estado entre entidades (programar, activar, cancelar, expirar, etc.).
- Persiste el estado de los jobs procesados en MySQL y conserva trazabilidad en Redis.

Pensado para integrarse con cualquier backend HTTP que necesite delegar trabajo asíncrono o tareas programadas.

## Stack

- **Runtime**: Node.js + NestJS 11
- **Lenguaje**: TypeScript
- **Cola**: BullMQ + ioredis
- **ORM**: TypeORM + MySQL
- **Validación**: class-validator + class-transformer
- **Testing**: Jest + Supertest

## Arquitectura

```
Cliente HTTP (otro servicio)
        │
        │ POST /endpoint  (encolar job)
        ▼
   Queue Service ──── Redis (broker)
        │
        ▼
      MySQL  (estado persistente)
```

- **Cliente HTTP**: cualquier servicio que necesite delegar trabajo asíncrono.
- **Queue Service** (este repo): valida payload, encola job, procesa en background.
- **Redis**: broker BullMQ.
- **MySQL**: estado persistente de entidades y jobs procesados.

## Estructura de carpetas

```
src/
├── main.ts                # Bootstrap
├── app.module.ts          # Módulo raíz
├── app.controller.ts      # Health check
├── app.service.ts
├── dto/                   # DTOs compartidos
└── <dominio>/             # Un módulo por dominio
    ├── <dominio>.module.ts
    ├── <dominio>.controller.ts        # Endpoints HTTP
    ├── <dominio>-scheduling.service.ts # Lógica + encolamiento
    ├── <dominio>.processor.ts          # @Processor BullMQ
    └── entities/                       # TypeORM entities
```

Cada nuevo dominio replica esta estructura bajo `src/<dominio>/`.

## Setup

```bash
npm install
cp .env.example .env   # rellenar credenciales locales
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto HTTP del servicio (default 3000) |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Conexión al broker BullMQ |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | Conexión MySQL |
| `BACKEND_URL` | URL del servicio cliente para callbacks HTTP |

Ver `.env.example` para la lista completa.

## Comandos

```bash
npm run start:dev    # Modo watch (desarrollo)
npm run start        # Modo normal
npm run start:prod   # Producción (requiere build previo)
npm run build        # Compila TypeScript a dist/
npm run lint         # ESLint con auto-fix
npm run test         # Suite Jest
```

## Docker

```bash
docker-compose up -d   # Levanta el servicio
```

El `docker-compose.yml` espera las variables de entorno definidas en `.env`.

## Convenciones

- **Controllers**: reciben request, validan con pipes, delegan al service. Sin lógica de negocio.
- **Services**: lógica de negocio y orquestación de colas. `@Injectable()`.
- **Processors**: `@Processor('cola')` extendiendo `WorkerHost`. Re-lanzar errores siempre (BullMQ gestiona reintentos).
- **DTOs**: decoradores `class-validator` obligatorios. Nunca `any`.
- **Entidades**: tablas en `snake_case` plural, incluir `@CreateDateColumn` y `@UpdateDateColumn`.
- **Colas**: nombres en `kebab-case`. Configurar `removeOnComplete`/`removeOnFail` siempre.

## Licencia

MIT
