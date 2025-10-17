---
title: A Personal Git-Based Backup & Replication System for my new Omarchy setup
draft:
tags:
---


## A Personal Git-Based Backup & Replication System for my new Omarchy setup

As an Arch Linux user (btw), you know the power of granular control – and the pain of starting from scratch. While tools like `omarchy` offer snapshot capabilities, I wanted a robust, version-controlled system for my personal configuration ("dotfiles") that lives alongside my data backups and makes reproducing my exact setup on any new machine incredibly easy.

This tutorial will walk you through setting up a powerful, private Git-based backup and replication system for your Arch Linux dotfiles, securely hosted on your Synology NAS using Gitea.

**Note:** This guide focuses solely on backing up **configuration files and application lists**. Your personal data like `Pictures`, `Documents`, `and Music` should be handled by a dedicated sync solution, such as **Synology Drive**, as I do.

### The Core Idea

We'll use a "bare" Git repository to track files scattered across your home directory. This allows you to manage dotfiles like any other code project without cluttering your actual folders with `.git` directories. A Gitea server on your Synology NAS will be the central hub, providing a private, secure remote for your backups.

### What We're Backing Up (and Why)

- **`~/.config/`**: The modern home for most application settings (VS Code, Hyprland, Kitty, Transmission, Chromium profiles, etc.).
    
- **`~/.bashrc` / `~/.bash_profile`**: Your shell configurations.
    
- **`~/.gitconfig`**: Your global Git settings (user, email, aliases).
    
- **`~/.local/bin/`**: Custom scripts you've written.
    
- **`~/.local/share/applications/`**: Launcher files for webapps and custom applications.
    
- **`~/.local/share/fonts/`**: Any custom fonts you've installed.
    
- **`~/.local/state/pkglist_pacman.txt`**: A list of all packages you explicitly installed from Arch repositories.
    
- **`~/.local/state/pkglist_aur.txt`**: A list of all packages you explicitly installed from the AUR.
    
- **`~/.gitignore` (tracked copy of `.dotfiles/info/exclude`)**: The rules that tell Git what to ignore and what to track.
    

### Prerequisites

Before we begin, ensure you have:

- A running **Synology NAS** with Docker installed.
    
- **[[Tailscale]]** set up on both your NAS and your Arch Linux machine (for secure remote access).
    
- Basic SSH access to your NAS and Arch machine.
    
- `yay` or another AUR helper installed on your Arch machine.
    

---

### Part 1: Set Up Your Private Gitea Server on Synology NAS

This creates the central "brain" for your backups.

1. **Prepare Synology NAS Storage:**
    
    - Via **File Station**, create a folder: `/volume1/docker/gitea-data`. This will store all your Git repositories persistently.
        
    - **Find your User ID (UID/GID):** SSH into your NAS and run `id your_synology_username`. Note down the `uid` and `gid` (e.g., `uid=1026 gid=100`). You'll need these for the Docker container.
        
2. **Update `docker-compose-nas.yml`:**
    
    - SSH into your NAS and navigate to your `docker-compose.yml` directory (e.g., `/volume1/docker/compose-nas/`).
        
    - Add the following service block for Gitea:
        
    
    YAML
    
    ```
    # --- Gitea Git Server ---
      gitea:
        image: gitea/gitea:latest
        container_name: gitea-server
        restart: unless-stopped
        networks:
          - nas-network # Use your existing Docker network
        ports:
          - "3000:3000"   # Gitea Web UI (Host:Container)
          - "1234:22"     # Gitea SSH (Host:Container - crucial custom port!)
        volumes:
          - /volume1/docker/gitea-data:/data # Persistent data for Gitea
        environment:
          - TZ=${TZ}      # Use your timezone from .env or define here
          - USER_UID=YOUR_NAS_UID # <-- Replace with the UID you found
          - USER_GID=YOUR_NAS_GID # <-- Replace with the GID you found
    ```
    
    - Save the file.
        
