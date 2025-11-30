---
title: LLM extraction of new information in Job Descriptions about localization
draft:
tags:
---

Job descriptions often contain vital data buried in dense paragraphs of text—information like donor requirements, nationality restrictions, or contract types. For my project on [[content/00. STOCK/Humanitarian Sector Employment Dashboard|Humanitarian Sector Employment Dashboard]] I created an **n8n workflow** designed to automatically read, analyze, and structure this data using Large Language Models (LLMs).

### **What This Workflow Does**

The **Relief Jobs Analysis** workflow acts as an autonomous data analyst. It wakes up on a schedule, identifies job postings that have not yet been analyzed, and sends their descriptions to an AI model.

The AI converts the unstructured markdown text into a clean JSON object containing specific metadata (such as whether a job is "project-based" or restricted to "nationals only"). Finally, the workflow saves this enriched data back into a PostgreSQL database, likely to power a dashboard or search filter.

### **How It Works: The 3-Step Architecture**

The workflow operates in a linear loop consisting of ingestion, analysis, and storage.

#### **1. Smart Ingestion (The Schedule & SQL)**

The process begins with a **Schedule Trigger** that runs every 3 hours. Instead of grabbing every job in the database, the workflow uses a smart SQL query to ensure efficiency.

It connects to a Postgres database and selects only jobs (`job_id` and `body_markdown`) that exist in the `jobs` table but **do not** yet exist in the `job_llm_extractions` table. This "diff check" prevents the AI from re-analyzing the same job twice, saving on API costs and processing time.

#### **2. The AI Analyst (LangChain & OpenAI)**

The core intelligence lives in the **Information Extractor** node, powered by an **OpenAI Chat Model** (specifically `gpt-4.1-mini` as configured).

The workflow feeds the job description text to the AI with a specific system prompt: _"You are a highly intelligent and precise data extraction assistant specializing in analyzing job descriptions from the humanitarian and development sectors"_.

The AI is instructed to return a strict JSON schema containing the following insights:

- **Donors:** Extracts specific entities like USAID or ECHO.
    
- **Nationalization:** Determines if the role is for local nationals only and provides reasoning.
    
- **Contract Logic:** Identifies if the role is project-based or on a rolling basis.
    
- **Seniority:** Infers the level (e.g., "Managerial") based on years of experience required.
    
- **Languages:** Splits languages into "Mandatory" vs. "Preferred".
    

#### **3. Structured Storage (Postgres Upsert)**

Once the AI returns the structured JSON, the **Insert or update rows in a table** node takes over. It maps the AI's output fields (like `seniority_level`, `mentioned_donors`, and `is_project_based`) directly to columns in the `job_llm_extractions` table.

The node uses an "Upsert" operation based on the `job_id`. This means if a record for that job somehow already exists, it updates it; otherwise, it creates a new entry, ensuring database integrity.

### **Why This Matters**

By standardizing these data points, this workflow allows a humanitarian organization to move from simple keyword searching to complex filtering—enabling queries like _"Show me all Managerial WASH positions funded by USAID that are open to international staff."_

---

### **Would you like me to...**

- Create a SQL script to generate the `job_llm_extractions` table schema so it matches the fields expected by this workflow?
    
- Help you adjust the system prompt to extract additional specific fields (like "Remote Policy" or "Salary Range")?