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

Después de modificar o subir los archivos de `dist/`, reconstruye la imagen:

```sh
docker compose up -d --build
```

Las etiquetas `og:url` y `og:image` de `dist/index.html` contienen el dominio
original. Actualízalas al dominio definitivo para compartir la invitación.

## Estado, registros y apagado

```sh
docker compose ps
docker compose logs --tail=100 invitacion
docker compose down
```

El servicio se reinicia automáticamente después de reiniciar el VPS, siempre
que Docker arranque con el sistema. La imagen incluye una comprobación de salud
HTTP que se muestra en `docker compose ps`.
