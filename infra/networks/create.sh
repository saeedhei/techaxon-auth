#!/bin/bash

set -e

if docker network ls | grep -q traefik-public; then
  echo "Network already exists"
else
  docker network create traefik-public
  echo "Network created"
fi