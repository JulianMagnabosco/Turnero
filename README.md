# Turnero

Turnero para una clinica

## Requisitos

- Docker

## Requisitos Totem

- Git
- Node.s

## Docker Compose

``` docker images -a | grep "julianm217/turnero" | awk '{print $1":"$2}' | xargs docker rmi ```

``` docker compose pull ```

``` docker compose up -d --no-build ```

## migracion DB

```docker exec -it back python manage.py makemigrations``` o ```docker exec -it back python manage.py makemigrations --update```

```docker exec -it back python manage.py migrate```

```docker exec -it back python manage.py loaddata initdata.json```
