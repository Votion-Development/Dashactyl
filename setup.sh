#!/bin/sh

if [[ ! -d build ]]; then
    mkdir -p -v build
fi

if [[ ! -d logs ]]; then
    mkdir -p -v logs
fi

if [[ ! -f settings.yml ]]; then
    if [[ -f settings.example.yml ]]; then
        cp settings.example.yml settings.yml
        echo "copied example to settings file"
    else
        echo "warning: example settings file not found"
    fi
else
    echo "skipping settings file"
fi

npm install

echo "setup complete!"
exit 0
