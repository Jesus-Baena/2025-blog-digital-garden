---
title: Evitar que Coolify y Docker abran puertos ignorando el cortafuegos
type: post
date: 2025-07-10
tags:
  - stack
  - tutorial
created: 2025-08-18
modified: 2026-02-03
lang: es-ES
aliases:
  - "es/00. STOCK/Preventing Coolify and Docker from opening ports while ignoring firewall"
source_hash: a1874423da1f
---
## El problema.
Por defecto, Docker abre puertos ignorando las reglas del cortafuegos *interno* del servidor (como *ufw*). La solución habitual es establecer reglas de cortafuegos *externas* a través de tu proveedor de VPS. Pero algunos proveedores no ofrecen este tipo de protección (o te la cobran a precio de oro).

![[Pasted image 20250818084633.png]]

**Desde luego eso no es lo que quieres.**

## La solución

Hay varias opciones. Una es impedir por completo que Docker abra puertos por su cuenta, escribiendo las reglas de iptables de docker **antes de instalar docker.**

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

✅ Añade el siguiente contenido y guarda el archivo:

```json
        {
          "iptables": false
        }
```

Pero esto a mí no me funcionó, Docker + Coolify son demasiado tozudos. La mejor forma de avanzar es la siguiente.

##### Solución alternativa para evitar exponer la IP pública: enrutar a la IP interna.
**Una vez que hayas configurado tu dominio para acceder a la interfaz gráfica de Coolify.** Puedes editar estos archivos docker compose para enrutarlos a tu IP interna.

Tienes que editar el archivo `docker-compose.prod.yml` **para añadir el enlace a `127.0.0.1`.**

1.  Asegúrate de estar en el directorio `/data/coolify/source`.
2.  Abre el archivo de configuración de producción para editarlo:

    ```bash
    nano docker-compose.prod.yml
    ```

3.  Ve a la sección `ports:`. Actualmente tiene este aspecto:

    ```yaml
    ports:
      - "${APP_PORT:-8000}:8080"
    ```

4.  Modifica esa línea añadiendo `127.0.0.1:` justo al principio, dentro de las comillas. La variable `${APP_PORT:-8000}` seguirá funcionando perfectamente.

    ```yaml
    ports:
      - "127.0.0.1:${APP_PORT:-8000}:8080"
    ```


> [!NOTE] Usar Tailscale
> Si prefieres acceder a tu instancia de Coolify a través de una VPN mallada como [[Tailscale]] (mi recomendación), tienes que añadir esta línea:
> 
```yaml
> For Tailscale Access (Primary remote access)
  - "1xx.8x.2xx.2x:${SOKETI_PORT:-8000}:8080"
```


5.  Deja la sección `expose:` completamente sin cambios.

![[Screenshot 2025-08-18 091255.png]]

6. Lo mismo se aplica a los mapeos de puertos del servicio en tiempo real

```yaml
ports:
  # ---- Soketi WebSocket Port (the main one) ----
  # For Localhost Access (Emergency)
  - "127.0.0.1:${SOKETI_PORT:-6001}:6001" 
  # For Tailscale Access (Primary remote access)
  - "1xx.8x.2xx.2x:${SOKETI_PORT:-6001}:6001"

  # ---- Soketi Metrics/API Port (secondary) ----
  # For Localhost Access (Emergency)
  - "127.0.0.1:6002:6002"
  # For Tailscale Access (Primary remote access)
  - "1xx.8x.2xx.2x:6002:6002"
    
	# I still keep local route even using Tailscale, in the (very unlikelly) case Tailscale network fails. 
    
```

7.  Guarda el archivo y sal (`Ctrl+X`, `Y`, `Enter`).

8.  **Reinicia los servicios** usando el comando que carga ambos archivos. Esto aplicará tu cambio.

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate
```

ACTUALIZACIÓN: durante 2025 [[I moved to create my own Docker Swarm]].