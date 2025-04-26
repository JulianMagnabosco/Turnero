# Turnero

Turnero para una clinica

## Python Enviroment

```py -m venv .venv\```

```source .venv/Scripts/activate``` o ```.venv/Scripts/activate```

```pip install -r requirements.txt ```

## Migracion

```python manage.py makemigrations``` o ```python manage.py makemigrations --update```

```python manage.py migrate```

## Docker Redis Channel

```docker run --rm -p 6379:6379 redis:7```

## Ejecutar

```python manage.py runserver 3000```

## Dockerfile

```docker images -a | grep "julianm217/turnero-back" | awk '{print $1":"$2}' | xargs docker rmi ```

```docker build --no-cache -t julianm217/turnero-back .```

```docker run --rm -p 3000:3000 --env-file .env julianm217/turnero-back:latest```