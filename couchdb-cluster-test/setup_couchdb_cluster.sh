#!/bin/bash

# Wait for CouchDB to be up
until curl -s http://127.0.0.1:5984/ > /dev/null; do
    echo "Waiting for CouchDB Node 0 to start..."
    sleep 2
done

echo "CouchDB Node 0 is up!"

# Wait for Node 1 to be available
until curl -s http://127.0.0.1:15984/ > /dev/null; do
    echo "Waiting for CouchDB Node 1 to start..."
    sleep 2
done

echo "CouchDB Node 1 is up!"

# Create cluster
COUCHDB_USER=admin
COUCHDB_PASSWORD=password

# Step 1: Add the second node to the cluster
curl -X POST http://$COUCHDB_USER:$COUCHDB_PASSWORD@localhost:5984/_cluster_setup \
     -H "Content-Type: application/json" \
     -d '{
         "action": "add_node",
         "host": "couchdb-1.local.com",
         "username": "'$COUCHDB_USER'",
         "password": "'$COUCHDB_PASSWORD'"
     }'

# Step 2: Finish setting up the cluster
curl -X POST http://$COUCHDB_USER:$COUCHDB_PASSWORD@localhost:5984/_cluster_setup \
     -H "Content-Type: application/json" \
     -d '{
         "action": "finish_cluster"
     }'

echo "CouchDB cluster setup completed!"