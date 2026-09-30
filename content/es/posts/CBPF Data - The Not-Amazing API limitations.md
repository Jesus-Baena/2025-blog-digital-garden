---
title: Las no-tan-asombrosas limitaciones de la API de datos del CBPF
type: post
date: 2026-03-03
draft: false
tags:
  - DataAnalysis
created: 2025-08-11
modified: 2026-02-13
lang: es-ES
aliases:
  - "es/00. STOCK/CBPF Data - The Not-Amazing API limitations"
---
Últimamente he estado lidiando con los datos de los Fondos Mancomunados por País (CBPF, Country-based Pooled Funds) para ver cómo se compara el Fondo Humanitario para Ucrania (UHF) con otros fondos [Github](https://github.com/Jesus-Baena/2026-ukraine-poolfund-analysis). El [explorador de datos](https://cbpf.data.unocha.org/index.html)) integrado del CBPF es bastante bueno para interactuar con los gráficos y obtener descargas básicas a nivel de país. Sin embargo, extraer datos en bruto para un análisis personalizado es otra historia. Aunque está bien que tengan una API, está completamente sin documentar, y sus estrictas limitaciones acaban siendo más frustrantes que útiles.

El CBPF ya tiene una página web de [explorador de datos]( donde puedes descargar algunos datos por país e interactuar con algunas visualizaciones. Lo cual está bastante bien. 

Cuando se trata de recuperar datos en bruto para realizar un análisis personalizado, bueno... es de agradecer que tengan un endpoint de API (sin documentación), pero sus limitaciones te dejan más molesto que entusiasmado. 

## Lo bueno 

Reconozcamos dónde acierta el sistema. La transparencia de los datos es encomiable. A través de la API del CBPF y de las exportaciones de datos, tenemos acceso a detalles granulares que a menudo quedan ocultos en otros sectores. Podemos ver:

- **Información detallada del proyecto**: Los títulos, sectores y objetivos de los proyectos están disponibles fácilmente.

- **Datos financieros**: Los totales presupuestarios y los importes aprobados son transparentes.

- **Alianzas**: Los nombres de los socios implementadores son claros, lo que nos permite ver quién está haciendo el trabajo sobre el terreno.

## Lo no tan bueno 

- **Fiabilidad**: La estricta dependencia del endpoint `AllocationFlow` para el seguimiento financiero detallado nos chocó contra un muro. Nos encontramos constantemente con errores HTTP 500 Internal Server Error. No muy amigable con [[n8n]]. 

- **Inconsistencia de formato**: La API del CBPF devuelve con frecuencia páginas HTML de error en lugar de códigos de estado adecuados o mensajes JSON, en vez de JSON estructurado.

- **Ambigüedad de campos**: El esquema carece de documentación clara sobre los campos identificadores. Navegar la relación entre `ChfId`, `ChfProjectCode` y `PartnerCode` requirió ingeniería inversa por ensayo y error en lugar de seguir una especificación.


## Lo malo. 


- **Datos de flujo ausentes**: Como el endpoint `AllocationFlow` no es fiable, nos vimos obligados a reconstruir manualmente el análisis por tipo de socio (INGO frente a NNGO) usando el endpoint `ProjectSummary`. Esta solución alternativa depende de que los campos `OrganizationType` sean consistentes a lo largo de miles de registros, introduciendo un margen de error que no debería existir.

- **Granularidad**: Los datos presupuestarios suelen llegar como un único número entero. Carecemos de la capacidad de analizar los costes administrativos frente a los operativos _a lo largo del tiempo_ o por actividad. Vemos el precio total, pero no el desglose. 

* **Puntos ciegos históricos (el problema del pipeline)**: La API proporciona una instantánea del momento actual, pero no un registro histórico del ciclo de vida del proyecto. Esto es más crítico en los endpoints de `Pipeline`, que muestran los proyectos que están actualmente en revisión o desarrollo. **Una vez que un proyecto se aprueba o se rechaza, desaparece de esta vista en la práctica.** Es imposible analizar los cuellos de botella en la aprobación, las tasas de rechazo o el "tiempo hasta la decisión" de la financiación crítica. La API borra el historial a medida que crea el futuro.

- **La brecha de trazabilidad**: Esto es, sin duda, una característica de los fondos "mancomunados", pero supone un obstáculo analítico. Puedes rastrear el dinero que _entra_ (a través del endpoint `Contributions`) y el dinero _asignado_ (a través de `ProjectSummary`). Sin embargo, el mecanismo de mancomunación significa que no puedes rastrear el dólar de un donante específico hasta un proyecto específico. Podemos informar sobre flujos agregados, pero no sobre una trazabilidad directa. Para mí esto no es un problema grave, es simplemente una consecuencia del efecto de *mancomunación* (pooling), pero entendería el interés de los donantes por seguir el rastro del dólar.  

* **Puntos ciegos históricos (el problema del pipeline)**: La API proporciona una instantánea del momento actual, pero no un registro histórico del ciclo de vida del proyecto. Esto es más crítico en los endpoints de `Pipeline`, que muestran los proyectos que están actualmente en revisión o desarrollo. Una vez que un proyecto se aprueba o se rechaza, desaparece de esta vista en la práctica. A menos que construyas tu propio sistema de archivado diario (como estamos haciendo nosotros), es imposible analizar los cuellos de botella en la aprobación, las tasas de rechazo o el "tiempo hasta la decisión" de la financiación crítica. La API borra el historial a medida que crea el futuro.

* **El agujero negro narrativo**: Aunque existen los endpoints cuantitativos, los datos cualitativos —las propuestas completas de proyecto, los informes de seguimiento detallados y las justificaciones narrativas más allá de un resumen de la longitud de un tuit— quedan fuera de alcance. Esto bloquea cualquier posibilidad de aprovechar los Modelos Grandes de Lenguaje (LLM) para analizar la lógica del proyecto, la metodología o las historias de impacto a escala. Nos quedamos con los números, pero perdemos el contexto, lo que hace imposible auditar *cómo* se realiza el trabajo o detectar patrones en la calidad de los proyectos. Un ejemplo de esto es mi [[LLM extraction of new information in Job Descriptions about localization]].


En conclusión, la explotación de los datos se limita a que estos endpoints estén operativos: [[Report Available Endpoints CBPF]]

