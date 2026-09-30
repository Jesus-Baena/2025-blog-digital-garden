---
title: Un sistema personal de copia de seguridad y replicación basado en Git para mi nueva configuración Omarchy
type: post
date: 2025-10-03
tags:
  - stack
  - tutorial
draft: false
created: 2025-10-21
modified: 2026-02-06
lang: es-ES
aliases:
  - "es/00. STOCK/A Personal Git-Based Backup & Replication System for my new Omarchy setup"
---
## Un sistema personal de copia de seguridad y replicación basado en Git para mi nueva configuración Omarchy

Como usuario de Arch Linux (por cierto), conoces el poder del control granular, y el dolor de empezar desde cero. Aunque herramientas como `omarchy` ofrecen funciones de instantáneas (snapshots), yo quería un sistema robusto y controlado por versiones para mi configuración personal ("dotfiles") que conviviera con mis copias de seguridad de datos y que hiciera increíblemente fácil reproducir mi configuración exacta en cualquier máquina nueva.

Este tutorial te guiará por la creación de un potente sistema privado de copia de seguridad y replicación basado en Git para tus dotfiles de Arch Linux, alojado de forma segura en tu NAS de Synology usando Gitea.

**Nota:** Esta guía se centra únicamente en hacer copia de seguridad de **archivos de configuración y listas de aplicaciones**. Tus datos personales como `Pictures`, `Documents`, `and Music` deberían gestionarse con una solución de sincronización específica, como **Synology Drive**, tal como hago yo.


### El concepto central

Usaremos un repositorio Git "bare" (vacío) para hacer seguimiento de los archivos de configuración (dotfiles) repartidos por nuestro directorio personal. Alojaremos este repositorio en un servidor privado de **Gitea**, que se ejecutará en un contenedor Docker sobre un **NAS de Synology**. Incluso automatizaremos el proceso de copia de seguridad usando `systemd`.

-----

### Parte 1: Configura tu servidor privado de Gitea en el NAS de Synology

Este será el centro neurálgico de tus copias de seguridad.

1.  **Prepara el almacenamiento del NAS de Synology:**

      * Abre **File Station** y crea una nueva carpeta en `/volume1/docker/gitea-data`. Aquí se almacenarán permanentemente todos tus repositorios Git.
      * Averigua tu ID de usuario (UID/GID) conectándote por SSH a tu NAS y ejecutando `id your_username`. Anota el `uid` (p. ej., `1026`) y el `gid` (p. ej., `100`).

2.  **Añade Gitea a `docker-compose.yml`:**

      * Abre el archivo `docker-compose.yml` de tu NAS y añade el siguiente bloque de servicio.

    <!-- end list -->

    ```yaml
    # --- Gitea Git Server ---
      gitea:
        image: gitea/gitea:latest
        container_name: gitea-server
        restart: unless-stopped
        networks:
          - nas-network # Or your existing Docker network
        ports:
          - "3000:3000"   # Gitea Web UI
          - "2222:22"     # Gitea SSH (Cannot use 22, as the NAS host uses it!)
        volumes:
          - /volume1/docker/gitea-data:/data
        environment:
          - TZ=${TZ}
          - USER_UID=1026 # <-- Change to your UID
          - USER_GID=100  # <-- Change to your GID
    ```

3.  **Despliega y configura Gitea:**

      * Ejecuta `docker-compose up -d` para arrancar el nuevo contenedor.
      * Averigua la **IP de Tailscale** de tu NAS (o la IP local si estás en la LAN, p. ej., `192.168.10.98`).
      * Abre un navegador y ve a `http://<YOUR_NAS_IP>:3000`.
      * En la página de "Configuración inicial", establece lo siguiente:
          * **Tipo de base de datos:** `SQLite3` (perfectamente válido para esto).
          * **Dominio del servidor:** la IP de tu NAS (p. ej., `192.168.10.98` o tu IP de Tailscale).
          * **Puerto del servidor SSH:** **`2222`** (esto es crítico).
          * **URL base de Gitea:** `http://<YOUR_NAS_IP>:3000/`.
      * Crea tu cuenta de administrador y completa la instalación.
      * Inicia sesión y crea un nuevo repositorio **privado** (p. ej., `omarchy-system-config`).

-----

### Parte 2: Configura tu máquina PRINCIPAL (el origen de la copia de seguridad)

Esta es la parte más importante, donde configuramos el sistema de copia de seguridad correctamente desde el principio.

1.  **Instala las herramientas:**

    ```bash
    sudo pacman -S git lazygit
    ```

2.  **Configura la clave SSH:**

      * Genera una nueva clave: `ssh-keygen -t ed25519 -C "main-arch-machine"`
      * Copia la clave **pública**: `cat ~/.ssh/id_ed25519.pub`
      * En Gitea, ve a **Settings \> SSH / GPG Keys** y pega tu clave pública.

3.  **Crea el repositorio bare (vacío):**

    ```bash
    git init --bare $HOME/.dotfiles
    ```

