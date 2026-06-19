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

## Funciones incluidas

- Diseño country/cowboy optimizado para celular.
- Cartas tipo pergamino.
- Orden de hijos: René, Jesús y Diego.
- Sección `Carta a mi padre`, pensada para que René Guzmán escriba a su papá fallecido.
- Juego de tiro al blanco con dificultad: fácil, media, difícil y pro.
- Edición de cartas desde la página con contraseña.

## Contraseñas de edición

- Carta de tu esposa: `esposa123`
- Carta René: `rene123`
- Carta Jesús: `jesus123`
- Carta Diego: `diego123`
- Carta a mi padre: `padre123`

## Importante sobre la edición

Esta página funciona en GitHub Pages, que es un sitio estático. Por eso, las cartas editadas desde la página se guardan en el navegador usando `localStorage`.

Esto significa que si una persona edita una carta desde su celular, el cambio queda guardado en ese celular. No se sincroniza automáticamente con otros celulares ni con GitHub.

Para que tu papá vea las cartas finales desde su celular, tienes dos opciones:

1. Editar las cartas directamente en el archivo `index.html` antes de publicar.
2. Usar esta función de edición en un solo dispositivo antes de entregarle la página.

Para edición real compartida entre varios celulares se necesita una base de datos externa, por ejemplo Firebase o Supabase.

## Publicación en GitHub Pages

1. Sube todos los archivos al repositorio.
2. Entra a `Settings > Pages`.
3. En `Source`, selecciona `Deploy from a branch`.
4. Selecciona `main` y carpeta `/root`.
5. Guarda y espera el enlace público.
