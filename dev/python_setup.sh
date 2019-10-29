#!/bin/bash

# This script will (eventually) setup pyodide and manim to be used
# with eulertour.

# There should be an eulertour repositories with compatible versions
# of both pyodide and manim.

# TODO: remove unecessary packages from packages/
# TODO: build with uid namespacing so files aren't owned by root
# Steps:
# Pull pyodide from github
# Pull manim from github
# Remove unecessary directories from packages/
# Add manim directory to packages/
# Add colour and build pyodide (bin/pyodide mkpkg colour && make)
# Change permissions
# Copy files into the appropriate location
git clone https://github.com/iodide-project/pyodide.git

git clone https://github.com/eulertour/manim.git
