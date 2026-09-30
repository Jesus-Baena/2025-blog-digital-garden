---
title: Oportunidades por nivel de experiencia
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
---
![[Pasted image 20260215091106.png]]

```sql
SELECT
  "source"."experience_level" AS "experience_level",
  "source"."number_of_jobs" AS "number_of_jobs"
FROM
  (
    SELECT
      el.name AS experience_level,
      COUNT(j.job_id) AS number_of_jobs
    FROM
      Jobs AS j
      JOIN Job_Experience_Levels AS jel ON j.job_id = jel.job_id
      JOIN Experience_Levels AS el ON jel.experience_level_id = el.experience_level_id
   
WHERE
      j.status = 'published'
     
   AND j.date_closing > CURRENT_DATE
   
GROUP BY
      el.name
   
ORDER BY
      -- Useful to order by experience level for clarity in the legend
      MIN(el.experience_level_id)
  ) AS "source"
LIMIT
  1048575
```
