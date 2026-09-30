---
title: Job Postings per Month
draft: false
created: 2026-02-15
modified: 2026-03-02
---
![[Pasted image 20260215092515.png]]

```sql
-- Query 3: New Job Postings per Finalized Month (from July 2024)
SELECT
  DATE_TRUNC('month', date_created)::DATE AS posting_month,
  COUNT(*) AS number_of_postings
FROM
  jobs
WHERE
  -- Condition 1: Start the series on or after July 1, 2024
  date_created >= '2024-07-01'
  -- Condition 2: Only include months before the current, incomplete month
  AND date_created < DATE_TRUNC('month', NOW())
GROUP BY
  posting_month
ORDER BY
  posting_month ASC;
```