---
title: Terminales fantasma y enlaces simbólicos rotos en Omarchy
type: post
date: 2026-01-18
draft: false
tags:
  - tech
  - tutorial
  - stack
created: 2026-01-18
modified: 2026-02-06
lang: es-ES
aliases:
  - "es/00. STOCK/Ghost Terminals and Broken Symlinks on Omarchy"
source_hash: b235aa93048d
---
Me encanta el proyecto Omarchy, pero de vez en cuando las cosas se rompen de formas interesantes. Hace poco, mi configuración (que funciona con los dotfiles de «Omarchy») empezó a comportarse de forma extraña. Me enfrentaba a dos problemas molestos: mis menús de configuración no se abrían y Neovim arrojaba errores crípticos.

Aquí tienes un desglose de qué salió mal y cómo lo arreglamos.

## 1. El caso de la ventana de ajustes desaparecida

**El problema:** Cada vez que intentaba abrir un archivo de configuración desde el menú del sistema (como «Monitores» o «Atajos de teclado»), recibía una notificación que decía _«Editando monitors.conf...»_, pero no ocurría nada. No aparecía ninguna ventana. Era como si el comando se enviara al vacío.

**La investigación:** El problema no era el menú en sí, sino la forma en que intentaba lanzar el editor de texto. Los scripts del sistema usaban un comando que tenía un aspecto parecido a este:

```bash
xdg-terminal-exec --app-id=org.omarchy.editor -e nvim ...
```

El script intentaba lanzar mi terminal con un `--app-id` específico para que el gestor de ventanas (Hyprland) pudiera aplicar reglas de estilo concretas (como convertirla en una ventana flotante).

**La causa raíz:** Mi terminal por defecto es **Alacritty**. Aunque muchos terminales de Wayland admiten la opción `--app-id`, Alacritty no. Utiliza estrictamente `--class` para definir las propiedades de la ventana. Como Alacritty no entendía la opción que enviaba el script, simplemente fallaba en silencio.

**La solución:** En lugar de reescribir todos los scripts del sistema, creamos un «wrapper» para `xdg-terminal-exec`. Este script intercepta el comando, comprueba si está la opción `--app-id` y la traduce a la opción `--class` que Alacritty sí entiende.

Ahora, cuando el sistema pide un app ID, Alacritty recibe un nombre de clase, y mis ventanas de ajustes se abren perfectamente.

## 2. El misterio de «treesitte» en Neovim

**El problema:** Neovim es mi herramienta de cabecera, pero empezó a recibirme con un mensaje de error extraño: `.../lua/vim/treesitte"tab" ^`. Parecía una errata en el código fuente —«treesitte» en lugar de «treesitter»—, pero al buscar en el código no se encontraba semejante errata.

**La investigación:** Ejecutamos `:checkhealth`, que informó de que el plugin `nvim-treesitter` estaba completamente roto. Reinstalar el plugin no ayudó de inmediato.

Profundizamos en los directorios de datos de Neovim y encontramos al culpable en `~/.local/share/nvim/site/queries`.

**La causa raíz:** Este directorio contenía **enlaces simbólicos rotos**. Estos enlaces apuntaban a un directorio fuente (`/src/omarchy-nvim/...`) que no existía en mi máquina. Probablemente eran restos de cuando los dotfiles se compilaron o empaquetaron originalmente.

Cuando Neovim intentaba cargar las consultas de resaltado de sintaxis, seguía estos enlaces muertos, se bloqueaba y producía ese mensaje de error corrupto.

**La solución:** La solución fue una limpieza a fondo. Eliminamos por completo el directorio `site/queries` para borrar los enlaces defectuosos. Luego forzamos una sincronización de los plugins.

rm -rf ~/.local/share/nvim/site/queries  
nvim --headless "+Lazy! sync" +qall

Neovim ahora utiliza las consultas internas correctas que vienen incluidas con el plugin, y el error ha desaparecido.

## Resumen

La depuración en Linux a menudo se reduce a dos cosas:

1. **Los argumentos importan:** Los programas son quisquillosos con sus opciones (App ID frente a Class).
    
2. **Higiene del sistema de archivos:** Los archivos sobrantes (como enlaces simbólicos rotos) de instalaciones antiguas pueden provocar fantasmas en la máquina.
    

Mi sistema ha vuelto a estar plenamente funcional. Si te encuentras con «fallos silenciosos» o «erratas imposibles», revisa los argumentos de tus comandos y tus enlaces simbólicos: puede que simplemente te estén mintiendo.