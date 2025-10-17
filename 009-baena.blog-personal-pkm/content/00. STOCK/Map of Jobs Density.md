---
title: Map of Jobs Density
draft:
tags:
---
![[Pasted image 20250824164018.png]]


```
SELECT
    c.name AS country_name,
    c.latitude,
    c.longitude,
    ccm.iso2 AS iso_code_for_map, -- Changed: Selecting the 2-letter code from the new table
    COUNT(j.job_id) AS number_of_open_posts
FROM
    Countries AS c
-- New Join: Connect to the country_code_mapping table using the 3-letter ISO code
JOIN
    country_code_mapping AS ccm ON LOWER(TRIM(c.iso3)) = LOWER(ccm.iso3)
JOIN
    Job_Countries AS jc ON c.country_id = jc.country_id
JOIN
    Jobs AS j ON jc.job_id = j.job_id
WHERE
    j.status = 'published'
    AND j.date_closing > CURRENT_DATE
    AND c.iso3 IS NOT NULL AND TRIM(c.iso3) != ''
    AND c.latitude IS NOT NULL
    AND c.longitude IS NOT NULL
GROUP BY
    c.country_id, c.name, c.latitude, c.longitude, ccm.iso2 -- Changed: Group by the new iso2 code
ORDER BY
    number_of_open_posts DESC;
```