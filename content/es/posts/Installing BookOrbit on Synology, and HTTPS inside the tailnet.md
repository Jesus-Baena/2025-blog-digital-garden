---
title: Instalar BookOrbit en Synology y HTTPS dentro de la tailnet
type: post
date: 2026-09-30
tags:
  - stack
  - tutorial
description: Una biblioteca de ebooks autoalojada en el NAS en una tarde. Tres cosas se interpusieron, y una de ellas acabó siendo una pequeña mejora para toda la configuración doméstica.
draft: false
lang: es-ES
source_hash: 15999c0b60c4
---
Durante años mis ebooks han vivido en el NAS como un árbol de carpetas estilo Calibre: carpetas de autor, una carpeta por libro, un EPUB, un archivo `.opf` con los metadatos y una portada. Unos 7.000 libros que solo podía consultar con un gestor de archivos. [BookOrbit](https://github.com/bookorbit/bookorbit) es una biblioteca y lector autoalojado para ebooks, PDF, cómics y audiolibros, con sincronización con KOReader y Kobo, subrayados, notas y catálogo OPDS. Viene con un Docker Compose de dos contenedores (la aplicación más Postgres con pgvector), así que encaja bien en el NAS.

La instalación en sí no tuvo historia. Tres cosas se cruzaron por el camino.

### 1. Las ACL de Synology ignoran tu `chmod 777`

La aplicación arranca como root, corrige la propiedad de su propia carpeta de datos y luego baja a `PUID:PGID` (1000:1000 por defecto). Lo configuré con el usuario administrador del NAS, apunté `/books` a la biblioteca y obtuve `Permission denied`, pese a que la carpeta mostraba `drwxrwxrwx`.

En una carpeta compartida de Synology, el `+` al final de los permisos es lo que de verdad importa. DSM aplica sus propias ACL, y los bits de modo Unix son prácticamente decorativos. La ACL permitía el grupo `administrators` más unos cuantos usuarios nombrados. Mi usuario administrador *sí* está en `administrators`, pero el contenedor renuncia a privilegios con `su-exec` usando solo el grupo primario (`users`), así que el grupo suplementario nunca lo acompaña.

**La solución:** ejecutar el contenedor como un usuario que aparezca nombrado directamente en la ACL del recurso compartido. Compruébalo con `synoacltool -get <carpeta>`, no con `ls -l`.

### 2. «Internal server error» al crear la biblioteca

El formulario de la biblioteca tiene una opción *Watch folder*: detectar los libros nuevos según van llegando. Con ella activada, la petición fallaba con un 500, y el registro decía:

```
ENOSPC: System limit for number of file watchers reached
```

El vigilante coloca una vigilancia inotify en cada directorio. DSM lo limita a 8.192 por usuario, y mi biblioteca tiene unos 24.000 directorios, 7.000 de ellos las propias carpetas de miniaturas `@eaDir` de Synology. La fila de la biblioteca sí se guardó; lo único que falló fue el vigilante.

**La solución:** desactivar *Watch folder* y programar un escaneo periódico en su lugar. Subir el límite del kernel en DSM implica una tarea de root que hay que volver a ejecutar en cada arranque, algo que no compensa para una biblioteca que cambia un par de veces al mes.

### 3. No reinicies el servidor durante el primer escaneo

El primer escaneo de 7.000 libros lleva su tiempo. Reinicié el contenedor a mitad de camino para arreglar el vigilante y obtuve *Failed: Server restarted during scan*. No se perdió nada: los libros ya importados siguieron ahí, y al pulsar *Scan* de nuevo continuó desde ese punto.

### El extra: HTTPS de verdad dentro de la tailnet

Al NAS solo se llega por Tailscale, así que había estado usando BookOrbit en un simple `http://100.x.y.z:3100`. Funcionaba, pero los navegadores solo permiten instalar una aplicación web en la pantalla de inicio del móvil si va por HTTPS.

Lo que se me había escapado durante mucho tiempo: **Tailscale puede servir HTTPS por ti, con un certificado real de Let's Encrypt, en el nombre `*.ts.net` de la máquina.** Un solo comando en el NAS:

```bash
sudo tailscale serve --bg --https=3443 http://127.0.0.1:3100
```

Ahora la biblioteca está en `https://<nas-name>.<tailnet>.ts.net:3443`, sigue siendo accesible solo desde mi tailnet, sin avisos de certificado, y se instala como aplicación en Android.

Algunas notas por si lo pruebas en un Synology:

- **No uses el puerto 443.** El propio servidor web de DSM ya responde en el 443 en las direcciones del NAS. Serve solo captura el puerto que le indiques, así que elige uno libre y deja el resto en paz.
- **Dile a la aplicación su nueva dirección.** BookOrbit solo acepta conexiones de actualización en vivo (progreso del escaneo y demás) desde la dirección indicada en `APP_URL`, así que la URL HTTPS tiene que convertirse en la canónica.
- **Los certificados son públicos.** Todos los certificados de Let's Encrypt se publican en los registros de transparencia de certificados, así que el nombre de tu máquina y el de tu tailnet quedan a la vista. Nadie gana acceso por ello, pero conviene saberlo antes de poner nombre a las máquinas.

Me gustó tanto que esa misma tarde DSM e Immich recibieron el mismo tratamiento, cada uno en su propio puerto. El aviso del certificado autofirmado de DSM por fin ha desaparecido.

### Leer en el móvil

BookOrbit expone un catálogo OPDS en `/api/v1/opds`, con sus propias contraseñas por aplicación. En Moon+ Reader: *Net Library → Add*, pegas la URL y listo. El inconveniente es que OPDS va en un solo sentido: Moon+ descarga los libros, pero tu posición de lectura y tus subrayados se quedan en Moon+. Para que el progreso se sincronice de vuelta, usa el lector propio de BookOrbit (que admite subrayados y notas, y los exporta a Markdown) o KOReader, que es el siguiente de la lista para el Kindle.
