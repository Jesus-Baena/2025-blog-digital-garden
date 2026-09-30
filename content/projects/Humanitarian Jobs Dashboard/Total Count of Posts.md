---
title: Total Count of Posts
draft: false
created: 2026-02-15
modified: 2026-03-02
aliases:
  - "00. STOCK/Total Count of Posts"
---
![[Pasted image 20260215092812.png]]

```sql
SELECT
  SUM("public"."jobs"."score") AS "sum"
FROM
  "public"."jobs"
```