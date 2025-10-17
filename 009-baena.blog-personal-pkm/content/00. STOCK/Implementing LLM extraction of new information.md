---
title: Implementing LLM extraction of new information
draft:
tags:
---

The original source of information for this project is well-structured and clean. However, it doesn't capture all the details I wanted to include in my analysis. For the most part, this information is trapped within the body of the job post.

Manually reading each post was impossible. The solution? I built an automated workflow using n8n.io and Artificial Intelligence to do the heavy lifting. This is the story of how I did it.

#### The Problem: Finding a Needle in a Haystack

Job postings are written for humans, not for databases. One posting might list "fluency in English" as a requirement, while another might say "strong English language skills." One might have a clear "Salary" section, while others embed compensation details within a paragraph. This lack of a predefined format makes it incredibly challenging to compare positions or gather overarching insights.

My goal was to extract specific, structured data points from each job description, such as:
*   Is the job open to international or national staff only?
*   Is it a permanent position or a fixed-term project?
*   Are specific donors, like USAID, mentioned?
*   What are the core skills and keywords (e.g., "WASH," "Program Manager")?
*   Are applications reviewed on a rolling basis?
*   What are the mandatory and preferred languages?
*   What is the seniority level?

Manually collecting this information would be a slow, error-prone, and unsustainable process. I needed a system that could read, understand, and categorize this information automatically.

#### The Solution: An Automated AI-Powered Workflow

To tackle this, I designed and built an automated workflow using the low-code platform n8n, coupled with the power of OpenAI's language models. Here’s a breakdown of how my "Relief Jobs Analysis" engine works, step by step.

**Step 1: Running on a Schedule**
The entire process is designed to be hands-off. Using a schedule trigger, the workflow automatically kicks off every three hours to check for new jobs.

**Step 2: Finding New Jobs to Analyze**
The workflow first connects to my PostgreSQL database and runs a simple query. It fetches up to 50 of the most recent job postings that haven't been analyzed yet. This ensures I'm always working with the latest data without reprocessing old entries. To ensure the sample size keeps growing cost-effectively, if fewer than 50 new jobs were published, the system fetches older, unprocessed jobs from the backlog.

**Step 3: The AI Brain—Extracting the Details**
This is where the magic happens. Each job description is passed to an "Information Extractor" node in n8n, which is powered by an OpenAI GPT model. I specifically instructed the AI to act as a data extraction assistant for the humanitarian sector.

I then provided the model with a clear JSON schema, which acts as a template for the information I want. For each job description it reads, the AI must find and fill in the values for keys like `"is_nationalized"`, `"mentioned_donors"`, and `"seniority"`. It even provides the reasoning for its decision, which is crucial for validation and refinement.

**Step 4: Storing the Structured Gold**
Once the AI has worked its magic and returned a clean, structured JSON object, the workflow takes this new data and stores it back in my PostgreSQL database. It uses an "upsert" operation—a smart way of saying it will insert a new row for a new job or update an existing one if it ever needs to be re-analyzed. This keeps the dataset clean and current.

#### Why This Matters: The Power of Structured Data

By transforming unstructured text into a structured format, I unlocked a world of possibilities for analysis. Before, I had thousands of individual documents. Now, I have a database that can be queried to answer critical questions:
*   What percentage of new jobs are restricted to national staff?
*   Which donors are funding the most projects right now?
*   What are the most in-demand skills in the sector?
*   Are more jobs becoming project-based over time?

This automated approach doesn't just save countless hours of manual labor; it provides real-time, granular insights into the labor market that were previously inaccessible. It allows organizations, job seekers, and analysts to make more informed decisions based on data, not just anecdotes.

This project is a perfect example of how combining workflow automation with AI can solve tangible business problems. It demonstrates that you don't need a massive team of developers to build powerful data extraction and analysis pipelines. By leveraging tools like n8n and OpenAI, I turned a chaotic mess of text into a clean, actionable dataset, ready to reveal the stories hidden within.