#!/bin/bash

echo "Creando env"
if test -d .venv
then
    echo "Ya existe env"
    source .venv/Scripts/activate
else
    python -m venv .venv/
    source .venv/Scripts/activate
    pip install -r requirements.txt 
fi

echo "Iniciando"

python manage.py migrate

docker run --rm -p 6379:6379 redis:7

python manage.py runserver 3000
