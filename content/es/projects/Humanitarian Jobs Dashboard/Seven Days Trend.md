---
title: Tendencia de siete días
created: 2025-08-23
modified: 2026-02-15
lang: es-ES
aliases:
  - "es/00. STOCK/Seven Days Trend"
---
![[Pasted image 20250823191944.png]]

Esta tarjeta muestra el número total de nuevas ofertas de empleo del periodo más reciente de siete días. La lógica subyacente consulta todas las ofertas publicadas en los últimos 14 días y las agrupa en dos periodos distintos de siete días para calcular esta tendencia, ofreciendo una instantánea del impulso a corto plazo del mercado laboral. No es sencillo de calcular, consulta [[The rolling week problem]].

```sql
SELECT
  CASE
    WHEN "public"."jobs"."date_created" >= (NOW() - INTERVAL '7 days') THEN DATE_TRUNC('day', NOW())
    ELSE DATE_TRUNC('day', NOW() - INTERVAL '7 days')
  END AS "date",
  SUM("public"."jobs"."score") AS "sum"
FROM
  "public"."jobs"
WHERE
  "public"."jobs"."date_created" >= (NOW() - INTERVAL '14 days')
GROUP BY
  "date"
ORDER BY
  "date" ASC
```