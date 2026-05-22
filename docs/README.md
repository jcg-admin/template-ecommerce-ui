# Documentacion de ecommerce-ui

Este directorio contiene la documentacion de arquitectura y gestion del
frontend e-commerce **ecommerce-ui** (React 19 + Redux Toolkit 2 +
Webpack 5), construida sobre una adaptacion pragmatica de arc42 mas un
modulo de project management (`pm/`) que sigue el procedimiento interno
**PROC-GESTION-001** para iniciativas.

> No se usan numeros en los nombres de carpetas. Cada carpeta lleva el
> nombre del cajon que contiene, en castellano, autodescriptivo.

## Indice

### Punto de entrada para adoptantes

| Documento | Que contiene |
|-----------|--------------|
| [como-adaptar-este-template](como-adaptar-este-template.md) | Guia de adopcion: que cambiar al adoptar, extensiones del dominio e-commerce que el template puede acomodar (B2B, marketplace, suscripciones, subastas, reservas, productos digitales, perecederos, restringidos, custom-made), que dejar como esta, que el template no resuelve (incluye contexto regulatorio), checklist de verificacion. **Leer primero al hacer fork del template.** |

### Documentacion de arquitectura

| Cajon | Que contiene |
|-------|--------------|
| [introduccion-y-objetivos](introduccion-y-objetivos/) | Que es el sistema, para quien, que requisitos esenciales cubre. |
| [restricciones-de-arquitectura](restricciones-de-arquitectura/) | Restricciones tecnicas, organizativas, convenciones del proyecto. |
| [contexto-y-alcance-del-sistema](contexto-y-alcance-del-sistema/) | Sistemas externos y usuarios con los que el UI interactua. |
| [estrategia-de-solucion](estrategia-de-solucion/) | Decisiones fundamentales de stack, separacion de responsabilidades. |
| [vista-de-bloques-de-construccion](vista-de-bloques-de-construccion/) | Estructura interna del codigo: capas, slices, hooks, paginas. |
| [vista-de-despliegue](vista-de-despliegue/) | Como se compila el bundle y donde corre en produccion. |
| [conceptos-transversales](conceptos-transversales/) | Patrones que cruzan modulos: auth, mocks, errores, estilos. |
| [decisiones-de-arquitectura](decisiones-de-arquitectura/) | Registro de decisiones tecnicas tomadas (ADR). |
| [riesgos-y-deuda-tecnica](riesgos-y-deuda-tecnica/) | Riesgos vivos y deuda conocida. |
| [glosario](glosario/) | Definiciones de terminos del dominio y de la arquitectura. |

### Gestion del proyecto

| Carpeta | Que contiene |
|---------|--------------|
| [pm/](pm/) | Project management. Iniciativas con alcance, analisis, tareas, progreso y decisiones segun PROC-GESTION-001. |

## Cajones arc42 que este proyecto no usa

| Cajon descartado | Razon |
|------------------|-------|
| Requisitos de calidad (NFRs) | El repo no tiene ANS/SLO declarados ni metricas de calidad medibles que documentar honestamente. Cuando existan se anadira como cajon propio. |
| Vista de tiempo de ejecucion | Los flujos en tiempo de ejecucion estan cubiertos por los casos de uso (UC-*) del repo backend `ecommerce-doc`. Duplicar aqui produce ruido. Si un flujo del UI no esta cubierto por un UC, se documenta puntual en `conceptos-transversales/`. |

## Convenciones de esta documentacion

- **Sin emojis, sin iconos.** Texto plano y tablas markdown.
- **Sin numeros en nombres de archivos ni carpetas.** Nombre autodescriptivo.
- **Diagramas en mermaid embebido.** GitHub los renderiza nativamente.
- **Slug autoexplicativo.** Cada archivo se entiende fuera de su carpeta.
- **Estado real, no aspiracional.** Si algo no esta hecho, se documenta como no hecho. No se inventan NFRs ni SLAs.
