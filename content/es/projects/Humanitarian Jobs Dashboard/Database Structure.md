---
title: Estructura de la base de datos
created: 2026-02-01
modified: 2026-02-01
lang: es-ES
aliases:
  - "es/00. STOCK/Database Structure"
source_hash: d62d5605c4ad
---
### Tabla principal

Esta tabla contiene la información principal y única de cada oferta de empleo.

**1. `Jobs`**
*   `job_id` (Integer, Primary Key) - *p. ej., 4160671*
*   `uuid` (UUID, Unique) - *Un identificador único para el registro del empleo.*
*   `title` (Text) - *El título del empleo.*
*   `status` (Varchar) - *p. ej., "published"*
*   `score` (Decimal) - *La puntuación de relevancia del empleo.*
*   `body_markdown` (Text) - *La descripción principal del empleo en formato markdown.*
*   `body_html` (Text) - *La descripción principal del empleo en formato HTML.*
*   `how_to_apply_markdown` (Text) - *Las instrucciones de candidatura en markdown.*
*   `how_to_apply_html` (Text) - *Las instrucciones de candidatura en HTML.*
*   `url` (Text) - *La URL principal de la oferta de empleo.*
*   `url_alias` (Text) - *Una URL alternativa para la oferta de empleo.*
*   `api_href` (Text) - *La URL del endpoint de la API para este empleo concreto.*
*   `date_created` (Timestamp)
*   `date_changed` (Timestamp)
*   `date_closing` (Timestamp)

---
### Tablas de búsqueda / dimensiones

Estas tablas almacenan información de categorías que pueden compartirse entre varios empleos. Usar estas tablas evita la duplicación de datos.

**2. `Sources`** (La organización que publica el empleo)
*   `source_id` (Integer, Primary Key) - *p. ej., 1457*
*   `name` (Varchar) - *p. ej., "CARE"*
*   `shortname` (Varchar)
*   `longname` (Varchar) - *p. ej., "CARE International"*
*   `spanish_name` (Varchar, Nullable)
*   `homepage` (Text)
g_type_id` (Integer, Foreign Key -> `Organization_Types.org_type_id`)

**3. `Organization_Types`**
*   `org_type_id` (Integer, Primary Key) - *p. ej., 274*
*   `name` (Varchar) - *p. ej., "Non-governmental Organization"*

**4. `Countries`**
*   `country_id` (Integer, Primary Key) - *p. ej., 149*
*   `name` (Varchar) - *p. ej., "Mali"*
*   `shortname` (Varchar)
*   `iso3` (Char(3)) - *p. ej., "mli"*
*   `latitude` (Decimal)
*   `longitude` (Decimal)
*   `api_href` (Text)

**5. `Cities`**
*   `city_id` (Integer, Primary Key, Auto-Generated)
*   `name` (Varchar, Unique) - *p. ej., "Ndjamena"*

**6. `Posting_Types`** (Empleo, Consultoría, etc.)
*   `posting_type_id` (Integer, Primary Key) - *p. ej., 263*
*   `name` (Varchar) - *p. ej., "Job"*

**7. `Experience_Levels`**
*   `experience_level_id` (Integer, Primary Key) - *p. ej., 261*
*   `name` (Varchar) - *p. ej., "10+ years"*

**8. `Career_Categories`**
*   `category_id` (Integer, Primary Key) - *p. ej., 36601*
*   `name` (Varchar) - *p. ej., "Logistics/Procurement"*

**9. `Themes`**
*   `theme_id` (Integer, Primary Key) - *p. ej., 4595*
*   `name` (Varchar) - *p. ej., "Health"*

---

### Tablas de enlace / unión

Estas tablas gestionan las relaciones de muchos a muchos entre los empleos y las distintas categorías. Por ejemplo, un único empleo puede estar disponible en varios países.

**10. `Job_Sources`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `source_id` (Integer, Foreign Key -> `Sources.source_id`)

**11. `Job_Countries`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `country_id` (Integer, Foreign Key -> `Countries.country_id`)

**12. `Job_Cities`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `city_id` (Integer, Foreign Key -> `Cities.city_id`)

**13. `Job_Posting_Types`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `posting_type_id` (Integer, Foreign Key -> `Posting_Types.posting_type_id`)

**14. `Job_Experience_Levels`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `experience_level_id` (Integer, Foreign Key -> `Experience_Levels.experience_level_id`)

**15. `Job_Career_Categories`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `category_id` (Integer, Foreign Key -> `Career_Categories.category_id`)

**16. `Job_Themes`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `theme_id` (Integer, Foreign Key -> `Themes.theme_id`)

**17. `Job_Redirects`** (Para almacenar las URL de redirección encontradas en algunos registros)
*   `redirect_id` (Integer, Primary Key, Auto-Generated)
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `redirect_url` (Text)

---

### Tabla de metadatos (Opcional)

Esta tabla puede usarse para registrar los metadatos de cada llamada a la API.

**18. `API_Responses`**
*   `response_id` (Integer, Primary Key, Auto-Generated)
*   `retrieved_at` (Timestamp) - *Cuándo se obtuvieron los datos.*
*   `api_href` (Text) - *La URL principal de la API llamada.*
*   `api_self_link` (Text) - *La URL de la página actual de resultados.*
*   `api_next_link` (Text) - *La URL de la siguiente página de resultados.*
*   `total_count` (Integer) - *El número total de registros disponibles.*
*   `response_count` (Integer) - *El número de registros en esta respuesta concreta.*
*   `response_time_ms` (Integer) - *El tiempo que tardó el servidor de la API en generar la respuesta.*



