---
title: Humanitarian Jobs Dashboard
draft: false
tags:
  - AI
  - DataAnalysis
description: Un panel de inteligencia de negocio en tiempo real que procesa millones de puntos de datos al día para ofrecer información práctica al personal humanitario.
created: 2025-02-13
lastUpdated: 2026-01-14
status: Producción
link: https://baena.ai/demos/reliefjobs-dashboard
article: https://baena.ai/articles/jobs-relief
github: https://github.com/Jesus-Baena/2025-dashboard-reliefweb-jobs
lang: es-ES
aliases:
  - "es/00. STOCK/HUMANITARIAN JOBS DASHBOARD briefing"
source_hash: 79cc198a43b4
---
## **Resumen del proyecto**

### **El objetivo**

Construir una plataforma de datos autoalojada y soberana que rastree y analice el mercado laboral humanitario mediante la monitorización de la **API de ReliefWeb**. El proyecto busca identificar cambios en la demanda sectorial (p. ej., Wash frente a Protección) y tendencias geográficas de contratación para ayudar a los profesionales a orientarse en el sector.

### **La solución**

Un completo panel de «Inteligencia del mercado laboral humanitario». Utiliza **n8n** para consultar el endpoint `/jobs` de ReliefWeb, **Flowise** para realizar análisis semántico de las descripciones de los puestos (detectando requisitos emergentes de «habilidades blandas») y un frontend en **Nuxt** para visualizar estos datos, todo ello en contenedores y autoalojado por motivos de privacidad y eficiencia de costes.

### **Objetivos clave**

- **Ingesta automatizada de datos:** Usar la API de ReliefWeb para obtener nuevas vacantes a diario, incluyendo metadatos como _Categoría profesional_, _Años de experiencia_ y _Tema_.
    
- **Análisis de brechas de competencias:** Aprovechar Flowise (IA) para extraer requisitos técnicos específicos (p. ej., «SQL», «KoboToolbox», «PowerBI») de descripciones de puestos no estructuradas que los filtros estándar pasan por alto.
    
- **Autoalojamiento con prioridad en la privacidad:** Desplegar todo el stack usando Docker, garantizando que no se comparten datos de clientes de terceros y manteniendo un archivo histórico permanente y privado de las tendencias de empleo.
    

## **Público y partes interesadas**

- **Usuarios principales:** Trabajadores humanitarios (personas que buscan empleo), profesionales de gestión de la información (IM) e investigadores de RR. HH.
    
- **Partes interesadas clave:** Ninguna (proyecto personal de porfolio).
    

## **El plan y las funcionalidades clave**

### **Enfoque general**

El proyecto utiliza una **arquitectura modular autoalojada**.

1. **n8n** se activa cada 12 horas, consultando `https://api.reliefweb.int/v2/jobs`.
    
2. Los datos se depuran y se envían a una base de datos local.
    
3. **Flowise** procesa el texto para clasificar la «antigüedad» y la «intensidad técnica» de los puestos.
    
4. **Nuxt** actúa como capa de presentación, extrayendo datos de la base de datos para mostrar gráficos en tiempo real.
    

### **Componentes principales**

- **Integrador de API (n8n):** Gestiona la lógica de la API de ReliefWeb, incluyendo la paginación y el filtrado por «Temas» específicos (p. ej., _Coordinación_ o _Seguridad alimentaria_).
    
- **Motor de tendencias (Flowise):** Una canalización RAG (generación aumentada por recuperación) autoalojada que permite «conversar» con el mercado laboral actual (p. ej., _«¿Cuál es la habilidad más solicitada para los puestos de SIG en 2026?»_).
    
- **El panel (Nuxt):** Una interfaz rápida y responsiva diseñada en **Figma**, con visualizaciones de datos de alta densidad como «Mapas de calor de contratación» y «Nubes de palabras de competencias».
    
- **Despliegue (Docker):** Un único archivo `docker-compose.yml` que gestiona la aplicación Nuxt, la instancia de n8n y el entorno de Flowise.
    

## **Cronograma y entregables**

### **Hitos principales**

- **Fase 1: API y diseño:** Mapear la estructura JSON de ReliefWeb y diseñar la interfaz del panel en Figma.
    
- **Fase 2: Canalización de datos:** Construir el flujo de trabajo de n8n para obtener y almacenar los datos de empleo (usando el parámetro `appname` que exige ReliefWeb).
    
- **Fase 3: Categorización con IA:** Configurar Flowise para analizar las descripciones de los puestos en busca de requisitos técnicos ocultos.
    
- **Fase 4: Construcción del panel:** Desarrollar el frontend en Nuxt e integrarlo con el backend autoalojado.
    

### **Entregables finales**

- **URL autoalojada:** Un enlace en vivo a la instancia personal del panel.
    
- **Flujo de trabajo de n8n (JSON):** La canalización automatizada para la extracción de datos de ReliefWeb.
    
- **Documentación técnica:** Una guía «apta para principiantes» sobre cómo desplegar este mismo stack humanitario de gestión de la información usando Docker.
    
- **Archivo de Figma:** Acceso a los componentes de diseño de UI/UX utilizados para el panel.
    
