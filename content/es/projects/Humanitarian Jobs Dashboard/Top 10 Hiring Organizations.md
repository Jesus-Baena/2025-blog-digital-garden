---
title: Principales organizaciones contratantes
created: 2025-08-23
modified: 2026-02-01
lang: es-ES
aliases:
  - "es/00. STOCK/Top 10 Hiring Organizations"
---
![[Pasted image 20250823193117.png]]

Este gráfico de barras horizontales clasifica a las 10 principales organizaciones humanitarias por su número actual de ofertas de empleo activas. Ofrece una visión clara y de un vistazo de los reclutadores más activos del sector.

```sql
SELECT
  "source"."organization_name" AS "organization_name",
  "source"."number_of_jobs" AS "number_of_jobs"
FROM
  (
    SELECT
      s.name AS organization_name,
      COUNT(j.job_id) AS number_of_jobs
    FROM
      Jobs AS j
      JOIN Job_Sources AS js ON j.job_id = js.job_id
      JOIN Sources AS s ON js.source_id = s.source_id
   
WHERE
      j.status = 'published'
     
   AND j.date_closing > CURRENT_DATE
   
GROUP BY
      s.name
   
ORDER BY
      number_of_jobs DESC
   
LIMIT
      10
  ) AS "source"
LIMIT
  1048575
```