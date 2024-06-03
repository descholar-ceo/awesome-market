#!/usr/bin/env bash

install_node_version() {
  local DESIRED_NODE_VERSION=$(<.nvmrc)
  if ! nvm ls | grep -q "$DESIRED_NODE_VERSION"; then
    echo "Node.js version $DESIRED_NODE_VERSION is not installed, installing..."
    nvm install "$DESIRED_NODE_VERSION"
  else
    echo "Node.js version $DESIRED_NODE_VERSION is already installed."
  fi
}

install_global_yarn() {
  if ! command -v yarn &> /dev/null; then
    echo "Yarn is not installed globally, installing..."
    npm install -g yarn
  else
    echo "Yarn is already installed globally."
  fi
}

check_migration_dir() {
local MIGRATIONS_FROM_DIST_DIR="./dist/db/migrations/"
local MIGRATIONS_FROM_DEV_DIR='./db/migrations/'
if ! [ -d "$MIGRATIONS_FROM_DIST_DIR" ]; then
  if [ -d "$MIGRATIONS_FROM_DEV_DIR" ]; then
    echo "Migrations directory does not exist in dist folder but it exists in dev directory, copying it to the dist folder..."
    mkdir -p $MIGRATIONS_FROM_DIST_DIR
    cp -r $MIGRATIONS_FROM_DEV_DIR $MIGRATIONS_FROM_DIST_DIR
  else
    echo "Migrations directory does not exist in both dist and dev directories."
  fi
else
  echo "Migration files are set correctly..."
fi
}

check_docker_network() {
  local AWESOME_NETWORK_NAME="awesome_network"
  if ! docker network inspect "$AWESOME_NETWORK_NAME" &> /dev/null; then
    echo "The network $AWESOME_NETWORK_NAME does not exist, creating..."
    docker network create "$AWESOME_NETWORK_NAME"
  fi

  while ! docker network inspect "$AWESOME_NETWORK_NAME" &> /dev/null; do
    echo "Waiting for the network $AWESOME_NETWORK_NAME to be available..."
    sleep 1
  done

  echo "The network $AWESOME_NETWORK_NAME is now available, continuing with starting containers..."
}

if [ -z "$1" ]; then
  echo "No argument supplied"
else
  if [[ "$1" == "dev" ]]; then
    . ~/.nvm/nvm.sh
    install_node_version
    install_global_yarn
    nvm use
    yarn
  fi
  if [[ "$1" == "dev" || "$1" == "qa" ]]; then
    check_docker_network
    check_migration_dir
    echo "Starting awesome-market in: $1 environment..."
    docker compose -p awesome-market-db -f "./compose-$1.yml" --profile db up -d
    docker compose -p awesome-market-api-container -f "./compose-$1.yml" --profile api up
  else
    echo "Invalid environment: $1, valid environments are: dev, qa"
  fi
fi
