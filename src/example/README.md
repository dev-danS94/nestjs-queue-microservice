# Módulo `example`

Implementación de referencia de un dominio completo en este servicio. Copia esta carpeta como plantilla para crear nuevos módulos.

## Qué muestra

- **Controller** (`example.controller.ts`): endpoints HTTP, validación con DTO, delega al service.
- **Service** (`example.service.ts`): persiste entidad, encola job en BullMQ, expone helpers de estado.
- **Processor** (`example.processor.ts`): consume jobs de la cola, ejecuta lógica, actualiza estado, re-lanza errores.
- **Entity** (`entities/example.entity.ts`): tabla `examples` con `status` + timestamps.
- **DTO** (`dto/create-example.dto.ts`): validación de entrada con `class-validator`.
- **Interface** (`interfaces/example-job.interface.ts`): payload tipado del job.

## Flujo

```
POST /example
   │
   ▼
ExampleController.schedule(dto)
   │
   ▼
ExampleService.schedule(dto)
   ├── exampleRepo.save(...)        → MySQL  (status: pending)
   └── exampleQueue.add('process-example', ...)
                  │
                  ▼
       ExampleProcessor.process(job)
           ├── markStatus(processing)
           ├── lógica de negocio
           └── markStatus(completed)
```

## Reintentos

```typescript
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },  // 2s, 4s, 8s
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
}
```

Ajustar según criticidad. Ver `.claude/rules/queue-patterns.md` para la tabla completa.

## Errores

- **Recuperables** (timeout, 5xx, Redis caído) → `throw new Error(...)`. BullMQ reintenta.
- **No recuperables** (payload inválido, recurso inexistente) → `throw new UnrecoverableError(...)`. Va directo a `failed` sin reintentos.
- **Nunca** `throw new HttpException` desde un processor — BullMQ no lo entiende.

## Crear un nuevo módulo

1. `cp -R src/example src/<nuevo-dominio>` y renombrar archivos/clases.
2. Cambiar el nombre de cola (`'example'` → `'<nuevo-dominio>'`) en `@Processor` y `BullModule.registerQueue`.
3. Cambiar el nombre de tabla en `@Entity('...')`.
4. Registrar el módulo en `src/app.module.ts`.
