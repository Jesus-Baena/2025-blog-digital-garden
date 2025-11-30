---
title: HUMANITARIAN AI AGENT CHAT
description:
created at:
lastUpdated:
tags:
  - AI
status: Production
link: https://chat.baena.ai
article: https://baena.ai/articles/chat-agent
github:
post:
---

1.0 Project Overview
1.1 The Goal

The goal was to launch an open-access AI chat application that any visitor can use immediately, while offering an optional registration path for users who wish to save and manage their conversation history.


1.2 The Solution

We are building a web-based chat application using a Nuxt UI Pro template. The application will feature a public chat interface, AI assistant selection, and an optional authentication flow that delegates to our main site, baena.ai. All backend interactions will be handled via a custom API layer connecting to n8n workflows and a Supabase database.
1.3 Key Objectives

    Develop a public, session-based chat experience for anonymous users with a clear call-to-action to register.
    Implement a delegated authentication system for users to sign up/log in to save and retrieve their entire chat history.
    Build a robust backend integration connecting the Nuxt server to an n8n webhook and persisting all data in a Supabase database.

2.0 Audience & Stakeholders

    Primary Users: Anonymous visitors seeking quick AI interaction and registered users who want to maintain a persistent chat history.
    Key Stakeholders: The baena.ai development and product teams.

3.0 The Plan & Key Features
3.1 Overall Approach

Our strategy is to leverage an existing Nuxt UI Pro template as a foundation, removing its default authentication and AI call features. We will then build and integrate the custom functionalities outlined in the requirements, focusing first on the backend API and database persistence, followed by the dynamic frontend components.
3.2 Core Components

    Authentication System: A delegated flow redirecting users to baena.ai for login/signup and returning them to the chat app with an active session.
    Core Chat Interface: A dynamic UI featuring a resizable message input, conversation history display, AI assistant selector, and a user menu that adapts based on authentication status.
    Backend Integration: A Nuxt server API that routes requests to a designated n8n webhook, passing the message, thread_id, and assistant_id, with all conversations saved to Supabase.

4.0 Timeline & Deliverables
4.1 Major Milestones

    Date: Project Kickoff & Requirements Finalized
    Date: Backend Integration (API, n8n, Supabase) Complete
    Date: MVP Deployed and Live at chat.baena.ai

4.2 Final Deliverables

    A live and fully functional web application accessible at chat.baena.ai.
    The final source code repository for the application.
    A presentation or document summarizing the features and architecture.

