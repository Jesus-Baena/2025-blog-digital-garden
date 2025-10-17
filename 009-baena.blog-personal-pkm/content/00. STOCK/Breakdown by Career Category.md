---
title: Breaking Down by Career
draft:
tags:
---

![[Pasted image 20250823201006.png]]


```
SELECT
    cc.name AS career_category,
    COUNT(j.job_id) AS number_of_jobs
FROM
    Jobs AS j
JOIN
    Job_Career_Categories AS jc ON j.job_id = jc.job_id
JOIN
    Career_Categories AS cc ON jc.category_id = cc.category_id
WHERE
    j.status = 'published'
    AND j.date_closing > CURRENT_DATE
GROUP BY
    cc.name
ORDER BY
    number_of_jobs DESC;
```