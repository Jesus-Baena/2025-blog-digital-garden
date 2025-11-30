---
title: The rolling week problem
draft:
tags:
---

### Methodological Notes: The "Rolling Week" Problem

Building and interpreting a live dashboard comes with its own set of technical challenges. Metabase excels at composing queries based on fixed calendar ranges (e.g., "Last Week" or "This Month"). However, this creates analytical noise.

For example, when viewing the dashboard at the beginning of a new week (a Monday or Tuesday), comparing the few jobs posted so far to the full seven days of the previous week results in a disproportionate and misleadingly alarming drop.

The solution is to implement a "rolling seven-day total" query. This provides a far more accurate and stable picture of the immediate trend, smoothing out the noise from arbitrary calendar cutoffs. This is one of several small but critical nuances required to make the data tell an honest story.