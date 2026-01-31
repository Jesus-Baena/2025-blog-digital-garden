---
title: Database Structure
draft:
tags:
---

### Core Table

This table holds the main, unique information for each job posting.

**1. `Jobs`**
*   `job_id` (Integer, Primary Key) - *e.g., 4160671*
*   `uuid` (UUID, Unique) - *A unique identifier for the job record.*
*   `title` (Text) - *The title of the job.*
*   `status` (Varchar) - *e.g., "published"*
*   `score` (Decimal) - *The relevance score of the job.*
*   `body_markdown` (Text) - *The main job description in markdown format.*
*   `body_html` (Text) - *The main job description in HTML format.*
*   `how_to_apply_markdown` (Text) - *The application instructions in markdown.*
*   `how_to_apply_html` (Text) - *The application instructions in HTML.*
*   `url` (Text) - *The primary URL for the job posting.*
*   `url_alias` (Text) - *An alternative URL for the job posting.*
*   `api_href` (Text) - *The API endpoint URL for this specific job.*
*   `date_created` (Timestamp)
*   `date_changed` (Timestamp)
*   `date_closing` (Timestamp)

---

### Lookup / Dimension Tables

These tables store information for categories that can be shared across multiple jobs. Using these tables prevents data duplication.

**2. `Sources`** (The organization posting the job)
*   `source_id` (Integer, Primary Key) - *e.g., 1457*
*   `name` (Varchar) - *e.g., "CARE"*
*   `shortname` (Varchar)
*   `longname` (Varchar) - *e.g., "CARE International"*
*   `spanish_name` (Varchar, Nullable)
*   `homepage` (Text)
g_type_id` (Integer, Foreign Key -> `Organization_Types.org_type_id`)

**3. `Organization_Types`**
*   `org_type_id` (Integer, Primary Key) - *e.g., 274*
*   `name` (Varchar) - *e.g., "Non-governmental Organization"*

**4. `Countries`**
*   `country_id` (Integer, Primary Key) - *e.g., 149*
*   `name` (Varchar) - *e.g., "Mali"*
*   `shortname` (Varchar)
*   `iso3` (Char(3)) - *e.g., "mli"*
*   `latitude` (Decimal)
*   `longitude` (Decimal)
*   `api_href` (Text)

**5. `Cities`**
*   `city_id` (Integer, Primary Key, Auto-Generated)
*   `name` (Varchar, Unique) - *e.g., "Ndjamena"*

**6. `Posting_Types`** (Job, Consultancy, etc.)
*   `posting_type_id` (Integer, Primary Key) - *e.g., 263*
*   `name` (Varchar) - *e.g., "Job"*

**7. `Experience_Levels`**
*   `experience_level_id` (Integer, Primary Key) - *e.g., 261*
*   `name` (Varchar) - *e.g., "10+ years"*

**8. `Career_Categories`**
*   `category_id` (Integer, Primary Key) - *e.g., 36601*
*   `name` (Varchar) - *e.g., "Logistics/Procurement"*

**9. `Themes`**
*   `theme_id` (Integer, Primary Key) - *e.g., 4595*
*   `name` (Varchar) - *e.g., "Health"*

---

### Linking / Junction Tables

These tables manage the many-to-many relationships between jobs and the various categories. For example, a single job can be available in multiple countries.

**10. `Job_Sources`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `source_id` (Integer, Foreign Key -> `Sources.source_id`)

**11. `Job_Countries`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `country_id` (Integer, Foreign Key -> `Countries.country_id`)

**12. `Job_Cities`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `city_id` (Integer, Foreign Key -> `Cities.city_id`)

**13. `Job_Posting_Types`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `posting_type_id` (Integer, Foreign Key -> `Posting_Types.posting_type_id`)

**14. `Job_Experience_Levels`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `experience_level_id` (Integer, Foreign Key -> `Experience_Levels.experience_level_id`)

**15. `Job_Career_Categories`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `category_id` (Integer, Foreign Key -> `Career_Categories.category_id`)

**16. `Job_Themes`**
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `theme_id` (Integer, Foreign Key -> `Themes.theme_id`)

**17. `Job_Redirects`** (To store redirect URLs found in some records)
*   `redirect_id` (Integer, Primary Key, Auto-Generated)
*   `job_id` (Integer, Foreign Key -> `Jobs.job_id`)
*   `redirect_url` (Text)

---

### Metadata Table (Optional)

This table can be used to log the metadata from each API call.

**18. `API_Responses`**
*   `response_id` (Integer, Primary Key, Auto-Generated)
*   `retrieved_at` (Timestamp) - *When the data was fetched.*
*   `api_href` (Text) - *The main API URL called.*
*   `api_self_link` (Text) - *The URL of the current page of results.*
*   `api_next_link` (Text) - *The URL for the next page of results.*
*   `total_count` (Integer) - *The total number of records available.*
*   `response_count` (Integer) - *The number of records in this specific response.*
*   `response_time_ms` (Integer) - *The time the API server took to generate the response.*