3. **Deploy Gitea and Initial Configuration:**
    
    - In your NAS SSH session (still in the `docker-compose` directory), deploy:
        
        Bash
        
        ```
        docker-compose up -d
        ```
        
    - Find your NAS's **Tailscale IP address**. (e.g., `100.1xx.1xx.xxx`).
        
    - Open a web browser on your Arch machine and go to `http://YOUR_NAS_TAILSCALE_IP:3000`.
        
    - On the Gitea "Initial Configuration" page, set:
        
        - **Database Type:** `SQLite3` (Default and fine for this use case).
            
        - **Server Domain:** `YOUR_NAS_TAILSCALE_IP`
            
        - **SSH Server Port:** `1234` (This is critical to avoid conflicts with NAS SSH).
            
        - **Gitea Base URL:** `http://YOUR_NAS_TAILSCALE_IP:3000/`
            
    - Create your admin account and complete the installation.
        
    - Once logged in, create a **new private repository** named `omarchy-system-config` (or similar).
        

---

### Part 2: Configure Your Arch Linux Machine

This part sets up your computer to securely interact with the Gitea server.

1. **Install Necessary Tools:**
    
    Bash
    
    ```
    sudo pacman -S git lazygit
    ```
    
2. **Set Up SSH Key for Passwordless Access:**
    
    - Generate a new SSH key on your Arch machine:
        
        Bash
        
        ```
        ssh-keygen -t ed25519 -C "arch-laptop-key"
        ```
        
        (Press Enter for all prompts to accept defaults).
        
    - Copy the public key to your clipboard:
        
        Bash
        
        ```
        cat ~/.ssh/id_ed25519.pub
        ```
        
    - In the Gitea web interface (on your NAS), go to **Settings > SSH / GPG Keys**, click **Add Key**, and paste your public key there. Give it a descriptive name like "Arch Laptop".
        
3. **Create a "Bare" Git Repository for Dotfiles:**
    
    - This special repository manages files in your home directory without creating visible `.git` folders everywhere.
        
        Bash
        
        ```
        git init --bare $HOME/.dotfiles
        ```
        
4. **Create Your Shell Aliases:**
    
    - These shortcuts (`config`, `lazydots`, `update-pkgs`) are essential for a smooth workflow. Add them to your `~/.bashrc` (or `~/.zshrc` if you use Zsh):
        
        Bash
        
        ```
        cat << 'EOF' >> ~/.bashrc
        # --- Custom Aliases for Dotfiles Backup ---
        alias config='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
        alias lazydots='lazygit --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
        alias update-pkgs='pacman -Qen > ~/.local/state/pkglist_pacman.txt && pacman -Qem > ~/.local/state/pkglist_aur.txt && echo "✅ Package lists updated!"'
        EOF
        ```
        
    - Reload your shell to activate the aliases for the current session:
        
        Bash
        
        ```
        source ~/.bashrc # or source ~/.zshrc
        ```
        
5. **Connect to Your Gitea Server:**
    
    - On your Gitea repository page, copy the SSH clone URL (e.g., `ssh://git@YOUR_NAS_TAILSCALE_IP:1234/your_username/omarchy-system-config.git`).
        
    - Link your local bare repository to this remote:
        
        Bash
        
        ```
        config remote add origin ssh://git@YOUR_NAS_TAILSCALE_IP:1234/your_username/omarchy-system-config.git
        ```
        
    - Verify the connection: `config remote -v`
        

---

### Part 3: Define What Git Should (and Shouldn't) Track

This is crucial for security and to prevent backing up irrelevant data. We'll use a `gitignore` file that ignores almost everything by default, then explicitly allows only your chosen configuration files.

1. **Create Your Central Ignore File:**
    
    - This file lives _inside_ your bare repository.
        
        Bash
        
        ```
        mkdir -p ~/.dotfiles/info # Ensure directory exists
        nano ~/.dotfiles/info/exclude
        ```
        
