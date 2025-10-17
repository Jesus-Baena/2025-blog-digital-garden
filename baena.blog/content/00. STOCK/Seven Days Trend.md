---
title: Seven Days Trend
draft:
tags:
---
![[Pasted image 20250823191944.png]]

This card displays the total number of new job postings from the most recent seven-day period. he underlying logic queries all jobs posted in the last 14 days and groups them into two distinct seven-day periods to calculate this trend, offering a snapshot of short-term momentum in the job market.
```
SELECT
  CASE
    WHEN "public"."jobs"."date_created" >= (NOW() - INTERVAL '7 days') THEN DATE_TRUNC('day', NOW())
    ELSE DATE_TRUNC('day', NOW() - INTERVAL '7 days')
  END AS "date",
  SUM("public"."jobs"."score") AS "sum"
FROM
  "public"."jobs"
WHERE
  "public"."jobs"."date_created" >= (NOW() - INTERVAL '14 days')
GROUP BY
  "date"
ORDER BY
  "date" ASC
```