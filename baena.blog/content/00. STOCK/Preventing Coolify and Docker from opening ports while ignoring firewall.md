---
title: Preventing Coolify and Docker from opening ports while ignoring firewall
draft:
tags:
---

## The problem. 
By default Docker will open ports ignoring the *internal* server firewall rules (such as *ufw*). Typical solution is to set *external* firewall rules through your VPS provider. But some providers do not offer this type of protection (or they charge you handsomely for it).

![[Pasted image 20250818084633.png]]

**You definitely don't want that.** 

## The solution

There are several options. One being to stop Docker completely to open ports on its on, writing the docker iptables rules **before you install docker.** 

```
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

✅ Add the following content and save the file:

```
        {
          "iptables": false
        }
```

But this one didn't work for me, Docker + Coolify are too stubborn. The best way forward is as follows. 

##### Workaround to avoid exposing public IP: routing to internal IP.
**Once you have set your domain to access Coolify GUI.** You can edit these docker compose files to route them to your internal IP. 

You have to edit the `docker-compose.prod.yml` file **to add the `127.0.0.1` binding.**

1.  Make sure you are in the `/data/coolify/source` directory.
2.  Open the production configuration file for editing:

    ```bash
    nano docker-compose.prod.yml
    ```

3.  Go to the `ports:` section. It currently looks like this:

    ```yaml
    ports:
      - "${APP_PORT:-8000}:8080"
    ```

4.  Modify that line by adding `127.0.0.1:` to the very beginning, inside the quotes. The variable `${APP_PORT:-8000}` will still work perfectly.

    ```yaml
    ports:
      - "127.0.0.1:${APP_PORT:-8000}:8080"
    ```


> [!NOTE] Using Tailscale
> If you prefer to access your Coolify instance through a mesh VPN such as [[Tailscale]] (my recommendation), you have to add this line: 
> 
```
> For Tailscale Access (Primary remote access)
  - "1xx.8x.2xx.2x:${SOKETI_PORT:-8000}:8080"
```


5.  Leave the `expose:` section completely unchanged.

![[Screenshot 2025-08-18 091255.png]]

6. Same applies for the port mappings for the real-time service 

```
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

7.  Save the file and exit (`Ctrl+X`, `Y`, `Enter`).

8.  **Restart the services** using the command that loads both files. This will apply your change.

    ```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate

    ```