2. **Paste the Comprehensive Ignore Rules:**
    
    - Replace _all content_ in the `exclude` file with this:
        
    
    Code snippet
    
    ```
    # --- Main Rules ---
    # 1. For security, always ignore all .env files (contains secrets).
    *.env
    
    # 2. Ignore everything in the home directory by default.
    #    We then explicitly UN-ignore only the things we want to track.
    *
    
    # --- EXCEPTIONS (Explicitly UN-ignore these files/folders) ---
    
    # Main configuration folder (covers VS Code, Transmission, Hyprland, etc.)
    !/.config/
    
    # Shell configuration
    !/.bashrc
    !/.bash_profile
    
    # Git global configuration
    !/.gitconfig
    
    # Webapp launchers, package lists, scripts, custom fonts, and their parent folders
    !/.local/
    !/.local/bin/
    !/.local/share/
    !/.local/share/applications/
    !/.local/share/fonts/
    !/.local/state/
    !/.local/state/pkglist_pacman.txt
    !/.local/state/pkglist_aur.txt
    
    # The .gitignore file itself (so it's part of the backup)
    !/.gitignore
    ```
    
    - Save and exit (`Ctrl+X`, `Y`, `Enter`).
        
3. **Create a Tracked Copy of Your `.gitignore`:**
    
    - Git doesn't automatically track `~/.dotfiles/info/exclude`. We copy it to `~/.gitignore` so it's also version-controlled.
        
        Bash
        
        ```
        cp ~/.dotfiles/info/exclude ~/.gitignore
        ```
        

---

### Part 4: Your First Backup and Push

Now, let's get your current system state into the backup!

1. **Generate Your Initial Package Lists:**
    
    - The `update-pkgs` alias will create these in `~/.local/state/`.
        
        Bash
        
        ```
        update-pkgs
        ```
        
2. **Add All Tracked Files to Staging:**
    
    - This command stages all the files and directories that are _not_ ignored by your rules.
        
        Bash
        
        ```
        config add ~/.local/share/fonts ~/.local/bin ~/.gitconfig ~/.local/share/applications ~/.local/state/pkglist_pacman.txt ~/.local/state/pkglist_aur.txt ~/.gitignore ~/.bashrc ~/.bash_profile ~/.config
        ```
        
3. **Perform Your First Commit and Push (Resolving SSH Trust):**
    
    - Launch `lazygit` using your alias:
        
        Bash
        
        ```
        lazydots
        ```
        
    - In the `lazydots` interface:
        
        - Press **`c`** to open the commit window.
            
        - Type your first commit message, e.g., "Initial commit of complete Arch Linux config".
            
        - Press **`Enter`** to confirm the commit.
            
        - Press **`P`** (uppercase P) to push your changes.
            
        - **IMPORTANT:** The first time, Git will ask you if you trust the SSH host. You'll likely see "Permission denied" or "error: src refspec master does not match any". Quit `lazydots` (`q`).
            
        - Back in your terminal, run:
            
            Bash
            
            ```
            config push --set-upstream origin master
            ```
            
            - You will be asked: `Are you sure you want to continue connecting (yes/no/[fingerprint])?`
                
            - Type **`yes`** and press **Enter**.
                
        - The push will complete successfully.
            
    - Verify by logging into Gitea on your NAS – you'll see all your configuration files there!
        

---

### Part 5: Automate Daily Backups

Ensure your system automatically backs itself up every day using `systemd`.

1. **Create the Backup Script:**
    
    - This script updates package lists and pushes changes.
        
        Bash
        
        ```
        mkdir -p ~/.local/bin
        nano ~/.local/bin/backup-system-config.sh
        ```
        
    - Paste this content:
        
        Bash
        
        ```
        #!/bin/bash
        cd "$HOME" || exit
        alias config='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
        
        # Hidden location for package lists
        STATE_DIR="$HOME/.local/state"
        mkdir -p "$STATE_DIR"
        
        # Update package lists in the new location
        pacman -Qen > "$STATE_DIR/pkglist_pacman.txt"
        pacman -Qem > "$STATE_DIR/pkglist_aur.txt"
        
        # Add package lists and any other modified dotfiles
        config add "$STATE_DIR/pkglist_pacman.txt"
        config add "$STATE_DIR/pkglist_aur.txt"
        config add -u
        
        # Commit and push only if there are changes
        if ! config diff-index --quiet HEAD --; then
            config commit -m "chore(backup): automated system sync $(date +'%Y-%m-%d %H:%M:%S')"
            config push origin main
        fi
        ```
        
    - Save and exit. Make it executable: `chmod +x ~/.local/bin/backup-system-config.sh`
        
