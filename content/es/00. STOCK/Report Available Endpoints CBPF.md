---
title: Informe de endpoints disponibles CBPF
draft: false
created: 2025-08-11
modified: 2026-02-13
lang: es-ES
---
# Análisis de los endpoints disponibles de la API de CBPF

  

**Fecha de la investigación:** 19 de febrero de 2026

**Base de la API:** https://cbpfapi.unocha.org/vo1/odata

  

## Actualmente usados en el proyecto ✅

  

| Endpoint | Estado | Registros | Propósito |

|----------|--------|---------|---------|

| **ProjectSummary** | ✅ Usado | 16,305 | Proyectos aprobados/implementados (conjunto de datos principal) |

| **ProjectSummaryWithLocation** | ✅ Usado | Grande | Proyectos con datos geográficos |

| **PipelineProjectSummary** | ✅ Usado | 581 | Proyectos en revisión/rechazados |

| **PipelineProjectCluster** | ✅ Usado | Medio | Asignaciones de clúster para proyectos en tramitación |

| **Cluster** | ✅ Usado | Medio | Definiciones de clúster/sector |

| **Contribution** | ✅ Usado | Medio | Contribuciones de donantes a los fondos |

  

## Descargados pero NO usados 📁

  

| Endpoint | Estado | Registros | Uso potencial |

|----------|--------|---------|---------------|

| **AllocationFlow** | 📁 Descargado, no cargado | Desconocido | Flujos de financiación por tipo de socio a lo largo del tiempo |

  

## Disponibles pero NO descargados 🔍

  

### ✅ Endpoints FUNCIONALES (probados con éxito):

  

| Endpoint | Estado | Tamaño | Qué contiene |

|----------|--------|------|------------------|

| **Poolfund** | ✅ Funciona | 47 fondos | Metadatos del fondo (nombre, país, coordenadas, códigos) |

| **ProjectSummaryWithLocationAndCluster** | ✅ Funciona | Grande | Datos combinados de ubicación + clúster (no usados actualmente) |

  

### ❌ Endpoints NO FUNCIONALES (devuelven errores 404 o 500):

  

**Endpoints de alto valor (si funcionaran):**

- Budget - Desgloses presupuestarios detallados

- GmsProjectByYear - Proyectos agregados por año

- Location - Datos geográficos de referencia

- LogicalFramework - Marcos de resultados del proyecto

- LogicalFrameworkActivity - Actividades planificadas

- LogicalFrameworkIndicator - Indicadores de rendimiento

- LogicalFrameworkOutcome - Resultados esperados

- LogicalFrameworkOutput - Productos del proyecto

- NarrativeReportBeneficiary - Datos de beneficiarios de los informes

- NarrativeReportSummary - Informes narrativos

- PartnerDueDiligence - Estado de verificación/aprobación de socios

- PartnerCA - Evaluaciones de capacidad de asociación

- SubGrant - Información sobre subvenciones derivadas

- Workplan - Planes de trabajo del proyecto

  

**Endpoints financieros/de desembolso:**

- CostEffectiveAnalysis

- CostTracking

- DirectCosting

- DisbursementMilestone

- FinancialReportMilestone

- FinancialReportSection

- FinancialReportSummary

- FirstDisbursementMilestone

  

**Seguimiento de estado/proceso:**

- CBPFInstanceProcessLogs

- CBPFInstanceStatus

- CBPFPartnerScorecard

- CBPFProjectScorecard

- RevisionRequestMilestone

- SubmissionOfProposalMilestone

- TechnicalReviewMilestone

  

**Otros endpoints disponibles:**

- FocalPoint - Información de contacto

- NarrativeReportLogicalFramework

- NarrativeReportMilestone

- NarrativeReportMonitoring

- OtherBeneficiary

- OtherFunding

- OtherInfoOrganization

- Project - Entidad base del proyecto

- ProjectAllLocationsByActivity

- ProjectLocation

- ProjectLocationActivities

- ProjectLocationLevel

- SRP - Datos del Plan de Respuesta Estratégica

  

## Recomendaciones

  

### 🎯 Victorias rápidas - Añadir estos al informe:

  

1. **Poolfund** - Metadatos del fondo

- Descarga: ✅ Funciona (47 registros)

- Caso de uso: Mostrar detalles del fondo, coordenadas para mapas, códigos de país

