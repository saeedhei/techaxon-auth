#!/bin/bash

FILE="couchdb_backup_$(date +%Y%m%d_%H%M%S).tar.gz"

docker run --rm \
  -v couchdb_data:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/$FILE -C /data .

echo "Backup created: $FILE"