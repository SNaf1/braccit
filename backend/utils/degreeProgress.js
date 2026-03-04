const { degreePlan, getCourseCredits } = require('../data/degreePlan');
const { prerequisites } = require('../data/prerequisites');

// Calculate total credits completed
const calculateCompletedCredits = (completedCourses) => {
    return completedCourses.reduce((total, courseCode) => {
        return total + getCourseCredits(courseCode);
    }, 0);
};

// Track progress in each degree category
const trackDegreeProgress = (completedCourses) => {
    const progress = {
        totalCredits: {
            required: degreePlan.totalCreditsRequired,
            completed: calculateCompletedCredits(completedCourses),
            remaining: degreePlan.totalCreditsRequired - calculateCompletedCredits(completedCourses)
        },
        universityCore: trackUniversityCoreProgress(completedCourses),
        schoolCore: trackSchoolCoreProgress(completedCourses),
        programCore: trackProgramCoreProgress(completedCourses),
        programElective: trackProgramElectiveProgress(completedCourses),
        projectInternshipThesis: trackProjectProgress(completedCourses)
    };

    progress.isOnTrack = validateDegreeProgress(progress);
    return progress;
};

// Track University Core progress
const trackUniversityCoreProgress = (completedCourses) => {
    const uniCore = degreePlan.categories.universityCore;
    const progress = {
        totalCredits: {
            required: uniCore.totalCredits,
            completed: 0,
            remaining: uniCore.totalCredits
        },
        streams: {}
    };

    // Track each stream's progress
    for (const [streamName, stream] of Object.entries(uniCore.streams)) {
        const streamProgress = {
            completed: [],
            remaining: [],
            optionalCompleted: []
        };

        // Check required courses
        if (stream.required) {
            streamProgress.completed = stream.required.filter(code => 
                completedCourses.includes(code)
            );
            streamProgress.remaining = stream.required.filter(code => 
                !completedCourses.includes(code)
            );
        }

        // Check optional courses
        if (stream.optional) {
            streamProgress.optionalCompleted = stream.optional.filter(code => 
                completedCourses.includes(code)
            );
        }

        // Calculate credits
        const streamCredits = calculateStreamCredits(
            streamProgress.completed.concat(streamProgress.optionalCompleted)
        );
        progress.totalCredits.completed += streamCredits;

        streamProgress.meetsRequirements = validateStreamRequirements(
            stream,
            streamProgress
        );

        progress.streams[streamName] = streamProgress;
    }

    progress.totalCredits.remaining = 
        progress.totalCredits.required - progress.totalCredits.completed;

    return progress;
};

// Track School Core progress
const trackSchoolCoreProgress = (completedCourses) => {
    const schoolCore = degreePlan.categories.schoolCore;
    const progress = {
        totalCredits: {
            required: schoolCore.totalCredits,
            completed: 0,
            remaining: schoolCore.totalCredits
        },
        completed: [],
        remaining: []
    };

    progress.completed = schoolCore.required.filter(code => 
        completedCourses.includes(code)
    );
    progress.remaining = schoolCore.required.filter(code => 
        !completedCourses.includes(code)
    );

    progress.totalCredits.completed = calculateStreamCredits(progress.completed);
    progress.totalCredits.remaining = 
        progress.totalCredits.required - progress.totalCredits.completed;

    return progress;
};

// Track Program Core progress
const trackProgramCoreProgress = (completedCourses) => {
    const programCore = degreePlan.categories.programCore;
    const progress = {
        totalCredits: {
            required: programCore.totalCredits,
            completed: 0,
            remaining: programCore.totalCredits
        },
        completed: [],
        remaining: []
    };

    const coreCourses = programCore.courses.map(course => course.code);
    progress.completed = coreCourses.filter(code => 
        completedCourses.includes(code)
    );
    progress.remaining = coreCourses.filter(code => 
        !completedCourses.includes(code)
    );

    progress.totalCredits.completed = calculateStreamCredits(progress.completed);
    progress.totalCredits.remaining = 
        progress.totalCredits.required - progress.totalCredits.completed;

    return progress;
};