- Esfuerzo: Muy bajo

  

2. **AllocationFlow** - ¡Ya descargado!

- Descarga: ✅ Ya lo tenemos

- Caso de uso: Mostrar flujos de financiación por tipo de socio a lo largo del tiempo

- Esfuerzo: Bajo - solo cargarlo en el informe

  

3. **ProjectSummaryWithLocationAndCluster** - Conjunto de datos combinado

- Descarga: ✅ Funciona (conjunto de datos grande)

- Caso de uso: Análisis más rico combinando ubicación + clúster

- Esfuerzo: Bajo - reemplaza archivos separados

  

### ⚠️ Actualmente averiados - No se pueden usar:

  

Casi todos los endpoints de informes detallados, seguimiento financiero y monitoreo devuelven errores 404 o 500. Pueden ser:

- Endpoints solo internos

- Endpoints obsoletos/eliminados

- Endpoints de acceso restringido

- Funcionalidades aún no implementadas

  

## Lista completa de endpoints (50 en total)

  

**Leyenda de estados:**

- ✅ Funcional y probado

- 📁 Descargado pero no cargado

- ❌ Devuelve error 404/500

- ⚠️ Usado en el proyecto

  

```

✅ ⚠️ Cluster

✅ ⚠️ Contribution

✅ ⚠️ PipelineProjectCluster

✅ ⚠️ PipelineProjectSummary

✅ ⚠️ ProjectSummary

✅ ⚠️ ProjectSummaryWithLocation

✅ Poolfund

✅ ProjectSummaryWithLocationAndCluster

📁 AllocationFlow (downloaded, not loaded)

❌ Budget

❌ CBPFInstanceProcessLogs

❌ CBPFInstanceStatus

❌ CBPFPartnerScorecard

❌ CBPFProjectScorecard

❌ CostEffectiveAnalysis

❌ CostTracking

❌ DirectCosting

❌ DisbursementMilestone

❌ FinancialReportMilestone

❌ FinancialReportSection

❌ FinancialReportSummary

❌ FirstDisbursementMilestone

❌ FocalPoint

❌ GmsProjectByYear

❌ Location

❌ LogicalFramework

❌ LogicalFrameworkActivity

❌ LogicalFrameworkIndicator

❌ LogicalFrameworkOutcome

❌ LogicalFrameworkOutput

❌ NarrativeReportBeneficiary

❌ NarrativeReportLogicalFramework

❌ NarrativeReportMilestone

❌ NarrativeReportMonitoring

❌ NarrativeReportSummary

❌ OtherBeneficiary

❌ OtherFunding

❌ OtherInfoOrganization

❌ PartnerCA

❌ PartnerDueDiligence

❌ Project

❌ ProjectAllLocationsByActivity

❌ ProjectLocation

❌ ProjectLocationActivities

❌ ProjectLocationLevel

❌ RevisionRequestMilestone

❌ SRP

❌ SubGrant

❌ SubmissionOfProposalMilestone

❌ TechnicalReviewMilestone

❌ Workplan

```

  

## Próximos pasos

  

### Acciones inmediatas:

1. ✅ **Cargar AllocationFlow** - Ya descargado, solo añadirlo al informe

2. ✅ **Descargar Poolfund** - Obtener metadatos del fondo (47 registros)

3. Considerar **ProjectSummaryWithLocationAndCluster** - Puede simplificar el enfoque actual de múltiples archivos

  

### Exploración futura:

- Monitorear la API de CBPF en busca de nuevos endpoints o funcionalidad restaurada

- Comprobar si la autenticación habilita el acceso a endpoints restringidos

- Contactar con el equipo de CBPF de OCHA sobre los endpoints averiados

  

## Comandos de prueba

  

```bash

# Test any endpoint

curl -s "https://cbpfapi.unocha.org/vo1/odata/ENDPOINT_NAME?\$format=csv&\$top=5"

# Check endpoint size

curl -s "https://cbpfapi.unocha.org/vo1/odata/ENDPOINT_NAME?\$format=csv" | wc -l

# Get full metadata

curl -s "https://cbpfapi.unocha.org/vo1/odata/\$metadata" | grep -A 20 "EntityType.*ENDPOINT"

# List all endpoints

curl -s "https://cbpfapi.unocha.org/vo1/odata/" | grep -o '<collection href="[^"]*"'

```
