---
title: Tiempo medio de contratación (días)
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
aliases:
  - "es/00. STOCK/Average Time to Hire (days)"
source_hash: 1d1ae7b9bb67
---
![[Pasted image 20260215091740.png]]

```sql
SELECT
    -- Calculate the overall average for the entire period
    AVG(date_closing::date - date_created::date) AS average_posting_days
FROM
    Jobs
WHERE
    -- Set the time window to the last 12 months
    date_created >= NOW() - INTERVAL '1 year'
    -- Ensure we only include records with valid data for the calculation
    AND date_closing IS NOT NULL
    AND date_created IS NOT NULL
    AND date_closing > date_created;
```
