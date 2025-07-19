# Smarte Sider Order System

## Project Overview
The Smarte Sider Order System is a hybrid hosting solution that integrates a checkout system into the `prisliste.html` page of the smartesider.no website. The frontend is hosted on smartesider.no, while the backend consists of lightweight serverless functions hosted on Vercel.

## Project Structure
```
smarte-sider-order-system
├── api
│   ├── create-stripe-session.js
│   └── create-fiken-invoice.js
├── js
│   ├── menu.js
│   ├── app.js
│   └── order.js
├── video
│   └── 4549682-hd_1920_1080_30fps.mp4
├── index.html
├── prisliste.html
├── package.json
├── .gitignore
└── README.md
```

## Setup Instructions

### Frontend
1. Upload the `index.html`, `prisliste.html`, CSS files, images, and the `js` folder to the smartesider.no web server.

### Backend
1. Connect the GitHub repository to a new Vercel project.
2. Vercel will automatically detect and deploy the functions in the `/api` directory.
3. Add the following environment variables in the Vercel project settings:
   - `STRIPE_SECRET_KEY`
   - `FIKEN_COMPANY_SLUG`
   - `FIKEN_API_TOKEN`

## Environment Variables
For local development, create a `.env` file in the root of the project and include the following keys:
```
STRIPE_SECRET_KEY=your_stripe_secret_key
FIKEN_COMPANY_SLUG=your_fiken_company_slug
FIKEN_API_TOKEN=your_fiken_api_token
```

## Dependencies
The backend uses the following dependencies:
- `stripe`: For handling Stripe payments.
- `node-fetch`: For making HTTP requests to the Fiken API.

## License
This project is licensed under the MIT License.