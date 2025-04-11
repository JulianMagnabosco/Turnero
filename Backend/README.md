# Turnero

Turnero para una clinica

## Impresora Totem

```plugin.exe --puerto 2811``` o ```plugin.exe --port 2811```

## Python Env

```py -m venv .venv\```

```source .venv/Scripts/activate``` o ```.venv/Scripts/activate```

```pip install -r requirements.txt ```

## Migracion

```python manage.py makemigrations```

```python manage.py migrate```

## Redis Channel

```docker run --rm -p 6379:6379 redis:7```

## Ejecutar

```python manage.py runserver 3000```