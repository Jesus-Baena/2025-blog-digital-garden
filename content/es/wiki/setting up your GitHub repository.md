---
title: Configurar tu repositorio de GitHub
created: 2023-12-03
modified: 2025-10-17
lang: es-ES
aliases:
  - "es/00. STOCK/setting up your GitHub repository"
---
Primero, asegúrate de tener Quartz [[Welcome to my Blog#🪴 Get Started|clonado y configurado localmente]].

Luego, crea un nuevo repositorio en GitHub.com. **No** inicialices el nuevo repositorio con archivos `README`, licencia ni `gitignore`.

![[github-init-repo-options.png]]

En la parte superior de tu repositorio en la página de Configuración Rápida de GitHub.com, haz clic en el portapapeles para copiar la URL del repositorio remoto.

![[github-quick-setup.png]]

En la terminal de tu elección, navega hasta la raíz de tu carpeta de Quartz. Luego, ejecuta los siguientes comandos, reemplazando `REMOTE-URL` por la URL que acabas de copiar en el paso anterior.

```bash
# list all the repositories that are tracked
git remote -v

# if the origin doesn't match your own repository, set your repository as the origin
git remote set-url origin REMOTE-URL

# if you don't have upstream as a remote, add it so updates work
git remote add upstream https://github.com/jackyzha0/quartz.git
```

Luego, puedes sincronizar el contenido para subirlo a tu repositorio. Este es un comando auxiliar que hará el envío inicial de tu contenido a tu repositorio.

```bash
npx quartz sync --no-pull
```

> [!warning]- `fatal: --[no-]autostash option is only valid with --rebase`
> Puede que tengas una versión obsoleta de `git`. Actualizar `git` debería solucionar este problema.

> [!warning]- `fatal: The remote end hung up unexpectedly`
> Podría deberse al tamaño de búfer predeterminado de Git. Puedes solucionarlo aumentando el búfer con este comando:
>
> ```bash
> git config http.postBuffer 524288000
> ```

En futuras actualizaciones, simplemente puedes ejecutar `npx quartz sync` cada vez que quieras enviar actualizaciones a tu repositorio.

> [!hint] Indicadores y opciones
> Para ver todas las opciones de ayuda, puedes ejecutar `npx quartz sync --help`.
>
> La mayoría tienen valores predeterminados sensatos, pero puedes anularlos si tienes una configuración personalizada:
>
> - `-d` o `--directory`: la carpeta de contenido. Normalmente es simplemente `content`
> - `-v` o `--verbose`: imprime información de registro adicional
> - `--commit` o `--no-commit`: si se hace o no un commit de `git` con tus cambios
> - `--push` o `--no-push`: si se envían o no las actualizaciones a tu fork de Quartz en GitHub
> - `--pull` o `--no-pull`: si se intenta o no incorporar cualquier actualización de tu fork de Quartz en GitHub (es decir, de otros dispositivos) antes de enviar