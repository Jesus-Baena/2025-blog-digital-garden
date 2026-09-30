---
title: Recuento total de ofertas
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
aliases:
  - "es/00. STOCK/Total Count of Posts"
source_hash: bf1a5734ca95
---
![[Pasted image 20260215092812.png]]

```sql
SELECT
  SUM("public"."jobs"."score") AS "sum"
FROM
  "public"."jobs"
```