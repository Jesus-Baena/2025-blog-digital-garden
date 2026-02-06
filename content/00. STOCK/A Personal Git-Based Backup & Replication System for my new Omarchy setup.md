---
title: A Personal Git-Based Backup & Replication System for my new Omarchy setup
draft: false
tags:
---


## A Personal Git-Based Backup & Replication System for my new Omarchy setup

As an Arch Linux user (btw), you know the power of granular control – and the pain of starting from scratch. While tools like `omarchy` offer snapshot capabilities, I wanted a robust, version-controlled system for my personal configuration ("dotfiles") that lives alongside my data backups and makes reproducing my exact setup on any new machine incredibly easy.

This tutorial will walk you through setting up a powerful, private Git-based backup and replication system for your Arch Linux dotfiles, securely hosted on your Synology NAS using Gitea.

**Note:** This guide focuses solely on backing up **configuration files and application lists**. Your personal data like `Pictures`, `Documents`, `and Music` should be handled by a dedicated sync solution, such as **Synology Drive**, as I do.


### The Core Concept

We will use a "bare" Git repository to track config files (dotfiles) scattered across our home directory. We'll host this repository on a private **Gitea** server, which will run in a Docker container on a **Synology NAS**. We'll even automate the backup process using `systemd`.

-----

### Part 1: Set Up Your Private Gitea Server on Synology NAS

This will be the central hub for your backups.

1.  **Prepare Synology NAS Storage:**

      * Open **File Station** and create a new folder at `/volume1/docker/gitea-data`. This will permanently store all your Git repositories.
      * Find your User ID (UID/GID) by SSH-ing into your NAS and running `id your_username`. Note the `uid` (e.g., `1026`) and `gid` (e.g., `100`).

2.  **Add Gitea to `docker-compose.yml`:**

      * Open your NAS's `docker-compose.yml` file and add the following service block.

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

3.  **Deploy and Configure Gitea:**

      * Run `docker-compose up -d` to start the new container.
      * Find your NAS's **Tailscale IP** (or local IP if you're on the LAN, e.g., `192.168.10.98`).
      * Open a browser and go to `http://<YOUR_NAS_IP>:3000`.
      * On the "Initial Configuration" page, set the following:
          * **Database Type:** `SQLite3` (perfectly fine for this).
          * **Server Domain:** Your NAS IP (e.g., `192.168.10.98` or your Tailscale IP).
          * **SSH Server Port:** **`2222`** (This is critical).
          * **Gitea Base URL:** `http://<YOUR_NAS_IP>:3000/`.
      * Create your admin account and complete the installation.
      * Log in and create a new **private** repository (e.g., `omarchy-system-config`).

-----

### Part 2: Configure Your MAIN Machine (The Backup Source)

This is the most important part, where we set up the backup system correctly from the start.

1.  **Install Tools:**

    ```bash
    sudo pacman -S git lazygit
    ```

2.  **Set Up SSH Key:**

      * Generate a new key: `ssh-keygen -t ed25519 -C "main-arch-machine"`
      * Copy the **public** key: `cat ~/.ssh/id_ed25519.pub`
      * In Gitea, go to **Settings \> SSH / GPG Keys** and paste your public key.

3.  **Create the Bare Repository:**

    ```bash
    git init --bare $HOME/.dotfiles
    ```

4.  **Create Your Shell Aliases (The Correct Way):**

      * Add these aliases to your shell's config file (`~/.bashrc` or `~/.zshrc`). This command block handles special characters and uses the portable `$HOME` variable.

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

      * Reload your shell to activate them: `source ~/.bashrc`

5.  **Connect to Gitea:**

      * Get the SSH URL from your Gitea repository page.

    <!-- end list -->

    ```bash
    config remote add origin ssh://git@<YOUR_NAS_IP>:2222/your_user/your_repo.git
    ```

6.  **Create the Perfect `.gitignore`:**

      * We will use the `info/exclude` file for our rules. This is the key to making the system work recursively.

    <!-- end list -->

    ```bash
    nano ~/.dotfiles/info/exclude
    ```

      * Paste the following **complete** ruleset. This tells Git to ignore everything by default, then makes specific, recursive exceptions for what we want to back up.

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

      * Save the file.

7.  **Do the First Push:**

      * Copy the rules to a tracked `.gitignore` file: `cp ~/.dotfiles/info/exclude ~/.gitignore`
      * Generate your package lists: `update-pkgs`
      * Add all your tracked files: `config add -A`
      * Commit your files: `config commit -m "Initial commit of dotfiles"`
      * Push and set the upstream branch. **Note:** Your Gitea branch is likely named `master`.
        ```bash
        config push --set-upstream origin master
        ```
      * When prompted to trust the SSH key, type **`yes`** and press Enter.

