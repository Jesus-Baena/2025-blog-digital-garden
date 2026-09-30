---
title: Empleos que cierran pronto
draft: false
created: 2025-08-23
modified: 2026-02-08
lang: es-ES
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