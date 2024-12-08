# Braccit - A Reddit-like Community Platform

Braccit is a full-stack web application that provides a platform for creating and managing communities, sharing posts, and engaging in discussions. Built with modern web technologies, it offers a familiar interface while maintaining a unique identity.

## Features

- **User Authentication**: Secure signup and login system
- **Communities**: Create and join communities
- **Posts**: Share text and image posts within communities
- **Voting System**: Upvote and downvote posts
- **Comments**: Engage in discussions through comments
- **Search**: Find posts and communities
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React.js
- Material-UI (MUI)
- Axios for API calls
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/SNaf1/braccit.git
cd braccit
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the development servers:
```bash
# Start backend server (from backend directory)
npm start

# Start frontend development server (from frontend directory)
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
