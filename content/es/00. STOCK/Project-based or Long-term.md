---
title: Basado en proyectos o de largo plazo
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
---
![[Pasted image 20260215093605.png]]
```sql
SELECT
  CASE
    WHEN is_project_based = TRUE THEN 'Project-Based'
    ELSE 'Permanent / Ongoing'
  END AS contract_type,
  count(*) AS number_of_positions
FROM
  job_llm_extractions
GROUP BY
  contract_type;
```

[[LLM extraction of new information in Job Descriptions about localization]]