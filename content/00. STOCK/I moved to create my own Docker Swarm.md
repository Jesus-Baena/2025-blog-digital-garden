---
title: I moved to create my own Docker Swarm
draft: false
tags:
---
2025 was a pivotal year for my infrastructure's *"internal plumbing."* I reached a point where I could no longer rely on isolated, stateful containers. To ensure reliable service continuity, I invested significant time and effort into building an orchestrated system.

While [[Coolify]] was an intuitive introduction to basic DevOps concepts, I eventually hit its limitations. At the time, it lacked true orchestration, and any configuration not naively supported by the Coolify interface—such as using a non-root user as an admin—was nearly impossible to implement. On the other hand, it wasn't easy to let go of such a simple deployment process for apps like nuxt sites. However, moving away from that "easy way" pushed me to truly understand CI/CD and GitHub Actions.

The deployment wasn't that hard actually, especially using [this approach of one script](https://www.youtube.com/watch?v=Ws68qHWIFMM) that I followed from [Jim's Garage YouTube channel](https://www.youtube.com/@Jims-Garage). I only had to make some changes to access my Tailscale network.

This allows me to host my own webs, like the one you are reading from, as well as my own apps, AI agents and more. Nevertheless, the only way to ensure high availability is to open this infrastructure to some off-site services, specifically VPSs that I can rely on, although always administrating myself. 

I have also **moved into making my apps stateless** (again, 2025 was a busy year). To achieve this, I had to rely on the Supabase external service, which so far has worked amazingly well. I only depends on it for the internal functioning of some apps. The bulk of my information is hosted on-site, in self-hosted Postgres and Qdrant. 

In summary, *an hybrid setup* has shown to be the most balanced setup in terms of reliability, high availability, privacy, sovereignty and speed. 