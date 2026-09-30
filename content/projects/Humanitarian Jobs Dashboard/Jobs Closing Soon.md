---
title: Jobs Closing Soon
draft: false
created: 2025-08-23
modified: 2026-02-08
aliases:
  - "00. STOCK/Jobs Closing Soon"
---
![[Pasted image 20250823192710.png]]

```sql
SELECT
    COUNT(*) AS jobs_closing_soon
FROM
    jobs
WHERE
    date_closing BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```