4.  **Crea tus alias de shell (la forma correcta):**

      * Añade estos alias al archivo de configuración de tu shell (`~/.bashrc` o `~/.zshrc`). Este bloque de comandos maneja los caracteres especiales y utiliza la variable portable `$HOME`.

    <!-- end list -->

    ```bash
    cat << 'EOF' >> ~/.bashrc

    # --- Custom Aliases for Dotfiles Backup ---
    # Use the bare repo for dotfiles
    alias config='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
    # Use lazygit with the bare repo
    alias lazydots='lazygit --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
    # Update package lists (no version numbers, 'q' flag)
    alias update-pkgs='pacman -Qenq > $HOME/.local/state/pkglist_pacman.txt && pacman -Qemq > $HOME/.local/state/pkglist_aur.txt && echo "✅ Package lists updated!"'
    EOF
    ```

      * Recarga tu shell para activarlos: `source ~/.bashrc`

5.  **Conéctate a Gitea:**

      * Obtén la URL SSH desde la página de tu repositorio de Gitea.

    <!-- end list -->

    ```bash
    config remote add origin ssh://git@<YOUR_NAS_IP>:2222/your_user/your_repo.git
    ```

6.  **Crea el `.gitignore` perfecto:**

      * Usaremos el archivo `info/exclude` para nuestras reglas. Esta es la clave para que el sistema funcione de forma recursiva.

    <!-- end list -->

    ```bash
    nano ~/.dotfiles/info/exclude
    ```

      * Pega el siguiente conjunto de reglas **completo**. Esto le indica a Git que ignore todo por defecto y, después, hace excepciones específicas y recursivas para lo que queremos respaldar.

    <!-- end list -->

    ```gitignore
    # --- Main Rules ---
    # 1. For security, always ignore all .env files.
    *.env

    # 2. Ignore everything in the home directory by default.
    *

    # --- EXCEPTIONS ---
    # Now, explicitly UN-ignore the specific files and folders we want to track.

    # Individual dotfiles
    !/.bash_profile
    !/.bashrc
    !/.gitconfig
    !/.gitignore

    # Main .config directory and its contents recursively
    !/.config/
    !/.config/**

    # .local directory structure and its contents recursively
    !/.local/
    !/.local/bin/
    !/.local/bin/**
    !/.local/share/
    !/.local/share/applications/
    !/.local/share/applications/**
    !/.local/share/fonts/
    !/.local/share/fonts/**
    !/.local/share/icons/
    !/.local/share/icons/**
    !/.local/state/
    !/.local/state/pkglist_pacman.txt
    !/.local/state/pkglist_aur.txt
    ```

      * Guarda el archivo.

7.  **Realiza el primer push:**

      * Copia las reglas a un archivo `.gitignore` con seguimiento: `cp ~/.dotfiles/info/exclude ~/.gitignore`
      * Genera tus listas de paquetes: `update-pkgs`
      * Añade todos tus archivos con seguimiento: `config add -A`
      * Confirma tus archivos: `config commit -m "Initial commit of dotfiles"`
      * Haz push y establece la rama upstream. **Nota:** Tu rama de Gitea probablemente se llame `master`.
        ```bash
        config push --set-upstream origin master
        ```
      * Cuando se te pida confiar en la clave SSH, escribe **`yes`** y pulsa Intro.

-----

### Parte 3: Automatiza las copias de seguridad diarias

Ahora vamos a configurar el temporizador de `systemd` para tu copia de seguridad diaria de "red de seguridad".

1.  **Crea el script de copia de seguridad:**

    ```bash
    nano ~/.local/bin/backup-system-config.sh
    ```

      * Pega este contenido (fíjate en los flags `Qenq`/`Qemq`):

    <!-- end list -->

    ```bash
    #!/bin/bash
    cd "$HOME" || exit
    alias config='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'

    STATE_DIR="$HOME/.local/state"
    mkdir -p "$STATE_DIR"

    # Update package lists (quiet, no versions)
    pacman -Qenq > "$STATE_DIR/pkglist_pacman.txt"
    pacman -Qemq > "$STATE_DIR/pkglist_aur.txt"

    # Add lists and any other modified files
    config add "$STATE_DIR/pkglist_pacman.txt"
    config add "$STATE_DIR/pkglist_aur.txt"
    config add -u

    # Commit and push only if there are changes
    if ! config diff-index --quiet HEAD --; then
        config commit -m "chore(backup): automated system sync"
        config push origin main
    fi
    ```

      * Guarda y hazlo ejecutable: `chmod +x ~/.local/bin/backup-system-config.sh`

2.  **Crea el servicio de `systemd`:**

    ```bash
    mkdir -p ~/.config/systemd/user/
    nano ~/.config/systemd/user/system-backup.service
    ```

      * Pega esto:

    <!-- end list -->

    ```ini
    [Unit]
    Description=Backup system dotfiles to Gitea

    [Service]
    Type=oneshot
    ExecStart=%h/.local/bin/backup-system-config.sh
    ```

