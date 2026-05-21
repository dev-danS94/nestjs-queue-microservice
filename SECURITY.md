# Security Policy

## Supported Versions

Solo se da soporte de seguridad a la rama `main`. Forks o ramas históricas no reciben parches.

| Versión | Soporte |
|---------|---------|
| `main`  | ✅      |
| Otras   | ❌      |

## Reportar una vulnerabilidad

**No abras un issue público** para reportar vulnerabilidades.

Reportar de forma privada por una de estas vías:

1. **GitHub Security Advisories** (preferido): https://github.com/dev-danS94/nestjs-queue-microservice/security/advisories/new
2. **Email**: adan.franco@trocut.com

Incluye en el reporte:

- Descripción del problema y su impacto.
- Pasos para reproducir (PoC si es posible).
- Versión / commit afectado.
- Mitigaciones que conozcas.

## Tiempos de respuesta

- **Confirmación de recepción**: dentro de 72h hábiles.
- **Triage inicial**: 7 días.
- **Parche o mitigación**: depende de severidad (crítica < 14 días).

## Alcance

Vulnerabilidades dentro del scope:

- Inyección (SQL, NoSQL, comandos), XSS, SSRF, RCE.
- Bypass de validación de DTOs / autenticación / autorización.
- Exposición de credenciales o datos sensibles.
- Vulnerabilidades en dependencias directas no parcheadas.

Fuera de scope:

- Issues de configuración del despliegue del usuario final.
- Vulnerabilidades en dependencias transitivas ya reportadas en CVE públicos en curso.
- Ataques que requieren acceso físico al servidor.

## Buenas prácticas

- Nunca commitear `.env` ni archivos con credenciales reales (ver `.gitignore`).
- Usar `secrets` de GitHub Actions, no variables en claro.
- Rotar credenciales de Redis / MySQL periódicamente.
- Mantener dependencias actualizadas (Dependabot está activo).
