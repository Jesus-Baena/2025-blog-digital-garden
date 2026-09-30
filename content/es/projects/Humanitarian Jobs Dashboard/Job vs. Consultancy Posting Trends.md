---
title: Tendencias de publicación de empleo frente a consultoría
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
aliases:
  - "es/00. STOCK/Job vs. Consultancy Posting Trends"
---
![[Pasted image 20260215092319.png]]

```sql
SELECT
    -- Truncate the creation date to the first day of the month for grouping
    DATE_TRUNC('month', j.date_created)::date AS posting_month,
    pt.name AS posting_type,
    COUNT(j.job_id) AS number_of_posts
FROM
    Jobs AS j
JOIN
    Job_Posting_Types AS jpt ON j.job_id = jpt.job_id
JOIN
    Posting_Types AS pt ON jpt.posting_type_id = pt.posting_type_id
WHERE
    -- 1. Filter to include ONLY 'Job' and 'Consultancy' types
    pt.name IN ('Job', 'Consultancy')

    -- 2. Set the start date for the chart
    AND j.date_created >= '2024-07-01'

    -- 3. Set the end date to exclude the current, incomplete month
    AND j.date_created < DATE_TRUNC('month', NOW())
GROUP BY
    posting_month,
    posting_type
ORDER BY
    posting_month ASC;
```