---
title: Ghost Terminals and Broken Symlinks on Omarchy
draft:
tags:
  - tech
  - tutorial
---
Loving the Omarchy project, but occasionally, things break in interesting ways. Recently, my setup (running on the "Omarchy" dotfiles) started misbehaving. I was dealing with two annoying issues: my configuration menus wouldn't open, and Neovim was throwing cryptic errors.

Here is a breakdown of what went wrong and how we fixed it.

## 1. The Case of the Missing Settings Window

**The Problem:** Every time I tried to open a configuration file from my system menu (like "Monitors" or "Keybindings"), I’d get a notification saying _"Editing monitors.conf..."_, but nothing would happen. No window appeared. It felt like the command was being sent into a void.

**The Investigation:** The issue wasn't the menu itself, but how it tried to launch the text editor. The system scripts were using a command that looked something like this:

```bash
xdg-terminal-exec --app-id=org.omarchy.editor -e nvim ...
```

The script was trying to launch my terminal with a specific `--app-id` so the window manager (Hyprland) could apply specific styling rules (like making it a floating window).

**The Root Cause:** My default terminal is **Alacritty**. While many Wayland terminals support the `--app-id` flag, Alacritty does not. It strictly uses `--class` to define window properties. Because Alacritty didn't understand the flag the script was sending, it just failed silently.

**The Fix:** Instead of rewriting all the system scripts, we created a "wrapper" for `xdg-terminal-exec`. This script intercepts the command, checks for the `--app-id` flag, and translates it into the `--class` flag that Alacritty understands.

Now, when the system asks for an app ID, Alacritty gets a class name, and my settings windows open perfectly.

## 2. The Neovim "treesitte" Mystery

**The Problem:** Neovim is my daily driver, but it started greeting me with a bizarre error message: `.../lua/vim/treesitte"tab" ^`. It looked like a typo in the source code—"treesitte" instead of "treesitter"—but searching the code revealed no such typo.

**The Investigation:** We ran `:checkhealth`, which reported that the `nvim-treesitter` plugin was completely broken. Reinstalling the plugin didn't help immediately.

We dug deeper into the Neovim data directories and found the culprit in `~/.local/share/nvim/site/queries`.

**The Root Cause:** This directory contained **broken symbolic links**. These links were pointing to a source directory (`/src/omarchy-nvim/...`) that didn't exist on my machine. They were likely leftover artifacts from when the dotfiles were originally built or packaged.

When Neovim tried to load syntax highlighting queries, it followed these dead links, crashed, and produced that corrupted error message.

**The Fix:** The solution was a clean sweep. We deleted the `site/queries` directory entirely to remove the bad links. Then, we forced a plugin sync.

rm -rf ~/.local/share/nvim/site/queries  
nvim --headless "+Lazy! sync" +qall

Neovim now uses the correct, internal queries bundled with the plugin, and the error is gone.

## Summary

Linux debugging often boils down to two things:

1. **Arguments matter:** Programs are picky about their flags (App ID vs. Class).
    
2. **Filesystem hygiene:** Leftover files (like broken symlinks) from old installs can cause ghosts in the machine.
    

My system is back to being fully functional. If you run into "silent failures" or "impossible typos," check your command arguments and your symlinks—they might just be lying to you.