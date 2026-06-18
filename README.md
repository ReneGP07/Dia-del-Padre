# Página Día del Padre - René Guzmán

Proyecto estático listo para GitHub Pages.

## Estructura

```text
index.html
assets/
  css/styles.css
  js/app.js
  img/fondo-montanas.jpg
  img/portada.jpg
  img/recuerdos/
  audio/
```

## Cómo subirlo a GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube `index.html`, la carpeta `assets` y este `README.md`.
3. Entra a `Settings > Pages`.
4. En `Source`, elige `Deploy from a branch`.
5. Selecciona `main` y `/root`.
6. Guarda los cambios.

## Cambiar el fondo

Reemplaza este archivo:

```text
assets/img/fondo-montanas.jpg
```

Mantén el mismo nombre para no modificar el CSS.

## Cambiar textos de cartas

Edita `index.html` y busca estas secciones:

```text
carta-esposa
carta-rene
carta-jesus
carta-diego
carta-padre
```

Ahí puedes pegar las cartas finales.

## Agregar fotos

Guarda las fotos en:

```text
assets/img/recuerdos/
```

Luego puedes reemplazar los bloques `.photo-placeholder` por imágenes, por ejemplo:

```html
<img src="assets/img/recuerdos/foto1.jpg" alt="Recuerdo familiar" />
```

Si agregas imágenes, usa archivos comprimidos para celular, idealmente menores a 500 KB por imagen.
