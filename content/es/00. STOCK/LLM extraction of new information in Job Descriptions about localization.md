---
title: Extracción con LLM de nueva información sobre localización en descripciones de empleo
tags:
  - AI
  - DataAnalysis
created: 2025-11-30
modified: 2026-02-01
lang: es-ES
---
Las descripciones de empleo a menudo contienen datos vitales enterrados en densos párrafos de texto: información como los requisitos de los donantes, las restricciones de nacionalidad o los tipos de contrato. Para mi proyecto sobre el [[content/00. STOCK/Humanitarian Sector Employment Dashboard|Panel de Empleo del Sector Humanitario]] creé un **flujo de trabajo en n8n** diseñado para leer, analizar y estructurar automáticamente estos datos mediante grandes modelos de lenguaje (LLM).

### **Qué hace este flujo de trabajo**

El flujo de trabajo **Relief Jobs Analysis** actúa como un analista de datos autónomo. Se activa según una programación, identifica las ofertas de empleo que aún no han sido analizadas y envía sus descripciones a un modelo de IA.

La IA convierte el texto markdown no estructurado en un objeto JSON limpio que contiene metadatos específicos (como si un empleo es "basado en proyecto" o restringido a "solo personal nacional"). Finalmente, el flujo de trabajo guarda estos datos enriquecidos de vuelta en una base de datos PostgreSQL, probablemente para alimentar un panel o un filtro de búsqueda.

### **Cómo funciona: la arquitectura en 3 pasos**

El flujo de trabajo opera en un bucle lineal que consta de ingesta, análisis y almacenamiento.

#### **1. Ingesta inteligente (la programación y SQL)**

El proceso comienza con un **Schedule Trigger** que se ejecuta cada 3 horas. En lugar de tomar todos los empleos de la base de datos, el flujo de trabajo utiliza una consulta SQL inteligente para garantizar la eficiencia.

Se conecta a una base de datos Postgres y selecciona únicamente los empleos (`job_id` y `body_markdown`) que existen en la tabla `jobs` pero que **aún no** existen en la tabla `job_llm_extractions`. Esta "comprobación de diferencias" evita que la IA vuelva a analizar el mismo empleo dos veces, ahorrando costes de API y tiempo de procesamiento.

#### **2. El analista de IA (LangChain y OpenAI)**

La inteligencia central reside en el nodo **Information Extractor**, impulsado por un **OpenAI Chat Model** (concretamente `gpt-4.1-mini`, tal como está configurado).

El flujo de trabajo alimenta el texto de la descripción del empleo a la IA con un prompt de sistema específico: _"Eres un asistente de extracción de datos altamente inteligente y preciso, especializado en analizar descripciones de empleo de los sectores humanitario y de desarrollo"_.

Se instruye a la IA para que devuelva un esquema JSON estricto que contiene los siguientes datos:

- **Donantes:** extrae entidades específicas como USAID o ECHO.
    
- **Nacionalización:** determina si el puesto es solo para personal nacional local y aporta el razonamiento.
    
- **Lógica de contrato:** identifica si el puesto es basado en proyecto o de forma continua.
    
- **Seniority:** infiere el nivel (p. ej., "Managerial") en función de los años de experiencia requeridos.
    
- **Idiomas:** separa los idiomas en "Obligatorios" frente a "Preferidos".
    

```json
{
  "is_nationalized": {
    "value": true,
    "reasoning": "The text states 'This position is open to Ukrainian nationals only.'"
  },
  "is_project_based": {
    "value": true,
    "reasoning": "The contract is described as 'Fixed-term, 12 months (dependent on funding)'."
  },
  "mentioned_donors": ["USAID", "ECHO"],
  "keywords": ["WASH", "Program Manager", "Humanitarian", "Project Management", "Team Leadership", "Reporting", "M&E", "Budget Oversight"],
  "is_rolling_basis": {
    "value": true,
    "reasoning": "The ad mentions 'reviewing applications on a rolling basis' and may 'fill the position before the deadline'."
  },
  "languages": {
    "mandatory": ["English"],
    "preferred": ["Ukrainian"]
  },
  "seniority": {
    "level": "Managerial",
    "reasoning": "The title is 'Program Manager', it requires 'over 7 years of experience', and involves managing a team of 5."
  }
}
```

#### **3. Almacenamiento estructurado (Upsert en Postgres)**

Una vez que la IA devuelve el JSON estructurado, el nodo **Insert or update rows in a table** toma el control. Mapea los campos de salida de la IA (como `seniority_level`, `mentioned_donors` e `is_project_based`) directamente a columnas de la tabla `job_llm_extractions`.

El nodo utiliza una operación de "Upsert" basada en el `job_id`. Esto significa que si de algún modo ya existe un registro para ese empleo, lo actualiza; de lo contrario, crea una nueva entrada, garantizando la integridad de la base de datos.

### **¿Por qué?**

Al estandarizar estos puntos de datos, este flujo de trabajo permite a una organización humanitaria pasar de la simple búsqueda por palabras clave al filtrado complejo, habilitando consultas como _"Muéstrame todos los puestos de WASH de nivel directivo financiados por USAID que estén abiertos a personal internacional."_
