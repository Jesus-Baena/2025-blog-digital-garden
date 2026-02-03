---
title: I moved to create my own Docker Swarm
draft: false
tags:
---
2025 was a pivotal year for my infrastructure's *"internal plumbing."* I reached a point where I could no longer rely on isolated, stateful containers. To ensure reliable service continuity, I invested significant time and effort into building an orchestrated system.

While [[Coolify]] was an intuitive introduction to basic DevOps concepts, I eventually hit its limitations. At the time, it lacked true orchestration, and any configuration not naively supported by the Coolify interface—such as using a non-root user as an admin—was nearly impossible to implement. On the other hand, it wasn't easy to let go of such a simple deployment process for apps like nuxt sites. However, moving away from that "easy way" pushed me to truly understand CI/CD and GitHub Actions.

The deployment wasn't that hard actually, especially using [this approach of one script](https://www.youtube.com/watch?v=Ws68qHWIFMM) that I followed from [Jim's Garage YouTube channel](https://www.youtube.com/@Jims-Garage). I only had to make some changes to access my Tailscale network.