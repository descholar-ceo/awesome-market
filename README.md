# Awesome Market API

Awesome Market is a marketplace API with features for user registration, login, token management, role-based authorization, and more.

## Features

- User registration
- User login
- Request new access token using refresh token
- Role-based access control
- Three user roles: Admin, Seller, Buyer
  - Admin: Full access to all endpoints
  - Seller: Add products, manage inventories
  - Buyer: Create orders

### Endpoints

- **User Registration**
- **User Login**
- **Token Management**
- **Product Management (Seller)**
- **Inventory Management (Seller)**
- **Order Management (Buyer)**

### Missing Endpoints

- Order Processing
- Order Checkout [Payment]
- Order Listings

## Setup

### Prerequisites

- Node.js (Managed using `nvm`)
- Docker (for running the database and the API)

### Steps to Install `nvm`

#### On macOS/Linux

1. Open Terminal.
2. Run the install script:
    ```sh
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
    ```
3. Load `nvm`:
    ```sh
    export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    ```

#### On Windows

1. Download and install `nvm-windows` from [nvm-windows GitHub repository](https://github.com/coreybutler/nvm-windows/releases).
2. Run the installer and follow the prompts.

### Clone the Repository

```sh
git clone https://github.com/descholar-ceo/awesome-market.git
cd awesome-market
```

### Run Setup Script
```sh
./setup.sh
```

### Configure Environment Variables
1. Copy all environment variables from .env.example: 
```sh
cp .env.example .env
```
2. Edit the .env file and paste all provide real values for the environment variables.

### Start the Application in Development Mode
```sh
./start.sh dev
```
### Known Issue
In case the server does not starts successfully, and throws this error: `ERROR [ExceptionHandler] relation "roles" does not exist`, follow the following steps to resolve it:

1. Open another terminal
2. Run `./connect-to-api.sh`
3. Run `yarn migration:run`
4. Go back to the terminal that was running the server and click `CTRL + C` to s
5. Run again `./start.sh dev`

### Access the API
You can access the API at the endpoint: http://localhost:[HOST_PORT] where HOST_PORT is the value you passed in the .env file.

### Access API Docs
Go to http://localhost:[HOST_PORT]/api-docs

### Schema file
You can find the db schema pdf file inside the the `awesome-market/db/awesome-market.pdf` directory or find it on this link: [Awesome Market Schema](https://dbdiagram.io/d/awesome-market-6655d24bb65d933879e0c98f)

### Contribution
Feel free to fork this repository and make contributions. Pull requests are welcome.
