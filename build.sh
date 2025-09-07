#!/usr/bin/env bash
set -o errexit

# Upgrade pip and setuptools first
pip install --upgrade pip setuptools==68.2.2

# Install requirements
pip install -r requirements.txt