import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PostDetail from '../components/Post/PostDetail';
import PrivateRoute from './PrivateRoute';

const PostRoutes = () => {
    return (
        <Routes>
            <Route
                path="/post/:postId"
                element={<PostDetail />}
            />
            {/* Add more post-related routes here */}
        </Routes>
    );
};

export default PostRoutes;
