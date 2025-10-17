---
title: Total Active Posts
draft:
tags:
---
![[Pasted image 20250823192418.png]]

This is a simple count of the jobs that are open at any given moment. It has its limitations as it cannot account for those filled positions that has not been updated by the poster. 

```
SELECT 
    COUNT(*) AS active_job_count
FROM 
    jobs
WHERE 
    status = 'published' 
    AND date_closing > NOW();

```