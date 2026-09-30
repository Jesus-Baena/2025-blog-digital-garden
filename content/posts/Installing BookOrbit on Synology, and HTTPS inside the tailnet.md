---
title: Installing BookOrbit on Synology, and HTTPS inside the tailnet
type: post
date: 2026-09-30
tags:
  - stack
  - tutorial
description: A self-hosted ebook library on the NAS in an afternoon. Three things got in the way, and one of them turned into a small upgrade for the whole home setup.
draft: false
---
For years my ebooks have lived on the NAS as a Calibre-style folder tree: author folders, one folder per book, an EPUB, an `.opf` file with the metadata and a cover. Around 7,000 books that I could only browse with a file manager. [BookOrbit](https://github.com/bookorbit/bookorbit) is a self-hosted library and reader for ebooks, PDFs, comics and audiobooks, with KOReader and Kobo sync, highlights, notes and an OPDS catalogue. It ships a two-container Docker Compose file (the app plus Postgres with pgvector), so it fits the NAS well.

The install itself was uneventful. Three things got in the way.

### 1. Synology ACLs ignore your `chmod 777`

The app starts as root, fixes ownership of its own data folder, then drops to `PUID:PGID` (1000:1000 by default). I set it to the NAS admin user, pointed `/books` at the library and got `Permission denied`, even though the folder showed `drwxrwxrwx`.

On a Synology shared folder the `+` at the end of the permissions is the real story. DSM applies its own ACLs, and the Unix mode bits are basically decorative. The ACL allowed the `administrators` group plus a few named users. My admin user *is* in `administrators`, but the container drops privileges with `su-exec` using only the primary group (`users`), so the supplementary group never comes along.

**The fix:** run the container as a user that is named directly in the share's ACL. Check it with `synoacltool -get <folder>`, not `ls -l`.

### 2. "Internal server error" when creating the library

The library form has a *Watch folder* option: pick up new books as they land. With it on, the request failed with a 500, and the log said:

```
ENOSPC: System limit for number of file watchers reached
```

The watcher puts an inotify watch on every directory. DSM caps that at 8,192 per user, and my library has about 24,000 directories, 7,000 of them Synology's own `@eaDir` thumbnail folders. The library row was still saved; only the watcher failed.

**The fix:** turn *Watch folder* off and set a scheduled scan instead. Raising the kernel limit on DSM means a root task that re-runs at every boot, which isn't worth it for a library that changes a few times a month.

### 3. Don't restart the server during the first scan

The first scan of 7,000 books takes a while. I restarted the container halfway through to fix the watcher and got *Failed: Server restarted during scan*. Nothing was lost: the books already imported stayed, and pressing *Scan* again carried on from there.

### The bonus: real HTTPS inside the tailnet

The NAS is only reachable over Tailscale, so I had been using BookOrbit at a plain `http://100.x.y.z:3100`. It worked, but browsers only let you install a web app on your phone's home screen over HTTPS.

What I had missed for a long time: **Tailscale can serve HTTPS for you, with a real Let's Encrypt certificate, on the `*.ts.net` name of the machine.** One command on the NAS:

```bash
sudo tailscale serve --bg --https=3443 http://127.0.0.1:3100
```

Now the library is at `https://<nas-name>.<tailnet>.ts.net:3443`, still reachable only from my tailnet, with no certificate warnings, and it installs as an app on Android.

Some notes if you try this on a Synology:

- **Don't use port 443.** DSM's own web server already answers 443 on the NAS's addresses. Serve only captures the port you give it, so pick a free one and leave the rest alone.
- **Tell the app its new address.** BookOrbit only accepts live-update connections (scan progress and so on) from the address in `APP_URL`, so the HTTPS URL has to become the canonical one.
- **Certificates are public.** Every Let's Encrypt certificate is published in the certificate transparency logs, so your machine name and tailnet name become visible. Nobody gains access, but know it before naming machines.

I liked it so much that DSM and Immich got the same treatment the same afternoon, each on its own port. DSM's self-signed certificate warning is finally gone.

### Reading on the phone

BookOrbit exposes an OPDS catalogue at `/api/v1/opds`, with its own per-app passwords. In Moon+ Reader: *Net Library → Add*, paste the URL, done. The catch is that OPDS is one-way: Moon+ downloads the books, but your reading position and highlights stay in Moon+. For progress that syncs back, use BookOrbit's own reader (which does highlights and notes, and exports them to Markdown) or KOReader, which is next on the list for the Kindle.
