---
title: Empleo frente a consultoría
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
aliases:
  - "es/00. STOCK/Job vs. Consultancy"
source_hash: 68bd68582379
---
![[Pasted image 20260215091909.png]]

```sql
SELECT
    pt.name AS posting_type,
    COUNT(j.job_id) AS number_of_postings
FROM
    Jobs AS j
JOIN
    Job_Posting_Types AS jpt ON j.job_id = jpt.job_id
JOIN
    Posting_Types AS pt ON jpt.posting_type_id = pt.posting_type_id
WHERE
    j.status = 'published'
    AND j.date_closing > CURRENT_DATE
GROUP BY
    pt.name;
```
