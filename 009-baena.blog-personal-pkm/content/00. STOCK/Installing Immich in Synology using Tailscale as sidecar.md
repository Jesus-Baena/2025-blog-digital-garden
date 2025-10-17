---
title: Installing Immich in Synology using Tailscale as sidecar
draft:
tags:
---
# Installing Immich on Synology with Tailscale (and the Errors We Fixed Along the Way)

I am anticipating to Synology killing its photos app. I've been using it for five or six years already, but giving the latest Synology decisions, better to be ready. If you're looking for a way to break free from cloud photo services like Google Photos, the self-hosted solution **Immich** is an incredible alternative. It’s powerful, feature-rich, and puts you in complete control of your data. Running it on a Synology NAS is a popular choice, but how do you access it securely when you're away from home?

The answer is **Tailscale**, a zero-config VPN that creates a secure private network between your devices. By combining Immich, Docker, and Tailscale on a Synology NAS, you can build the ultimate private photo library.

This guide will walk you through the entire setup process, but more importantly, it will cover the real-world troubleshooting steps we encountered. The path wasn't perfectly smooth, but the final result is a robust and secure setup.

### The Goal: A Secure, Accessible Photo Library

Our plan was to use Docker Compose to define and run all the necessary services on the Synology NAS:
1.  **Immich:** The main application, split into several containers (server, microservices, machine learning).
2.  **Postgres & Redis:** The database and cache that Immich depends on.
3.  **Tailscale:** A "sidecar" container that would connect to our Tailnet and act as a secure gateway to the Immich service, without opening any ports on our router.

This all sounds straightforward, but here’s how it actually went.

### Problem 1: The Redis "Manifest Not Found" Error

After creating our initial `compose.yaml` file and starting the project in Synology's Container Manager, most containers started, but one failed immediately: `immich_redis`.

**The Symptom:** The project would fail to build, and the logs for the Redis container showed an error: `cannot find manifest for...`.

**The Cause:** This is a classic CPU architecture mismatch. The original `compose.yaml` file from the Immich documentation specified a Redis image with a unique hash (`redis:6.2-alpine@sha256:...`). This hash points to an image built for a specific architecture (like x86_64, used in most servers). Our Synology NAS, however, runs on an ARM processor. Docker couldn't find an ARM-compatible image at that exact hash, so it failed.

**The Fix:** The solution was simple. We edited the `compose.yaml` file and changed the image name to be more generic:

*   **Before:** `image: redis:6.2-alpine@sha256:32337a71850558c4c8c5c563e52d3a98552f012a4f40cfd6f1a146a495632a4e`
*   **After:** `image: redis:6.2-alpine`

By removing the hash, we allowed Docker to automatically pull the `redis:6.2-alpine` image that matched our Synology's ARM architecture. With that change, all the containers started up.

### Problem 2: Tailscale Was Online, Then Gone

With the Redis issue fixed, all containers turned green in Container Manager. Success! Or so we thought. When we checked our Tailscale admin console, the new machine, `photos`, was offline. Looking closer at Container Manager, we saw the Tailscale container was stuck in a "crash loop"—it would start, run for a few seconds, and then stop.

**The Symptom:** The Tailscale container would not stay running. The logs showed it was "starting" and then "stopped," with messages like `NeedsLogin`.

**The Cause:** Our initial configuration had a `command: tailscaled` line. This command correctly starts the Tailscale background service, but it never tells it to actually log in and connect to the network. The container would start the service, see it had nothing else to do, and shut down.

Our first attempt to fix this was to change the command to `tailscale up`, but this created an even faster crash. We were overriding the container's default startup logic. The real cause was that we were interfering with the image's smart entrypoint script, which is designed to handle the startup and login process automatically.

**The Fix:** The best solution was to trust the container's default behavior. We removed the `command` line from the Tailscale service definition entirely. This allows the container's built-in script to run, read the `TS_AUTHKEY` from the environment, start the daemon, and run `tailscale up` for us.

### Problem 3: The Final Boss - "Unable to Connect"

With the previous fix, victory was in sight. The `photos` machine appeared online in our Tailscale console. We could ping it, and everything looked perfect. But when we navigated to `http://photos:2283` in our browser, we were met with a connection error.

**The Symptom:** We could reach the Tailscale machine itself, but not the Immich service running on the port we expected.

**The Cause:** This is a fundamental concept in container networking. Even though they are in the same project, the `tailscale` container and the `immich-server` container are like two separate computers. Traffic arriving at `photos:2283` was hitting the Tailscale container, which had no instructions to pass it along to the Immich container. It was a dead end.

**The Fix:** We needed to tell Tailscale to act as a proxy.
1.  First, we removed the `ports` section from the `immich-server` in our `compose.yaml`. This is more secure, as it prevents Immich from being exposed on the Synology's local network. Tailscale is now the *only* way in.
2.  Next, we added a special environment variable to the `tailscale` service: `TS_EXTRA_ARGS=--forward-tcp=2283,immich-server:3001`.

This command is the magic key. It instructs the Tailscale container: "When you receive any TCP traffic on your port 2283, forward it directly to the container named `immich-server` on its internal port 3001."

### The Final, Working Configuration

After navigating these challenges, we arrived at a clean, secure, and fully functional setup. Here is the final `compose.yaml` file that ties it all together.

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

Self-hosting can sometimes feel like a puzzle, but troubleshooting is part of the journey. By working through these common issues, we built a fantastic, secure photo service that we can access from anywhere in the world. Hopefully, this experience helps you get your own setup running even faster.