---
title: HUMANITARIAN AI AGENT CHAT
type: project
description: Un asistente impulsado por IA experto en asuntos humanitarios
aliases:
  - 2024-humanitarian-chat-agent
  - "es/00. STOCK/HUMANITARIAN AI AGENT CHAT"
project_ID: PRJ-2024-001
date: 2024-10-07
lastUpdated: 2025-12-16
tags:
  - AI
status: Producción
briefing: https://baena.ai/projects/ai-chatbot-project
link: https://chat.baena.ai
article: https://baena.ai/articles/chat-agent
github: https://github.com/Jesus-Baena/2024-humanitarian-chat-agent
draft: false
stack: "[[n8n]]"
lang: es-ES
source_hash: 005d4dd15d2f
---
## **1. Título del proyecto:**
El Chatbot Humanitario de IA

## **2. Organización implementadora (marcador de posición):**
baena.ai — Jesus Baena (desarrollador en solitario)

## **3. Antecedentes del proyecto y planteamiento del problema:**

Los profesionales del sector humanitario a menudo necesitan análisis de datos en tiempo real y apoyo para la toma de decisiones en entornos de terreno difíciles. Aunque la IA ofrece una solución, muchas herramientas están restringidas o carecen del contexto específico de los conjuntos de datos humanitarios. Existe la necesidad de un asistente accesible y «centrado en lo humanitario» que aporte valor inmediato a los usuarios invitados, al tiempo que permita al personal profesional mantener un historial persistente y seguro de sus consultas técnicas y datos operativos.

## **4. Objetivo del proyecto:**

Desplegar una aplicación de IA basada en web y de acceso abierto, optimizada para el personal humanitario de terreno, que ofrezca acceso inmediato para invitados y una vía autenticada opcional para la gestión persistente de conversaciones.

## **5. Objetivos del proyecto:**

- **Accesibilidad pública:** Desarrollar una experiencia de chat pública y basada en sesiones para usuarios anónimos, sin ninguna fricción de entrada.
    
- **Gestión persistente de sesiones:** Implementar un sistema de autenticación delegada a través de `baena.ai` para permitir que los usuarios registrados guarden y recuperen su historial completo de conversaciones.
    
- **Arquitectura de bajo coste de mantenimiento:** Construir una integración de backend personalizada que conecte un servidor Nuxt con webhooks de n8n, garantizando que todas las interacciones con la IA se registren y persistan en una base de datos Supabase.
    
- **Contexto educativo:** Optimizar las respuestas del modelo para añadir contexto educativo humanitario, apoyando específicamente al personal de terreno remoto en su toma de decisiones.
    

## **6. Beneficiarios destinatarios:**

- **Profesionales humanitarios:** Personal de terreno que requiere análisis de datos en tiempo real y asistencia contextualizada.
    
- **Organizaciones humanitarias:** Entidades que buscan mejorar la eficiencia operativa mediante herramientas de IA estandarizadas.
    
- **Visitantes anónimos:** Usuarios que buscan una interacción de IA rápida y fiable basada en conjuntos de datos humanitarios.
    

## **7. Resultados esperados y entregables:**

- **Plataforma de chat en vivo:** Una aplicación web totalmente funcional y lista para producción, alojada en `chat.baena.ai`.
    
- **Puente Nuxt-n8n:** Una capa de API personalizada y robusta que enruta las solicitudes del frontend a los flujos de trabajo de n8n sin la sobrecarga típica de un servidor.
    
- **Capa de persistencia de datos:** Una integración con Supabase que gestiona los perfiles de usuario, la selección de asistente y el historial de hilos.
    
- **Documentación técnica:** Un resumen de la arquitectura y las funcionalidades, mostrando la evolución desde el prototipo inicial en Bubble hasta el stack personalizado actual.
    

## **8. Sostenibilidad:**

El proyecto garantiza su viabilidad a largo plazo al migrar de un prototipo sin código (Bubble) a una arquitectura soberana y personalizada que utiliza Nuxt UI Pro, n8n y Supabase. Este stack de «bajo coste de mantenimiento» minimiza los costes de mantenimiento al tiempo que maximiza el control sobre los datos y el comportamiento de la IA. Al desacoplar el frontend de los flujos de trabajo de automatización principales, el sistema puede escalar o adaptarse fácilmente a nuevos modelos de IA a medida que evolucionan las necesidades del sector humanitario.
