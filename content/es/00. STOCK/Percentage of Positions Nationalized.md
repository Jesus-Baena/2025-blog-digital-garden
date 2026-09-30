---
title: Porcentaje de puestos nacionalizados
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
---
![[Pasted image 20260215093023.png]]

```sql
SELECT
  CASE
    WHEN is_nationalized = TRUE THEN 'Nationalized Position'
    ELSE 'Open to All'
  END AS position_type,
  count(*) AS number_of_positions
FROM
  job_llm_extractions
GROUP BY
  position_type;
```


[[LLM extraction of new information in Job Descriptions about localization]]