3.  **Crea el temporizador de `systemd`:**

    ```bash
    nano ~/.config/systemd/user/system-backup.timer
    ```

      * Pega esto (se ejecuta a diario a medianoche):

    <!-- end list -->

    ```ini
    [Unit]
    Description=Run system dotfiles backup daily

    [Timer]
    OnCalendar=daily
    Persistent=true

    [Install]
    WantedBy=timers.target
    ```

4.  **Añade el temporizador a Git y actívalo:**

      * **Paso crucial:** ¡Añade tus nuevos archivos de `systemd` a la copia de seguridad\!
        ```bash
        config add ~/.config/systemd/
        config commit -m "feat: add systemd automation files"
        config push
        ```
      * Activa el temporizador en tu máquina principal:
        ```bash
        systemctl --user daemon-reload
        systemctl --user enable --now system-backup.timer
        ```

-----

### Parte 4: ¡La recompensa\! Replicar en una máquina NUEVA

Este es el momento de la verdad. En una instalación limpia de Arch Linux, sigue estos pasos.

1.  **Configuración inicial:**

    ```bash
    sudo pacman -S git
    git init --bare $HOME/.dotfiles
    # Add the aliases to .bashrc (or .zshrc)
    cat << 'EOF' >> ~/.bashrc
    alias config='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
    alias lazydots='lazygit --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
    alias update-pkgs='pacman -Qenq > $HOME/.local/state/pkglist_pacman.txt && pacman -Qemq > $HOME/.local/state/pkglist_aur.txt && echo "✅ Package lists updated!"'
    EOF
    source ~/.bashrc
    ```

2.  **Conéctate a Gitea:**

      * Genera una nueva clave SSH: `ssh-keygen -t ed25519`
      * Copia la clave pública: `cat ~/.ssh/id_ed25519.pub`
      * Añade esta nueva clave a la configuración de tu cuenta de Gitea.
      * Conecta el remoto:
        ```bash
        config remote add origin ssh://git@<YOUR_NAS_IP>:2222/your_user/your_repo.git
        ```

3.  **Fuerza el checkout de tu configuración:**

      * Un sistema nuevo tiene dotfiles por defecto. Git se quejará. Los sobrescribiremos a la fuerza con nuestras versiones respaldadas.

    <!-- end list -->

    ```bash
    config checkout -f master
    ```

    *(Usa `master` o el nombre que tenga tu rama. ¡Todos tus archivos personalizados, fuentes e iconos aparecerán ahora\!)*

4.  **Restaura todo tu software:**

      * **Sincroniza los repositorios:** Primero, sincroniza la base de datos de paquetes de tu nueva máquina.
        ```bash
        sudo pacman -Syu
        ```
      * **Instala `yay`:**
        ```bash
        sudo pacman -S --needed base-devel git
        git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si && cd ..
        ```
      * **Instala desde las listas:** Usamos `awk` para eliminar los números de versión, por si tus listas antiguas todavía los tuvieran. Este es el comando más robusto.
        ```bash
        # Install official packages
        awk '{print $1}' ~/.local/state/pkglist_pacman.txt | sudo pacman -S --needed -

        # Install AUR packages
        awk '{print $1}' ~/.local/state/pkglist_aur.txt | yay -S --needed -
        ```

5.  **Activa la copia de seguridad automatizada:**

      * Tus archivos de temporizador se restauraron, pero no están activos. Vamos a habilitarlos.

    <!-- end list -->

    ```bash
    systemctl --user daemon-reload
    systemctl --user enable --now system-backup.timer
    ```

      * Verifica que esté en marcha: `systemctl --user list-timers`

-----

### Parte 5: Convivir con tu sistema (Mantenimiento)

  * **Cómo añadir software nuevo:**

    1.  Instálalo: `sudo pacman -S new-app`
    2.  Actualiza tu lista: `update-pkgs`
    3.  Haz la copia de seguridad: `lazydots`, prepara los archivos `pkglist`, haz commit y push.

  * **Cómo añadir una nueva webapp:**

    1.  Crea la webapp en tu navegador.
    2.  Haz la copia de seguridad: `lazydots`, prepara el nuevo archivo `.desktop`, haz commit y push.

  * **Cómo manejar iconos que faltan:**

      * Tus accesos directos de webapp (archivos `.desktop`) pueden enlazar a iconos.
      * **Solución:** Coloca todos tus archivos de iconos personalizados en `~/.local/share/icons/`. Nuestro `.gitignore` ya está configurado para encontrarlos. Solo ejecuta `lazydots` para añadirlos, hacer commit y push.

  * **¿Y las apps eliminadas?**

      * Esta copia de seguridad es **aditiva**. Si restauras en una máquina nueva, no desinstalará las apps por defecto (como `nano` o `vi`) que no estén en tu lista.
      * **Solución:** Es una pequeña limpieza manual de una sola vez. `sudo pacman -Rns unwanted-package`.

Ahora tienes un sistema completo, seguro y automatizado para replicar tu entorno perfecto de Arch Linux en cualquier lugar. ¡Enhorabuena\!
