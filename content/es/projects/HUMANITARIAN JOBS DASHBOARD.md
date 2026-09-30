---
title: "Humanitarian Jobs Dashboard"
type: project
subtitle: "Inteligencia en tiempo real sobre el empleo en el sector"
description: "Un panel de inteligencia de negocio en tiempo real que procesa cientos de miles de puntos de datos al día para ofrecer información sobre el empleo humanitario, rastreando el impacto de las crisis de financiación en la dinámica de la fuerza laboral, las tendencias de localización y los requisitos de competencias técnicas."
aliases:
  - 2025-dashboard-reliefweb-jobs
  - "es/00. STOCK/HUMANITARIAN JOBS DASHBOARD"
project_ID: "PRJ-2025-001"
date: 2025-02-13
lastUpdated: 2026-01-14
tags:
  - AI
  - DataAnalysis
  - BusinessIntelligence
status: Producción
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
lang: es-ES
image: "Pasted image 20250823193323.png"
briefing: "[[HUMANITARIAN JOBS DASHBOARD briefing]]"
---
![[_attachments/humanitarian_jobs_dashboard_project_brief.pdf]]


#### [[Database Structure]]



## Análisis

<div class="card-grid">

- [[Evolution of relief jobs by experience levels]] <span class="meta-date">2025-08-10</span> #DataAnalysis

- [[LLM extraction of new information in Job Descriptions about localization]] <span class="meta-date">2025-08-10</span> #AI

- [[The rolling week problem]] #DataAnalysis 

</div>

## Métricas

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

### **Una nota técnica para el flujo de trabajo de n8n:**

La API de ReliefWeb es muy amigable, pero requiere un parámetro `appname` en cada solicitud desde septiembre de 2025. Como eres principiante, la URL que probablemente usarás en tu **nodo HTTP Request** de n8n tendrá este aspecto:

`https://api.reliefweb.int/v2/jobs?appname=my-humanitarian-dashboard&limit=1000&preset=latest`

> [!UPDATE]
> Con todos los bots de agentes rastreando Internet automáticamente, las API están reforzando su seguridad e imponiendo más restricciones. Esta llamada dejó de funcionar y tuve que ajustar todos los parámetros para que la conexión no se abortara. Ahora hago solicitudes de 50 perfiles cada vez. *2026-01-16*
