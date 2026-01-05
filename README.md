# Pacientes y Exámenes (PDF)

Página web estática que muestra una lista ordenada de pacientes y enlaces a sus exámenes en PDF.

## Estructura

- `index.html` — Página principal.
- `styles.css` — Estilos.
- `app.js` — Lógica para cargar `data/patients.json` y renderizar la lista.
- `data/patients.json` — Datos de ejemplo (edítalos según tus pacientes y nombres de PDFs).
- `pdfs/` — Coloca aquí los archivos PDF de los exámenes. Los links en `data/patients.json` apuntan a `../pdfs/`.

## Uso rápido

1. Colocar los archivos PDF en `pdfs/`, por ejemplo `pdfs/ana_martinez_hemograma.pdf`.
2. Editar `data/patients.json` y actualizar la ruta `pdf` para cada examen si es necesario.
3. Abrir `index.html` en un navegador (puedes abrirlo directamente o servirlo con un servidor estático).

### Servir con Python (opcional)

Si tienes Python instalado, desde la carpeta `patients-portal` puedes iniciar un servidor rápido:

```powershell
# para Python 3.x
python -m http.server 8000
```

Luego abre `http://localhost:8000` en tu navegador.

## Notas

- Las rutas de PDF en `data/patients.json` usan `../pdfs/<archivo>.pdf` porque la web se sirve desde la raíz donde está `index.html`.
- Asegúrate de nombres sin espacios o ajusta las rutas en el JSON.
- Si quieres, puedo extender esto a una pequeña API/servidor que permita subir PDFs desde la UI.
