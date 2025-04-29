# Turnero

Turnero para una clinica

## Requisitos

- Docker

## Requisitos Totem

-Git
-Node.s

## Docker Compose

``` docker images -a | grep "julianm217/turnero" | awk '{print $1":"$2}' | xargs docker rmi ```

``` docker compose pull ```

``` docker compose up -d --no-build ```

## Super usuario (admin)

``` docker exec -it container_id python manage.py createsuperuser ```
