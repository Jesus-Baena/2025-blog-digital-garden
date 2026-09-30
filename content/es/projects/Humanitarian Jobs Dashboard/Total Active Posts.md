---
title: Total de ofertas activas
created: 2025-08-23
modified: 2026-02-01
lang: es-ES
aliases:
  - "es/00. STOCK/Total Active Posts"
source_hash: 269d7678db8a
---
![[Pasted image 20250823192418.png]]

Este es un simple recuento de las ofertas que están abiertas en un momento dado. Tiene sus limitaciones, ya que no puede contabilizar aquellas posiciones cubiertas que no han sido actualizadas por quien las publicó.

```sql
SELECT 
    COUNT(*) AS active_job_count
FROM 
    jobs
WHERE 
    status = 'published' 
    AND date_closing > NOW();

```