---
title: Humanitarian Jobs Dashboard
draft: false
tags:
  - AI
  - DataAnalysis
description: A real-time business intelligence dashboard processing millions of data points daily to provide actionable insights for Humanitarians.
created at:
lastUpdated: 2026-01-14
status: Production
link: https://baena.ai/demos/reliefjobs-dashboard
article: https://baena.ai/articles/jobs-relief
github: https://github.com/Jesus-Baena/2025-dashboard-reliefweb-jobs
post:
---

## **Project Overview**

### **The Goal**

To build a self-hosted, sovereign data platform that tracks and analyzes the humanitarian labor market by monitoring the **ReliefWeb API**. The project aims to identify shifts in sectoral demand (e.g., Wash vs. Protection) and geographic hiring trends to help professionals navigate the sector.

### **The Solution**

A comprehensive "Humanitarian Labor Intelligence" dashboard. It uses **n8n** to poll the ReliefWeb `/jobs` endpoint, **Flowise** to perform semantic analysis on job descriptions (detecting emerging "soft skill" requirements), and a **Nuxt** frontend to visualize these insights—all containerized and self-hosted for privacy and cost-efficiency.

### **Key Objectives**

- **Automated Data Ingestion:** Use the ReliefWeb API to fetch new vacancies daily, including metadata like _Career Category_, _Years of Experience_, and _Theme_.
    
- **Skill Gap Analysis:** Leverage Flowise (AI) to extract specific technical requirements (e.g., "SQL," "KoboToolbox," "PowerBI") from unstructured job descriptions that standard filters miss.
    
- **Privacy-First Self-Hosting:** Deploy the entire stack using Docker, ensuring no third-party client data is shared and maintaining a permanent, private historical archive of job trends.
    

## **Audience & Stakeholders**

- **Primary Users:** Humanitarian workers (job seekers), IM practitioners, and HR researchers.
    
- **Key Stakeholders:** None (Personal Portfolio Project).
    

## **The Plan & Key Features**

### **Overall Approach**

The project utilizes a **Modular Self-Hosted Architecture**.

1. **n8n** triggers every 12 hours, querying `https://api.reliefweb.int/v2/jobs`.
    
2. Data is cleaned and sent to a local database.
    
3. **Flowise** processes the text to categorize the "seniority" and "technical intensity" of the roles.
    
4. **Nuxt** serves as the presentation layer, pulling from the database to show real-time charts.
    

### **Core Components**

- **API Integrator (n8n):** Handles the logic for the ReliefWeb API, including pagination and filtering for specific "Themes" (e.g., _Coordination_ or _Food Security_).
    
- **Trend Engine (Flowise):** A self-hosted RAG (Retrieval-Augmented Generation) pipeline that lets you "chat" with the current job market (e.g., _"What is the most common skill requested for GIS roles in 2026?"_).
    
- **The Dashboard (Nuxt):** A fast, responsive UI designed in **Figma**, featuring high-density data visualizations like "Hiring Heatmaps" and "Skill Word Clouds."
    
- **Deployment (Docker):** A single `docker-compose.yml` file managing the Nuxt app, n8n instance, and Flowise environment.
    

## **Timeline & Deliverables**

### **Major Milestones**

- **Phase 1: API & Design:** Map out the ReliefWeb JSON structure and design the Dashboard UI in Figma.
    
- **Phase 2: Data Pipeline:** Build the n8n workflow to fetch and store job data (using the `appname` parameter required by ReliefWeb).
    
- **Phase 3: AI Categorization:** Set up Flowise to analyze job descriptions for hidden technical requirements.
    
- **Phase 4: Dashboard Build:** Develop the Nuxt frontend and integrate it with the self-hosted backend.
    

### **Final Deliverables**

- **Self-Hosted URL:** A live link to the personal dashboard instance.
    
- **n8n Workflow (JSON):** The automated pipeline for ReliefWeb data extraction.
    
- **Technical Documentation:** A "beginner-friendly" guide on how to deploy this exact humanitarian IM stack using Docker.
    
- **Figma File:** Access to the UI/UX design components used for the dashboard.
    

---

### **A Technical Note for your n8n workflow:**

ReliefWeb’s API is very friendly but requires an `appname` parameter in every request. Since you are a beginner, the URL you'll likely use in your n8n **HTTP Request node** will look like this:

`https://api.reliefweb.int/v2/jobs?appname=my-humanitarian-dashboard&limit=100&preset=latest`