2. **Create the `systemd` Service File:**
    
    - `systemd` uses this to understand how to run your script.
        
        Bash
        
        ```
        mkdir -p ~/.config/systemd/user/
        nano ~/.config/systemd/user/system-backup.service
        ```
        
    - Paste this:
        
        Ini, TOML
        
        ```
        [Unit]
        Description=Backup system dotfiles to Gitea
        
        [Service]
        Type=oneshot
        ExecStart=%h/.local/bin/backup-system-config.sh
        ```
        
    - Save and exit.
        
3. **Create the `systemd` Timer File:**
    
    - This tells `systemd` _when_ to run your service.
        
        Bash
        
        ```
        nano ~/.config/systemd/user/system-backup.timer
        ```
        
    - Paste this (runs daily at midnight):
        
        Ini, TOML
        
        ```
        [Unit]
        Description=Run system dotfiles backup daily
        
        [Timer]
        OnCalendar=daily
        Persistent=true
        
        [Install]
        WantedBy=timers.target
        ```
        
    - Save and exit.
        
4. **Enable and Start the Timer:**
    
    - Tell `systemd` to pick up your new files: `systemctl --user daemon-reload`
        
    - Activate the timer: `systemctl --user enable --now system-backup.timer`
        
    - Verify it's active: `systemctl --user list-timers` (You should see it scheduled for tomorrow's midnight).
        

---

### Part 6: Your Day-to-Day Workflow

- **Manual Backup (After significant changes):**
    
    1. Make your changes (e.g., configure a new app).
        
    2. Run `update-pkgs` to refresh package lists.
        
    3. Run `lazydots`, stage any new/modified files, commit (`c`), and push (`P`).
        
- **Automated Backup (Daily Safety Net):**
    
    - Runs silently every night at midnight. You don't need to do anything.
        

---

### Part 7: How to Recover/Replicate Your System on a New Machine

This is the ultimate payoff! On a fresh Arch Linux installation:

1. **Install Git & Create Bare Repo + Aliases:**
    
    - Bash
        
        ```
          sudo pacman -S git
          git init --bare $HOME/.dotfiles
          cat << 'EOF' >> ~/.bashrc # or ~/.zshrc
          # --- Custom Aliases for Dotfiles Backup ---
          alias config='/usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
          alias lazydots='lazygit --git-dir=$HOME/.dotfiles/ --work-tree=$HOME'
          alias update-pkgs='pacman -Qen > ~/.local/state/pkglist_pacman.txt && pacman -Qem > ~/.local/state/pkglist_aur.txt && echo "✅ Package lists updated!"'
          EOF
          source ~/.bashrc # or ~/.zshrc
        ```
        
2. **Add New Machine's SSH Key to Gitea.** (Same as Part 2, Step 2).
    
3. **Connect & Pull Your Config:**
    
    - Bash
        
        ```
          config remote add origin ssh://git@YOUR_NAS_TAILSCALE_IP:1234/your_username/omarchy-system-config.git
          config pull origin main
        ```
        
    - You may encounter and resolve minor conflicts with default files (e.g., `.bashrc`).
        
4. **Restore All Your Software:**
    
    - Install `yay` (or your AUR helper) if you need AUR packages:
        
        Bash
        
        ```
        # Example for installing yay
        sudo pacman -S --needed base-devel git
        git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si && cd ..
        ```
        
    - Install from official repos:
        
        Bash
        
        ```
        sudo pacman -S --needed - < ~/.local/state/pkglist_pacman.txt
        ```
        
    - Install from AUR:
        
        Bash
        
        ```
        yay -S --needed - < ~/.local/state/pkglist_aur.txt
        ```
        
5. **Activate Automated Backup:**
    
    - Bash
        
        ```
          systemctl --user daemon-reload
          systemctl --user enable --now system-backup.timer
          systemctl --user list-timers # Verify
        ```
        

Congratulations! Your new machine is now a complete, personalized clone of your previous setup, fully backed up and ready to go. You've truly mastered your Arch Linux environment.
