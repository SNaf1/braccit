const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    addSemesterCourses,
    getStudentCourses,
    updateSemesterCourses,
    deleteSemesterCourses
} = require('../controllers/studentCourseController');

router.route('/')
    .post(protect, addSemesterCourses)
    .get(protect, getStudentCourses);

router.route('/:id')
    .put(protect, updateSemesterCourses)
    .delete(protect, deleteSemesterCourses);

module.exports = router;
