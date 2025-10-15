---
title: Jobs Closing Soon
draft:
tags:
---
![[Pasted image 20250823192710.png]]

```
SELECT
    COUNT(*) AS jobs_closing_soon
FROM
    jobs
WHERE
    date_closing BETWEEN NOW() AND NOW() + INTERVAL '7 days';
```