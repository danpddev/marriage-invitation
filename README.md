# Invitación de matrimonio — Andrés y Marianny

Sitio estático servido con Nginx. Los archivos publicados están en `dist/`,
incluidos el HTML, los estilos, JavaScript y las imágenes. No requiere Node.js
ni una base de datos.

## Ejecutar en el VPS

Requisitos: Docker Engine y Docker Compose instalados, con Docker en ejecución.
Desde la carpeta del proyecto:

```sh
docker compose up -d --build
```

Abre `http://IP_DEL_VPS:8085`. Para acceder desde Internet, permite el puerto
TCP 8085 en el firewall del VPS y en el panel de tu proveedor, si aplica.

## Cambiar el puerto

Copia la configuración de ejemplo:

```sh
cp .env.example .env
```

Edita `.env` y establece, por ejemplo, `PORT=80` para acceder mediante
`http://IP_DEL_VPS` sin escribir el puerto. El puerto elegido debe estar libre.
Aplica el cambio con:

```sh
docker compose up -d
```

Para usar un dominio con HTTPS, configura un proxy inverso y su certificado TLS
para apuntar a este servicio. Si el proxy se ejecuta directamente en el VPS,
usa `HOST_IP=127.0.0.1` y `PORT=8085` en `.env`, y apunta el proxy a
`http://127.0.0.1:8085`. Esta configuración de Docker sirve HTTP.

## Actualizar la invitación

### Invitados y enlaces personalizados

Edita `dist/invitados.json`: cada clave es un UUID y su valor contiene el nombre
y el tipo de invitación. Por ejemplo:

```json
{
  "380c51b3-68ea-4638-9a9b-7d3867c52f1a": {
    "nombre": "Daniel Puerto",
    "tipo": "uno"
  }
}
```

Usa `"tipo": "uno"` para una persona: **¡Estás invitado!**.
Usa `"tipo": "varios"` para una pareja o familia: **¡Están invitados!**.
En `nombre` puedes escribir los nombres de la pareja o el nombre de la familia.
Si omites `tipo`, se considera `uno`. Las entradas antiguas con solo el nombre
como texto siguen funcionando como invitaciones individuales. Un tipo diferente
de `uno` o `varios` muestra la página de espera para esa entrada.

La primera entrada corresponde a Daniel Puerto y conserva su enlace:

```text
http://IP_DEL_VPS:8085/380c51b3-68ea-4638-9a9b-7d3867c52f1a
```

Usa tu dominio y puerto definitivos al compartir el enlace. Cada invitado nuevo
debe tener un UUID diferente. En PowerShell puedes generarlo con
`[guid]::NewGuid().ToString()`; en Linux, con `uuidgen`.

La raíz del sitio y los enlaces sin UUID válido o sin un invitado registrado
muestran la página «Pronto, un evento especial». También se muestra si no se
puede cargar el JSON. Los nombres se insertan como texto, sin interpretar HTML.
Los parámetros antiguos `?invitado=` y `?guest=` ya no personalizan la invitación.

El JSON es público porque el sitio es estático; el UUID personaliza el enlace,
pero no ofrece autenticación. Guarda únicamente los nombres que quieras publicar.

### Reconstruir la imagen

Después de modificar o subir los archivos de `dist/`, reconstruye la imagen:

```sh
docker compose up -d --build
```

Las etiquetas `og:url` y `og:image` de `dist/index.html` contienen el dominio
original. Actualízalas al dominio definitivo para compartir la invitación.

## Música de la invitación

El reproductor utiliza el audio nativo del navegador y el MP3 de `dist/assets/`,
sin depender de librerías externas. Intenta comenzar a reproducir cuando se
valida el invitado. Si el navegador bloquea la reproducción automática con
sonido, el invitado debe pulsar cualquiera de los dos botones de música.
Ambos permiten pausar y continuar; la barra y los tiempos reflejan la posición
real de la canción. Al terminar, el botón permite reproducirla desde el inicio.
La página de espera no reproduce ni precarga la canción.

## Estado, registros y apagado

```sh
docker compose ps
docker compose logs --tail=100 invitacion
docker compose down
```

El servicio se reinicia automáticamente después de reiniciar el VPS, siempre
que Docker arranque con el sistema. La imagen incluye una comprobación de salud
HTTP que se muestra en `docker compose ps`.
