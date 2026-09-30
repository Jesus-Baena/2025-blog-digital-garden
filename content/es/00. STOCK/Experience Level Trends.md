---
title: Tendencias por nivel de experiencia
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
---
![[Pasted image 20260215092114.png]]

```sql
SELECT
    -- Truncate the creation date to the first day of the month for grouping
    DATE_TRUNC('month', j.date_created)::date AS posting_month,
    el.name AS experience_level,
    COUNT(j.job_id) AS number_of_posts
FROM
    Jobs AS j
JOIN
    Job_Experience_Levels AS jel ON j.job_id = jel.job_id
JOIN
    Experience_Levels AS el ON jel.experience_level_id = el.experience_level_id
WHERE
    -- Set the start date for the chart
    j.date_created >= '2024-07-01'

    -- Set the end date to exclude the current, incomplete month
    AND j.date_created < DATE_TRUNC('month', NOW())
GROUP BY
    posting_month,
    experience_level
ORDER BY
    posting_month ASC,
    -- Optional: Order by experience level name for a consistent legend
    experience_level;
```
