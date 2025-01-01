import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Toolbar } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Feed from './components/Feed/Feed';
import CommunityDetail from './components/Community/CommunityDetail';
import CreateCommunity from './components/Community/CreateCommunity';
import CreatePost from './components/Post/CreatePost';
import Settings from './components/Settings/Settings';
import PostDetail from './components/Post/PostDetail';
import SearchResults from './pages/SearchResults';
import NotFound from './components/NotFound';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import Routine from './pages/Routine';
import Admin from './pages/Admin';
import { AuthProvider } from './contexts/AuthContext';
import VerifyEmail from './components/Auth/VerifyEmail';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Navbar />
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                backgroundColor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginLeft: '-40px'
              }}
            >
              <Toolbar /> {/* Add spacing for fixed navbar */}
              <Box sx={{ 
                width: '100%', 
                maxWidth: '1200px',
                mx: 'auto'
              }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/user/:username" element={<UserProfile />} />
                  <Route path="/b/:name" element={<CommunityDetail />} />
                  <Route path="/b/:name/post/:postId" element={<PostDetail />} />
                  <Route path="/post/:postId" element={<PostDetail />} />
                  <Route path="/create-community" element={<CreateCommunity />} />
                  <Route path="/create-post" element={<CreatePost />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />
                  <Route path="/routine" element={<Routine />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
