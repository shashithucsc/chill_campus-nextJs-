# Chill Campus - NextJS Application

## Deployment Instructions for Vercel

### Prerequisites
- A Vercel account linked to your GitHub repository
- MongoDB Atlas account with your database set up

### Environment Variables Setup
When deploying to Vercel, make sure to add the following environment variables in the Vercel dashboard:

```
MONGODB_URI=mongodb+srv://chillcampus:1234@chillcampuscluster.xryax7f.mongodb.net/?retryWrites=true&w=majority&appName=chillCampusCluster
NEXTAUTH_SECRET=/VFlm6MWGU+zI7YQ4hbsE10JP0r9QoNAKCGyRGN3v5Y=
NEXTAUTH_URL=${VERCEL_URL}
NODE_ENV=production
JWT_SECRET=07b0ccf96901bb53d9fa59e0914131fe0d6ca6f4e6015702eda475e6c50f5544ba6207a32890a94dcb98ad11686b81b9978fa7222f5032d9b9f07ca8a1d4bae5
GMAIL_USER=shashithrashmikapiyathilaka@gmail.com
GMAIL_PASS=wptv dwiw hehk gomn
NEXT_PUBLIC_APP_URL=${VERCEL_URL}
```

### Deployment Steps
1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure the environment variables as specified above
4. Deploy!

### Post-Deployment
- Verify that authentication works correctly
- Check that MongoDB connection is successful
- Ensure all API routes are functioning

## Local Development
To run the application locally:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Important Notes
- Make sure your MongoDB Atlas IP whitelist includes Vercel's IP ranges or is set to allow access from anywhere for proper connection
- The `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` environment variables use Vercel's built-in `${VERCEL_URL}` variable which automatically points to your deployment URL
- Socket.IO functionality should work out of the box with the configured server.js file
