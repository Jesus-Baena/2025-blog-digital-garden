---
title: Instalar Immich en Synology usando Tailscale como sidecar
type: post
date: 2025-10-03
tags:
  - stack
  - tutorial
created: 2025-10-04
modified: 2025-10-05
lang: es-ES
aliases:
  - "es/00. STOCK/Installing Immich in Synology using Tailscale as sidecar"
---
# Instalar Immich en Synology con Tailscale (y los errores que arreglamos por el camino)

Me estoy adelantando a que Synology mate su aplicación de fotos. Llevo usándola cinco o seis años ya, pero dadas las últimas decisiones de Synology, mejor estar preparado. Si buscas una forma de liberarte de servicios de fotos en la nube como Google Photos, la solución autoalojada **Immich** es una alternativa increíble. Es potente, rica en funcionalidades y te da el control total de tus datos. Ejecutarla en un NAS Synology es una opción popular, pero ¿cómo accedes a ella de forma segura cuando estás fuera de casa?

La respuesta es **Tailscale**, una VPN de configuración nula que crea una red privada segura entre tus dispositivos. Al combinar Immich, Docker y Tailscale en un NAS Synology, puedes construir la biblioteca de fotos privada definitiva.

Esta guía te llevará por todo el proceso de configuración, pero, lo que es más importante, cubrirá los pasos reales de resolución de problemas con los que nos encontramos. El camino no fue perfectamente fluido, pero el resultado final es una configuración robusta y segura.

### El objetivo: una biblioteca de fotos segura y accesible

Nuestro plan era usar Docker Compose para definir y ejecutar todos los servicios necesarios en el NAS Synology:
1.  **Immich:** La aplicación principal, dividida en varios contenedores (servidor, microservicios, machine learning).
2.  **Postgres y Redis:** La base de datos y la caché de las que depende Immich.
3.  **Tailscale:** Un contenedor «sidecar» que se conectaría a nuestra Tailnet y actuaría como una pasarela segura al servicio de Immich, sin abrir ningún puerto en nuestro router.

Todo esto suena sencillo, pero así es como fue en realidad.

### Problema 1: El error «Manifest Not Found» de Redis

Después de crear nuestro archivo inicial `compose.yaml` y arrancar el proyecto en el Container Manager de Synology, la mayoría de los contenedores arrancaron, pero uno falló de inmediato: `immich_redis`.

**El síntoma:** El proyecto no lograba construirse, y los registros del contenedor de Redis mostraban un error: `cannot find manifest for...`.

**La causa:** Esta es una incompatibilidad clásica de arquitectura de CPU. El archivo original `compose.yaml` de la documentación de Immich especificaba una imagen de Redis con un hash único (`redis:6.2-alpine@sha256:...`). Este hash apunta a una imagen construida para una arquitectura específica (como x86_64, usada en la mayoría de los servidores). Nuestro NAS Synology, sin embargo, funciona con un procesador ARM. Docker no podía encontrar una imagen compatible con ARM en ese hash exacto, así que falló.

**La solución:** La solución fue sencilla. Editamos el archivo `compose.yaml` y cambiamos el nombre de la imagen por uno más genérico:

*   **Antes:** `image: redis:6.2-alpine@sha256:32337a71850558c4c8c5c563e52d3a98552f012a4f40cfd6f1a146a495632a4e`
*   **Después:** `image: redis:6.2-alpine`

Al eliminar el hash, permitimos que Docker descargara automáticamente la imagen `redis:6.2-alpine` que coincidía con la arquitectura ARM de nuestro Synology. Con ese cambio, todos los contenedores arrancaron.

### Problema 2: Tailscale estaba en línea y luego desaparecía

Con el problema de Redis resuelto, todos los contenedores se pusieron en verde en el Container Manager. ¡Éxito! O eso pensábamos. Cuando comprobamos nuestra consola de administración de Tailscale, la nueva máquina, `photos`, estaba desconectada. Al fijarnos más en el Container Manager, vimos que el contenedor de Tailscale estaba atrapado en un «bucle de fallos»: arrancaba, funcionaba unos segundos y luego se detenía.

**El síntoma:** El contenedor de Tailscale no se mantenía en ejecución. Los registros mostraban que estaba «arrancando» y luego «detenido», con mensajes como `NeedsLogin`.

**La causa:** Nuestra configuración inicial tenía una línea `command: tailscaled`. Este comando arranca correctamente el servicio en segundo plano de Tailscale, pero nunca le indica que inicie sesión y se conecte realmente a la red. El contenedor arrancaba el servicio, veía que no tenía nada más que hacer y se apagaba.

