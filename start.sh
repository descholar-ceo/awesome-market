#!/usr/bin/env bash

# check the docker network
AWESOME_NETWORK_NAME="awesome_network"
if ! docker network inspect $AWESOME_NETWORK_NAME &> /dev/null; then
  docker network create $AWESOME_NETWORK_NAME
else
  echo "The network $AWESOME_NETWORK_NAME already exists, continuing with starting containers..."
fi

# start the db and api
if [ -z "$1" ]; then
  echo "No argument supplied"
else
  if [[ "$1" == "dev" || "$1" == "qa" ]]; then
    echo "Starting awesome-market in: $1 environment..."
    docker compose -p awesome-market-db -f "./compose-$1.yml" --profile db up -d
    docker compose -p awesome-market-api-container -f "./compose-$1.yml" --profile api up
  else
    echo "Invalid environment: $1, valid environments are: dev, qa"
  fi
fi
