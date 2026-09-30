---
title: "Humanitarian Jobs Dashboard"
type: project
subtitle: "Real-Time Sector Employment Intelligence"
description: "A real-time business intelligence dashboard processing hundreds of thousands of data points daily to provide insights on humanitarian jobs, tracking the impact of funding crises on workforce dynamics, localization trends, and technical skill requirements."
aliases:
  - 2025-dashboard-reliefweb-jobs
project_ID: "PRJ-2025-001"
date: 2025-02-13
lastUpdated: 2026-01-14
tags:
  - AI
  - DataAnalysis
  - BusinessIntelligence
status: Production
link: https://baena.ai/demos/reliefjobs-dashboard
article: https://baena.ai/articles/jobs-relief
github: https://github.com/Jesus-Baena/2025-dashboard-reliefweb-jobs
post: https://www.linkedin.com/posts/jbaenanet_humanitariantech-dataanalysis-reliefweb-activity-7401125392348221440-vGZt
stack:
  - n8n
  - Flowise
  - Metabase
  - Nuxt 3
  - PostgreSQL
  - Supabase
  - Docker Swarm
  - ReliefWeb API
draft: false
image: "Pasted image 20250823193323.png"
briefing: "[[HUMANITARIAN JOBS DASHBOARD briefing]]"
---
![[00. STOCK/humanitarian_jobs_dashboard_project_brief.pdf]]


#### [[Database Structure]]



## Analysis

<div class="card-grid">

- [[Evolution of relief jobs by experience levels]] <span class="meta-date">2025-08-10</span> #DataAnalysis

- [[LLM extraction of new information in Job Descriptions about localization]] <span class="meta-date">2025-08-10</span> #AI

- [[The rolling week problem]] #DataAnalysis 

</div>

## Metrics

<div class="card-grid">

- [[Seven Days Trend]]

- [[Total Active Posts]]

- [[Jobs Closing Soon]]

- [[Top 10 Hiring Organizations]]

- [[Breakdown by Career Category]]

- [[Map of Jobs Density]]

- [[Opportunities by Experience Level]]

- [[Average Job Posting Duration (days)]]

- [[Average Time to Hire (days)]]

- [[Job vs. Consultancy]]

- [[Experience Level Trends]]

- [[Job vs. Consultancy Posting Trends]]

- [[Job Postings per Month]]

- [[Total Count of Posts]]

- [[Percentage of Positions Nationalized]]

- [[Most Demanded Languages]]

- [[Project-based or Long-term]]

- [[Last Post Recorded]]

</div>


---

### **A Technical Note for the n8n workflow:**

ReliefWeb’s API is very friendly but requires an `appname` parameter in every request since September 2025. Since you are a beginner, the URL you'll likely use in your n8n **HTTP Request node** will look like this:

`https://api.reliefweb.int/v2/jobs?appname=my-humanitarian-dashboard&limit=1000&preset=latest`

> [!UPDATE]
> With all the agents bots scraping the Internet automatically, APIs are gearing up their security and putting more restrictions. This call stopped working and I had to adjust every parameter for the connection not to abort. I am now doing requests of 50 profiles at a time. *2026-01-16*






