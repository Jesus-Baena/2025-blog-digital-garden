---
title: El problema de la semana móvil
created: 2025-11-30
modified: 2026-02-01
lang: es-ES
---
### Notas metodológicas: El problema de la "semana móvil"

Construir e interpretar un cuadro de mando en vivo tiene su propio conjunto de retos técnicos. Metabase destaca en componer consultas basadas en rangos de calendario fijos (por ejemplo, "La semana pasada" o "Este mes"). Sin embargo, esto genera ruido analítico.

Por ejemplo, al ver el cuadro de mando al principio de una nueva semana (un lunes o un martes), comparar las pocas ofertas publicadas hasta el momento con los siete días completos de la semana anterior da como resultado una caída desproporcionada y engañosamente alarmante.

La solución es implementar una consulta de "total móvil de siete días". Esto proporciona una imagen mucho más precisa y estable de la tendencia inmediata, suavizando el ruido de los cortes de calendario arbitrarios. Este es uno de varios matices pequeños pero críticos necesarios para que los datos cuenten una historia honesta.

```sql
SELECT 
    job_date,
    daily_count,
    -- Calculate the sum of the current row plus the previous 6 days
    SUM(daily_count) OVER (
        ORDER BY job_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7day_total
FROM (
    -- First, aggregate raw data into daily counts
    SELECT 
        DATE(created_at) AS job_date, 
        COUNT(*) AS daily_count
    FROM job_postings
    GROUP BY 1
) AS daily_data
ORDER BY 1 DESC;
```

El componente crítico aquí es `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`. Esta instrucción obliga a la consulta a calcular el valor basándose en una ventana móvil de la última semana, garantizando que un informe del martes por la mañana refleje el contexto completo de la semana anterior, en lugar de solo 24 horas de datos.