Nuestro primer intento de arreglarlo fue cambiar el comando a `tailscale up`, pero esto provocó un fallo aún más rápido. Estábamos sobrescribiendo la lógica de arranque por defecto del contenedor. La verdadera causa era que estábamos interfiriendo con el inteligente script de entrypoint de la imagen, diseñado para gestionar el proceso de arranque e inicio de sesión automáticamente.

**La solución:** La mejor solución fue confiar en el comportamiento por defecto del contenedor. Eliminamos por completo la línea `command` de la definición del servicio de Tailscale. Esto permite que el script integrado del contenedor se ejecute, lea la `TS_AUTHKEY` del entorno, arranque el demonio y ejecute `tailscale up` por nosotros.

### Problema 3: El jefe final - «No se puede conectar»

Con la solución anterior, la victoria estaba a la vista. La máquina `photos` aparecía en línea en nuestra consola de Tailscale. Podíamos hacerle ping y todo parecía perfecto. Pero cuando navegamos a `http://photos:2283` en nuestro navegador, nos topamos con un error de conexión.

**El síntoma:** Podíamos llegar a la propia máquina de Tailscale, pero no al servicio de Immich que se ejecutaba en el puerto que esperábamos.

**La causa:** Este es un concepto fundamental en las redes de contenedores. Aunque están en el mismo proyecto, el contenedor `tailscale` y el contenedor `immich-server` son como dos ordenadores separados. El tráfico que llegaba a `photos:2283` impactaba en el contenedor de Tailscale, que no tenía instrucciones para reenviarlo al contenedor de Immich. Era un callejón sin salida.

**La solución:** Necesitábamos indicar a Tailscale que actuara como proxy.
1.  Primero, eliminamos la sección `ports` del `immich-server` en nuestro `compose.yaml`. Esto es más seguro, ya que evita que Immich quede expuesto en la red local del Synology. Tailscale es ahora la *única* vía de entrada.
2.  A continuación, añadimos una variable de entorno especial al servicio `tailscale`: `TS_EXTRA_ARGS=--forward-tcp=2283,immich-server:3001`.

Este comando es la llave mágica. Le indica al contenedor de Tailscale: «Cuando recibas cualquier tráfico TCP en tu puerto 2283, reenvíalo directamente al contenedor llamado `immich-server` en su puerto interno 3001».

### La configuración final que funciona

Tras sortear estos retos, llegamos a una configuración limpia, segura y plenamente funcional. Aquí está el archivo final `compose.yaml` que lo une todo.

```yaml
# Final Corrected compose.yaml for Immich + Tailscale on Synology
name: photos

services:
  immich-server:
    container_name: immich_server
    image: ghcr.io/immich-app/immich-server:release
    command: ["start.sh", "immich"]
    volumes:
      - ./library:/usr/src/app/upload
      - /etc/localtime:/etc/localtime:ro
    env_file:
      - .env
    depends_on:
      - redis
      - database
    restart: always

  immich-microservices:
    container_name: immich_microservices
    image: ghcr.io/immich-app/immich-server:release
    command: ["start.sh", "microservices"]
    volumes:
      - ./library:/usr/src/app/upload
      - /etc/localtime:/etc/localtime:ro
    env_file:
      - .env
    depends_on:
      - redis
      - database
    restart: always

  immich-machine-learning:
    container_name: immich_machine_learning
    image: ghcr.io/immich-app/immich-machine-learning:release
    volumes:
      - ./library:/usr/src/app/upload
      - ./model-cache:/cache
    env_file:
      - .env
    restart: always

  redis:
    container_name: immich_redis
    image: redis:6.2-alpine
    restart: always

  database:
    container_name: immich_postgres
    image: tensorchord/pgvecto-rs:pg14-v0.2.0
    env_file:
      - .env
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_DB: ${DB_DATABASE_NAME}
    volumes:
      - ./postgres:/var/lib/postgresql/data
    restart: always

  tailscale:
    hostname: photos
    image: tailscale/tailscale
    volumes:
      - ./tailscale:/var/lib/tailscale
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - TS_AUTHKEY=${TS_AUTHKEY}
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_HOSTNAME=photos
      # This line forwards traffic from photos:2283 to the immich-server
      - TS_EXTRA_ARGS=--forward-tcp=2283,immich-server:3001
    restart: unless-stopped

volumes:
  postgres:
  library:
```

El autoalojamiento a veces puede parecer un rompecabezas, pero la resolución de problemas forma parte del viaje. Trabajando a través de estos problemas comunes, construimos un servicio de fotos fantástico y seguro al que podemos acceder desde cualquier parte del mundo. Esperamos que esta experiencia te ayude a poner en marcha tu propia configuración aún más rápido.