-----

### Part 3: Automate Daily Backups

Now, let's set up the `systemd` timer for your daily "safety net" backup.

1.  **Create the Backup Script:**

    ```bash
    nano ~/.local/bin/backup-system-config.sh
    ```

      * Paste this content (note the `Qenq`/`Qemq` flags):

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

      * Save and make it executable: `chmod +x ~/.local/bin/backup-system-config.sh`

2.  **Create the `systemd` Service:**

    ```bash
    mkdir -p ~/.config/systemd/user/
    nano ~/.config/systemd/user/system-backup.service
    ```

      * Paste this:

    <!-- end list -->

    ```ini
    [Unit]
    Description=Backup system dotfiles to Gitea

    [Service]
    Type=oneshot
    ExecStart=%h/.local/bin/backup-system-config.sh
    ```

3.  **Create the `systemd` Timer:**

    ```bash
    nano ~/.config/systemd/user/system-backup.timer
    ```

      * Paste this (runs daily at midnight):

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

4.  **Add the Timer to Git & Activate:**

      * **Crucial Step:** Add your new `systemd` files to the backup\!
        ```bash
        config add ~/.config/systemd/
        config commit -m "feat: add systemd automation files"
        config push
        ```
      * Enable the timer on your main machine:
        ```bash
        systemctl --user daemon-reload
        systemctl --user enable --now system-backup.timer
        ```

-----

### Part 4: The Payoff\! Replicating on a NEW Machine

This is the moment of truth. On a fresh Arch Linux installation, follow these steps.

1.  **Initial Setup:**

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

2.  **Connect to Gitea:**

      * Generate a new SSH key: `ssh-keygen -t ed25519`
      * Copy the public key: `cat ~/.ssh/id_ed25519.pub`
      * Add this new key to your Gitea account settings.
      * Connect the remote:
        ```bash
        config remote add origin ssh://git@<YOUR_NAS_IP>:2222/your_user/your_repo.git
        ```

3.  **Force Checkout Your Config:**

      * A new system has default dotfiles. Git will complain. We'll forcefully overwrite them with our backed-up versions.

    <!-- end list -->

    ```bash
    config checkout -f master
    ```

    *(Use `master` or whatever your branch name is. All your custom files, fonts, and icons will now appear\!)*

4.  **Restore All Your Software:**

      * **Sync Repos:** First, sync your new machine's package database.
        ```bash
        sudo pacman -Syu
        ```
      * **Install `yay`:**
        ```bash
        sudo pacman -S --needed base-devel git
        git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si && cd ..
        ```
      * **Install from Lists:** We use `awk` to strip version numbers, just in case your old lists still have them. This is the most robust command.
        ```bash
        # Install official packages
        awk '{print $1}' ~/.local/state/pkglist_pacman.txt | sudo pacman -S --needed -

        # Install AUR packages
        awk '{print $1}' ~/.local/state/pkglist_aur.txt | yay -S --needed -
        ```

5.  **Activate Automated Backup:**

      * Your timer files were restored, but they aren't active. Let's enable them.

    <!-- end list -->

    ```bash
    systemctl --user daemon-reload
    systemctl --user enable --now system-backup.timer
    ```

      * Verify it's running: `systemctl --user list-timers`

-----

### Part 5: Living With Your System (Maintenance)

  * **How to Add New Software:**

    1.  Install it: `sudo pacman -S new-app`
    2.  Update your list: `update-pkgs`
    3.  Back it up: `lazydots`, stage the `pkglist` files, commit, and push.

  * **How to Add a New Webapp:**

    1.  Create the webapp in your browser.
    2.  Back it up: `lazydots`, stage the new `.desktop` file, commit, and push.

  * **Handling Missing Icons:**

      * Your webapp shortcuts (`.desktop` files) may link to icons.
      * **Solution:** Place all your custom icon files in `~/.local/share/icons/`. Our `.gitignore` is already set up to find them. Just run `lazydots` to add, commit, and push them.

  * **What About Deleted Apps?**

      * This backup is **additive**. If you restore to a new machine, it won't uninstall default apps (like `nano` or `vi`) that aren't in your list.
      * **Solution:** This is a minor, one-time manual cleanup. `sudo pacman -Rns unwanted-package`.

You now have a complete, secure, and automated system for replicating your perfect Arch Linux environment anywhere. Congratulations\!