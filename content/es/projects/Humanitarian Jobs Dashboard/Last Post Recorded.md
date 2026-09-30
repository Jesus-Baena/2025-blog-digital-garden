---
title: Última oferta registrada
draft: false
created: 2026-02-15
modified: 2026-03-02
lang: es-ES
aliases:
  - "es/00. STOCK/Last Post Recorded"
source_hash: 989ddc12a553
---
![[Pasted image 20260215093625.png]]
```sql
SELECT
  MAX(date_created) AS "last_published_at"
FROM
  public.jobs;
```

Una visualización más pequeña, pero no menos importante, me ayuda a comprobar si el script de automatización se está ejecutando correctamente.
