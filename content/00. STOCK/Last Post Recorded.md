---
title: Last Post Recorded
draft: false
created: 2026-02-15
modified: 2026-03-02
---
![[Pasted image 20260215093625.png]]
```sql
SELECT
  MAX(date_created) AS "last_published_at"
FROM
  public.jobs;
```

A smaller, but not minor visualization, helps me to check if the automation script is running properly. 