---
title: CBPF data annoying API limitations
type: post
date: 2026-03-03
draft: false
tags:
  - DataAnalysis
created: 2025-08-11
modified: 2026-02-13
---
I've recently been wrestling with Country-based Pooled Funds (CBPF) data to see how the Ukraine Humanitarian Fund (UHF) compares to other funds [Github](https://github.com/Jesus-Baena/2026-ukraine-poolfund-analysis). The CBPF's built-in [data explorer](https://cbpf.data.unocha.org/index.html)) is actually quite good for interacting with visuals and grabbing basic country-level downloads. However, pulling raw data for custom analysis is a different story. While it’s nice that they have an API, it’s completely undocumented, and its strict limitations end up being more frustrating than helpful.

CBPF already has a [data explorer]( web page, where you can download some data by country and interact with some visualizations. Which is pretty good. 

When it comes to retrieve raw data to perform custom analysis, well... it is welcome that they have an API endpoint (without documentation), but the limitations of it leaves you more annoyed than excited. 

## The Good 

Let's acknowledge where the system succeeds. The transparency of the data is commendable. Through the CBPF API and data exports, we have access to granular details that are often obscured in other sectors. We can see:

- **Detailed Project Information**: Project titles, sectors, and objectives are readily available.

- **Financials**: Budget totals and approved amounts are transparent.

- **Partnerships**: The names of implementing partners are clear, allowing us to see who is doing the work on the ground.

## The not that Good 

- **Reliability**: The strict dependence on the `AllocationFlow` endpoint for detailed financial tracking hit a wall. We consistently encountered HTTP 500 Internal Server Errors.  Not very [[n8n]] friendly. 

- **Format Inconsistency**: The CBPF API frequently returns HTML error pages instead of proper status codes or JSON messages rather than structured JSON.

- **Field Ambiguity**: The schema lacks clear documentation regarding identifier fields. Navigating the relationship between `ChfId`, `ChfProjectCode`, and `PartnerCode` required trial-and-error reverse engineering rather than following a specification.


## The Bad. 


- **Missing Flow Data**: Because the `AllocationFlow` endpoint is unreliable, we were forced to reconstruct partner-type analysis (INGO vs. NNGO) manually using the `ProjectSummary` endpoint. This workaround relies on `OrganizationType` fields being consistent across thousands of records, introducing a margin of error that shouldn't exist.

- **Granularity**: Budget data often arrives as a single integer. We lack the ability to analyze administrative versus operational costs _over time_ or by activity. We see the total price tag, but not the breakdown. 

* **Historical Blind Spots (The Pipeline Problem)**: The API provides a snapshot of the current moment, but not a historical ledger of the project lifecycle. This is most critical in the `Pipeline` endpoints, which show projects currently under review or development. **Once a project is approved or rejected, it effectively vanishes from this view.** It is impossible to analyze approval bottlenecks, rejection rates, or the "time-to-decision" for critical funding. The API deletes the history as it creates the future.

- **The Traceability Gap**: This is arguably a feature of "pooled" funds, but it presents an analytical blocker. You can track money _in_ (via the `Contributions` endpoint) and money _allocated_ (via `ProjectSummary`). However, the pooling mechanism means you cannot trace a specific donor's dollar to a specific project. We can report on aggregate flows, but not direct lineage. For me this is not a major problem, this is just a consequence of the *pooling* effect, but I would understand the interest of donors on following the dollar.  

* **Historical Blind Spots (The Pipeline Problem)**: The API provides a snapshot of the current moment, but not a historical ledger of the project lifecycle. This is most critical in the `Pipeline` endpoints, which show projects currently under review or development. Once a project is approved or rejected, it effectively vanishes from this view. Unless you build your own daily archiving system (as we are doing), it is impossible to analyze approval bottlenecks, rejection rates, or the "time-to-decision" for critical funding. The API deletes the history as it creates the future.

* **The Narrative Black Hole**: While the quantitative endpoints exist, the qualitative data—full project proposals, detailed monitoring reports, and narrative justifications beyond a tweet-length summary—remain out of reach. This blocks any possibility of leveraging Large Language Models (LLMs) to analyze project logic, methodology, or impact stories at scale. We are left with the numbers but lose the context, making it impossible to audit *how* the work is being done or to detect patterns in project quality. An example of this is my [[LLM extraction of new information in Job Descriptions about localization]].


En conclusion, the exploitation of the data is limited to these endpoints being operational: [[Report Available Endpoints CBPF]]

