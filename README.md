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
- Product Reviews
- Manage orders including payment with card

### Endpoints

- **User Registration**
- **User Login**
- **Token Management**
- **Product Management (Seller)**
- **Inventory Management (Seller)**
- **Order Management (Buyer)**
- **Product Reviews Management**

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
In case the server fails to start, and throws this error: `ERROR [ExceptionHandler] relation "roles" does not exist`, follow the following steps to resolve it:

1. Click `CTRL + C` to stop the server
2. Run again `./start.sh dev` to start the server
3. You should see the terminal all green

### Development
After a successful installation, you can start developing features
### Environment variables validation
To ensure environment safety and consistency across development environments, the application includes logic to validate environment variables before starting the server using [Joi](https://www.npmjs.com/package//joi?activeTab=versions). Some environment variables are marked as required, while others are optional. If any value is added that is not validated, the server will not start. This ensures that anyone working on this project has the same environment setup, promoting consistency and preventing configuration errors.
### Feature testing
:warning: Currently Unit tests are missing, but I will add them very soon
#### Configure SendGrid API Key and Email Address
In order to make sure that all features work correctly, including live email notifications, you need a SendGrid API key and a whitelisted email from SendGrid. Follow these steps to obtain the required values:
1. **Sign up for SendGrid:** If you don't already have a SendGrid account, sign up at [SendGrid](https://sendgrid.com/).
2. **Create an API Key:**
  - After logging into your SendGrid account, navigate to the "API Keys" section under "Settings".
  - Click on "Create API Key" and give it a name.
  - Assign the necessary permissions and create the key.
  - Copy the generated API key.
3. **Whitelist an Email Address:**
  - Navigate to the "Sender Authentication" section under "Settings".
  - Follow the steps to verify your email address. SendGrid will send a verification email to the address you provide.
  - Once verified, this email address will be whitelisted and can be used to send emails.
4. **Update .env File:** Add the following variables to your `.env` file with the obtained values:
```sh
SENDGRID_API_KEY=your_sendgrid_api_key
APP_MAILING_ADDRESS=your_whitelisted_email
```
#### Configure Stripe API Key and Webhook
To enable payment processing with Stripe, follow these steps:
1. **Sign up for Stripe:** If you don't already have a Stripe account, sign up at [Stripe](https://stripe.com/).
2. **Obtain API Keys:**
  - After logging into your Stripe account, navigate to the "Developers" section.
  - Go to the "API keys" tab. Here you will find your "Publishable key" and "Secret key".
  - Copy the "Secret key".
3. **Set Up Webhooks:**
  - Navigate to the "Webhooks" section under "Developers".
  - Click on "Add endpoint"
  - Here you will need a URL that have to look like a live link with `https` scheme, you can use [ngrok](https://ngrok.com/) in order to get it. Run the following command if the dev server is running:
  ```sh
  ./ngrok http [THE PORT AT WHICH LOCALHOST IS LISTENING]
  ```
  - Copy the URL ngrok is showing, it's something that looks like this: `https://f5cf-41-186-29-129.ngrok-free.app`
  - Provide the URL where Stripe will send webhook events (e.g., https://f5cf-41-186-29-129.ngrok-free.app/orders/checkout/webhook).
  - Select the API version we are using in this project which is: `2024-04-10` 
  - Select these two events `checkout.session.completed`, `checkout.session.async_payment_failed`.
  - Click on "Add endpoint" and copy the "Signing secret".
4. **Update .env File:** Add the following variables to your `.env` file with the obtained values:
```sh
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```
4. **Enable Stripe Connect**

Enabling this stripe configuration will make it possible for sellers to receive their payouts
- Log in to your Stripe Dashboard.
- Navigate to Settings > Connect.
- Click on Get started with Connect and follow the instructions to enable Stripe Connect for your account.
- **Platform branding:** Customize the branding for your connected accounts to match your platform's branding.

#### Migrations
##### Creating an empty migration file
1. Before creating a migration, you need to be using the same node-version specified by the project. To do that, open a terminal, navigate to `awesome-market` directory and run the following command:
```sh
nvm use
```
2. And then create a migration by running:
```sh
yarn migration:create name-of-your-migration-file
```
##### Running migrations
1. Before running migrations, you need to be connected to the API container first. To do that, open a terminal, navigate to `awesome-market` directory and run the following command:
```sh
./connect-to-api.sh
```
2. And then run the migrations by running:
```sh
yarn migration:run
```
#### Token Authentication
For protected endpoints, you need to include the Authorization header in your request. The value should be in the format `Bearer YOUR_ACCESS_TOKEN`. Here is an example of how to include it in your request headers:
```http
GET /protected-endpoint HTTP/1.1
Host: localhost:[HOST_PORT]
Authorization: Bearer YOUR_ACCESS_TOKEN
```
##### Refresh Token Endpoint
The `/auth/get-new-access-token` endpoint allows you to obtain a new access token using a refresh token without requiring the user to re-login. This is useful when the access token expires before the refresh token.
1. Set the following environment variables to configure token expiration times:
    - `REFRESH_JWT_EXPIRES`: The expiration time for the refresh token (e.g., 7d for 7 days).
    - `ACCESS_JWT_EXPIRES`: The expiration time for the access token (e.g., 15m for 15 minutes).
2. Using the `/get-new-access-token` Endpoint:
To get a new access token, send a GET request to the `/get-new-access-token` endpoint with the refresh token included in the headers:
```http
GET /auth/get-new-access-token HTTP/1.1
Host: localhost:[HOST_PORT]
Authorization: Bearer YOUR_REFRESH_TOKEN
```

### Access the API
You can access the API at the endpoint: http://localhost:[HOST_PORT] where HOST_PORT is the value you passed in the .env file.

### Schema file
You can find the db schema pdf file inside the the `awesome-market/db/awesome-market.pdf` directory or find it on this link: [Awesome Market Schema](https://dbdiagram.io/d/awesome-market-6655d24bb65d933879e0c98f)

## API Documentation

### Access API Docs
Go to http://localhost:[HOST_PORT]/api-docs

### Platform operations
#### Payment implementation

### Contribution
Feel free to fork this repository and make contributions. Pull requests are welcome.
