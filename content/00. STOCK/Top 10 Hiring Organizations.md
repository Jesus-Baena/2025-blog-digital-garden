---
title: Top Hiring Organizations
draft:
tags:
---
![[Pasted image 20250823193117.png]]

This horizontal bar chart ranks the top 10 humanitarian organizations by their current number of active job postings. It provides a clear, at-a-glance view of the most active recruiters in the sector. 

```
SELECT
  "source"."organization_name" AS "organization_name",
  "source"."number_of_jobs" AS "number_of_jobs"
FROM
  (
    SELECT
      s.name AS organization_name,
      COUNT(j.job_id) AS number_of_jobs
    FROM
      Jobs AS j
      JOIN Job_Sources AS js ON j.job_id = js.job_id
      JOIN Sources AS s ON js.source_id = s.source_id
   
WHERE
      j.status = 'published'
     
   AND j.date_closing > CURRENT_DATE
   
GROUP BY
      s.name
   
ORDER BY
      number_of_jobs DESC
   
LIMIT
      10
  ) AS "source"
LIMIT
  1048575
```