// Track Program Elective progress
const trackProgramElectiveProgress = (completedCourses) => {
    const programElective = degreePlan.categories.programElective;
    const progress = {
        totalCredits: {
            required: programElective.totalCredits,
            completed: 0,
            remaining: programElective.totalCredits
        },
        completedCSE: [],
        completedOther: []
    };

    // Filter completed electives
    const completedElectives = completedCourses.filter(code => {
        // Exclude courses from other categories
        return !isRequiredCourse(code);
    });

    // Separate CSE and non-CSE electives
    progress.completedCSE = completedElectives.filter(code => 
        code.startsWith('CSE')
    );
    progress.completedOther = completedElectives.filter(code => 
        !code.startsWith('CSE')
    );

    progress.totalCredits.completed = 
        (progress.completedCSE.length + progress.completedOther.length) * 
        programElective.creditsPerCourse;
    progress.totalCredits.remaining = 
        progress.totalCredits.required - progress.totalCredits.completed;

    progress.meetsRequirements = 
        progress.completedCSE.length >= programElective.minimumCSE;

    return progress;
};

// Track Project/Thesis progress
const trackProjectProgress = (completedCourses) => {
    const thesis = degreePlan.categories.projectInternshipThesis;
    const progress = {
        totalCredits: {
            required: thesis.totalCredits,
            completed: 0,
            remaining: thesis.totalCredits
        },
        completed: [],
        remaining: thesis.required
    };

    progress.completed = thesis.required.filter(code => 
        completedCourses.includes(code)
    );
    progress.remaining = thesis.required.filter(code => 
        !completedCourses.includes(code)
    );

    progress.totalCredits.completed = calculateStreamCredits(progress.completed);
    progress.totalCredits.remaining = 
        progress.totalCredits.required - progress.totalCredits.completed;

    return progress;
};

// Calculate credits for a list of courses
const calculateStreamCredits = (courses) => {
    return courses.reduce((total, code) => total + getCourseCredits(code), 0);
};

// Validate stream-specific requirements
const validateStreamRequirements = (stream, progress) => {
    // Check required courses
    if (stream.required && progress.remaining.length > 0) {
        return false;
    }

    // Check minimum optional requirements
    if (stream.minimumOptional && 
        progress.optionalCompleted.length < stream.minimumOptional) {
        return false;
    }

    return true;
};

// Validate overall degree progress
const validateDegreeProgress = (progress) => {
    // Check total credits
    if (progress.totalCredits.completed < degreePlan.totalCreditsRequired) {
        return false;
    }

    // Check University Core requirements
    const uniCore = progress.universityCore;
    for (const stream of Object.values(uniCore.streams)) {
        if (!stream.meetsRequirements) {
            return false;
        }
    }

    // Check School Core completion
    if (progress.schoolCore.remaining.length > 0) {
        return false;
    }

    // Check Program Core completion
    if (progress.programCore.remaining.length > 0) {
        return false;
    }

    // Check Program Elective requirements
    if (!progress.programElective.meetsRequirements) {
        return false;
    }

    // Check Project/Thesis completion
    if (progress.projectInternshipThesis.remaining.length > 0) {
        return false;
    }

    return true;
};

// Suggest GenEd electives based on completed requirements
const suggestGenEdElectives = (completedCourses) => {
    const progress = trackUniversityCoreProgress(completedCourses);
    const suggestions = {
        highPriority: [],
        recommended: [],
        additional: []
    };

    const uniCore = degreePlan.categories.universityCore.streams;

    // Check each stream
    for (const [streamName, stream] of Object.entries(uniCore)) {
        const streamProgress = progress.streams[streamName];

        // Suggest required courses first
        if (streamProgress.remaining.length > 0) {
            suggestions.highPriority.push(...streamProgress.remaining);
        }

        // Suggest courses to meet minimum optional requirements
        if (stream.minimumOptional && 
            streamProgress.optionalCompleted.length < stream.minimumOptional) {
            const remaining = stream.optional.filter(code => 
                !completedCourses.includes(code)
            );
            suggestions.recommended.push(...remaining);
        }

        // Add remaining optional courses as additional suggestions
        if (stream.optional) {
            const additional = stream.optional.filter(code => 
                !completedCourses.includes(code) && 
                !suggestions.recommended.includes(code)
            );
            suggestions.additional.push(...additional);
        }
    }

    return suggestions;
};

module.exports = {
    trackDegreeProgress,
    suggestGenEdElectives
};
