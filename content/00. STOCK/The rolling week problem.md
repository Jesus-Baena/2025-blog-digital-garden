---
title: The rolling week problem
draft:
tags:
---

### Methodological Notes: The "Rolling Week" Problem

Building and interpreting a live dashboard comes with its own set of technical challenges. Metabase excels at composing queries based on fixed calendar ranges (e.g., "Last Week" or "This Month"). However, this creates analytical noise.

For example, when viewing the dashboard at the beginning of a new week (a Monday or Tuesday), comparing the few jobs posted so far to the full seven days of the previous week results in a disproportionate and misleadingly alarming drop.

The solution is to implement a "rolling seven-day total" query. This provides a far more accurate and stable picture of the immediate trend, smoothing out the noise from arbitrary calendar cutoffs. This is one of several small but critical nuances required to make the data tell an honest story.

```
SELECT 
    job_date,
    daily_count,
    -- Calculate the sum of the current row plus the previous 6 days
    SUM(daily_count) OVER (
        ORDER BY job_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7day_total
FROM (
    -- First, aggregate raw data into daily counts
    SELECT 
        DATE(created_at) AS job_date, 
        COUNT(*) AS daily_count
    FROM job_postings
    GROUP BY 1
) AS daily_data
ORDER BY 1 DESC;
```

The critical component here is `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`. This instruction forces the query to calculate the value based on a moving window of the last week, ensuring that a Tuesday morning report reflects the full context of the preceding week, rather than just 24 hours of data.