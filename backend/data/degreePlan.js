const degreePlan = {
    totalCreditsRequired: 136,
    program: "CSE",
    department: "CSE",
    categories: {
        universityCore: {
            totalCredits: 39,
            streams: {
                writingComprehension: {
                    required: ["ENG101", "ENG102", "ENG103"],
                    foundation: ["ENG091"],
                    credits: {
                        "ENG091": 0,
                        "ENG101": 3,
                        "ENG102": 3,
                        "ENG103": 3
                    }
                },
                mathAndSciences: {
                    required: ["MAT110", "PHY111", "STA201"],
                    foundation: ["MAT092"],
                    optional: ["CHE101", "BIO101", "ENV103"],
                    credits: {
                        "MAT092": 0,
                        "MAT110": 3,
                        "PHY111": 3,
                        "STA201": 3
                    }
                },
                artsAndHumanities: {
                    required: ["HUM103", "BNG103"],
                    optional: ["HUM101", "HUM102", "HST102", "HST103", "HST104", 
                             "HUM207", "ENG110", "ENG113", "ENG114", "ENG115", "ENG333"],
                    credits: {
                        "HUM103": 3,
                        "BNG103": 3
                    },
                    minimumOptional: 1
                },
                socialSciences: {
                    required: ["EMB101"],
                    optional: ["PSY101", "SOC101", "ANT101", "POL101", "BUS201", 
                             "ECO101", "ECO102", "ECO105", "BUS102", "POL102", 
                             "POL103", "POL201", "POL202", "PSY102", "DEV104", 
                             "DEV201", "SOC201", "ANT202", "ANT342", "ANT351", 
                             "BUS333", "BUS334", "BUS335"],
                    credits: {
                        "EMB101": 3
                    },
                    minimumOptional: 1
                },
                transformation: {
                    optional: ["CST201", "CST301", "CST302", "CST303", "CST304", 
                             "CST305", "CST306", "CST307", "CST308", "CST309", "CST310"],
                    minimumOptional: 1
                }
            },
            electiveRules: "After completing minimum requirements (11 courses), 2 GenEd electives from Streams 2-5 or any non-CSE elective"
        },
        schoolCore: {
            totalCredits: 12,
            required: ["MAT120", "MAT215", "MAT216", "PHY112"],
            credits: {
                "MAT120": 3,
                "MAT215": 3,
                "MAT216": 3,
                "PHY112": 3
            }
        },
        programCore: {
            totalCredits: 75,
            courses: [
                { code: "CSE110", name: "Programming Language I", credits: 3 },
                { code: "CSE111", name: "Programming Language II", credits: 3 },
                { code: "CSE220", name: "Data Structures", credits: 3 },
                { code: "CSE221", name: "Algorithms", credits: 3 },
                { code: "CSE230", name: "Discrete Mathematics", credits: 3 },
                { code: "CSE250", name: "Circuits and Electronics", credits: 3 },
                { code: "CSE251", name: "Electronic Devices and Circuits", credits: 3 },
                { code: "CSE260", name: "Digital Logic Design", credits: 3 },
                { code: "CSE320", name: "Data Communications", credits: 3 },
                { code: "CSE321", name: "Operating System", credits: 3 },
                { code: "CSE330", name: "Numerical Methods", credits: 3 },
                { code: "CSE331", name: "Automata and Computability", credits: 3 },
                { code: "CSE340", name: "Computer Architecture", credits: 3 },
                { code: "CSE341", name: "Microprocessors", credits: 3 },
                { code: "CSE350", name: "Digital Electronics and Pulse Techniques", credits: 3 },
                { code: "CSE360", name: "Computer Interfacing", credits: 3 },
                { code: "CSE370", name: "Database Systems", credits: 3 },
                { code: "CSE420", name: "Compiler Design", credits: 3 },
                { code: "CSE421", name: "Computer Networks", credits: 3 },
                { code: "CSE422", name: "Artificial Intelligence", credits: 3 },
                { code: "CSE423", name: "Computer Graphics", credits: 3 },
                { code: "CSE460", name: "VLSI Design", credits: 3 },
                { code: "CSE461", name: "Introduction to Robotics", credits: 3 },
                { code: "CSE470", name: "Software Engineering", credits: 3 },
                { code: "CSE471", name: "Systems Analysis and Design", credits: 3 }
            ]
        },
        programElective: {
            totalCredits: 6,
            minimumCSE: 1,
            creditsPerCourse: 3
        },
        projectInternshipThesis: {
            totalCredits: 4,
            required: ["CSE400"],
            credits: {
                "CSE400": 4
            }
        }
    }
};

// Helper function to get course credits
const getCourseCredits = (courseCode) => {
    // Check program core courses
    const programCore = degreePlan.categories.programCore.courses.find(
        course => course.code === courseCode
    );
    if (programCore) return programCore.credits;

    // Check school core courses
    if (degreePlan.categories.schoolCore.credits[courseCode]) {
        return degreePlan.categories.schoolCore.credits[courseCode];
    }

    // Check university core courses
    const uniCore = degreePlan.categories.universityCore.streams;
    for (const stream of Object.values(uniCore)) {
        if (stream.credits && stream.credits[courseCode]) {
            return stream.credits[courseCode];
        }
    }

    // Check thesis/project
    if (degreePlan.categories.projectInternshipThesis.credits[courseCode]) {
        return degreePlan.categories.projectInternshipThesis.credits[courseCode];
    }

    // Default for program electives
    if (courseCode.startsWith('CSE')) {
        return degreePlan.categories.programElective.creditsPerCourse;
    }

    return 3; // Default credits for other courses
};

// Helper function to check if a course is required
const isRequiredCourse = (courseCode) => {
    // Check program core
    if (degreePlan.categories.programCore.courses.some(course => course.code === courseCode)) {
        return true;
    }

    // Check school core
    if (degreePlan.categories.schoolCore.required.includes(courseCode)) {
        return true;
    }

    // Check university core required courses
    const uniCore = degreePlan.categories.universityCore.streams;
    for (const stream of Object.values(uniCore)) {
        if (stream.required && stream.required.includes(courseCode)) {
            return true;
        }
    }

    // Check thesis/project
    if (degreePlan.categories.projectInternshipThesis.required.includes(courseCode)) {
        return true;
    }

    return false;
};

module.exports = {
    degreePlan,
    getCourseCredits,
    isRequiredCourse
};
