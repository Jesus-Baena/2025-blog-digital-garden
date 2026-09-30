---
title: Duración media de la publicación de ofertas (días)
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
aliases:
  - "es/00. STOCK/Average Job Posting Duration (days)"
---
![[Pasted image 20260215091605.png]]

```sql
SELECT
  "source"."average_posting_days" AS "average_posting_days"
FROM
  (
    SELECT
      -- Calculate the average of the difference between the closing and creation dates
      AVG(date_closing :: date - date_created :: date) AS average_posting_days
    FROM
      Jobs
   
WHERE
      -- Only include jobs that are marked as published
      status = 'published' -- Ensure we only calculate for jobs that have a valid closing and creation date
     
   AND date_closing IS NOT NULL
      AND date_created IS NOT NULL -- Avoid errors from bad data where closing is before creation
      AND date_closing > date_created
  ) AS "source"
LIMIT
  1048575
```
