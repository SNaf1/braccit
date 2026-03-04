const courseTypes = {
    PROGRAM_CORE: 'Program Core',
    SCHOOL_CORE: 'School Core',
    GEN_ED: 'GenEd',
    PROGRAM_ELECTIVE: 'Program Elective',
    THESIS: 'Thesis/Project/Internship'
};

const prerequisites = {
    // Semester 1
    CSE110: {
        semester: 1,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: [],
        softPrereqs: [],
        fullChain: []
    },
    MAT110: {
        semester: 1,
        type: courseTypes.SCHOOL_CORE,
        hardPrereqs: [],
        softPrereqs: [],
        fullChain: []
    },
    ENG101: {
        semester: 1,
        type: courseTypes.GEN_ED,
        hardPrereqs: [],
        softPrereqs: [],
        fullChain: []
    },
    PHY111: {
        semester: 1,
        type: courseTypes.SCHOOL_CORE,
        hardPrereqs: [],
        softPrereqs: [],
        fullChain: []
    },

    // Semester 2
    CSE111: {
        semester: 2,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE110'],
        softPrereqs: [],
        fullChain: ['CSE110']
    },
    CSE230: {
        semester: 2,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: [],
        softPrereqs: [],
        fullChain: []
    },
    PHY112: {
        semester: 2,
        type: courseTypes.SCHOOL_CORE,
        hardPrereqs: ['PHY111'],
        softPrereqs: [],
        fullChain: ['PHY111']
    },
    MAT120: {
        semester: 2,
        type: courseTypes.SCHOOL_CORE,
        hardPrereqs: ['MAT110'],
        softPrereqs: [],
        fullChain: ['MAT110']
    },

    // Semester 3
    BNG103: {
        semester: 3,
        type: courseTypes.GEN_ED,
        hardPrereqs: [],
        softPrereqs: [],
        fullChain: []
    },
    EMB101: {
        semester: 3,
        type: courseTypes.GEN_ED,
        hardPrereqs: [],
        softPrereqs: [],
        fullChain: []
    },
    ENG102: {
        semester: 3,
        type: courseTypes.GEN_ED,
        hardPrereqs: ['ENG101'],
        softPrereqs: [],
        fullChain: ['ENG101']
    },
    HUM103: {
        semester: 3,
        type: courseTypes.GEN_ED,
        hardPrereqs: [],
        softPrereqs: [],
        fullChain: []
    },

    // Semester 4
    CSE220: {
        semester: 4,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE111', 'CSE230'],
        softPrereqs: [],
        fullChain: ['CSE111', 'CSE110', 'CSE230']
    },
    CSE250: {
        semester: 4,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE111'],
        softPrereqs: ['PHY112'],
        fullChain: ['CSE111', 'CSE110']
    },

    // Semester 5
    CSE221: {
        semester: 5,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE220'],
        softPrereqs: [],
        fullChain: ['CSE220', 'CSE111', 'CSE110']
    },
    MAT216: {
        semester: 5,
        type: courseTypes.SCHOOL_CORE,
        hardPrereqs: ['MAT120'],
        softPrereqs: [],
        fullChain: ['MAT120', 'MAT110']
    },
    CSE251: {
        semester: 5,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE250'],
        softPrereqs: [],
        fullChain: ['CSE250', 'CSE111', 'CSE110']
    },
    CSE330: {
        semester: 5,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE230', 'CSE220'],
        softPrereqs: [],
        fullChain: ['CSE230', 'CSE220', 'CSE111', 'CSE110']
    },

    // Semester 6
    CSE321: {
        semester: 6,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE221'],
        softPrereqs: [],
        fullChain: ['CSE221', 'CSE220', 'CSE111', 'CSE110']
    },
    CSE260: {
        semester: 6,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE251'],
        softPrereqs: [],
        fullChain: ['CSE251', 'CSE250', 'CSE111', 'CSE110']
    },

    // Semester 7
    CSE370: {
        semester: 7,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE221'],
        softPrereqs: [],
        fullChain: ['CSE221', 'CSE220', 'CSE111', 'CSE110']
    },
    CSE340: {
        semester: 7,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: [],
        softPrereqs: ['CSE260'],
        fullChain: []
    },
    CSE350: {
        semester: 7,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE251'],
        softPrereqs: [],
        fullChain: ['CSE251', 'CSE250', 'CSE111', 'CSE110']
    },

    // Semester 8
    CSE422: {
        semester: 8,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE221'],
        softPrereqs: [],
        fullChain: ['CSE221', 'CSE220', 'CSE111', 'CSE110']
    },
    CSE320: {
        semester: 8,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: [],
        softPrereqs: [],
        fullChain: []
    },
    CSE341: {
        semester: 8,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: [],
        softPrereqs: ['CSE321', 'CSE340'],
        fullChain: []
    },

    // Semester 9
    CSE331: {
        semester: 9,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE221'],
        softPrereqs: [],
        fullChain: ['CSE221', 'CSE220', 'CSE111', 'CSE110']
    },
    CSE360: {
        semester: 9,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE341'],
        softPrereqs: [],
        fullChain: ['CSE341']
    },
    CSE460: {
        semester: 9,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE260'],
        softPrereqs: [],
        fullChain: ['CSE260', 'CSE251', 'CSE250', 'CSE111', 'CSE110']
    },

    // Semester 10
    CSE420: {
        semester: 10,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE321', 'CSE331', 'CSE340'],
        softPrereqs: [],
        fullChain: ['CSE321', 'CSE331', 'CSE340', 'CSE221', 'CSE220', 'CSE111', 'CSE110']
    },
    CSE421: {
        semester: 10,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: [],
        softPrereqs: ['CSE320'],
        fullChain: []
    },
    CSE423: {
        semester: 10,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['MAT216'],
        softPrereqs: [],
        fullChain: ['MAT216', 'MAT120', 'MAT110']
    },

    // Semester 11
    CSE470: {
        semester: 11,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE370'],
        softPrereqs: [],
        fullChain: ['CSE370', 'CSE221', 'CSE220', 'CSE111', 'CSE110']
    },
    CSE471: {
        semester: 11,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE370'],
        softPrereqs: [],
        fullChain: ['CSE370', 'CSE221', 'CSE220', 'CSE111', 'CSE110']
    },
    CSE461: {
        semester: 11,
        type: courseTypes.PROGRAM_CORE,
        hardPrereqs: ['CSE260'],
        softPrereqs: [],
        fullChain: ['CSE260', 'CSE251', 'CSE250', 'CSE111', 'CSE110']
    }
};

// Course load rules based on CGPA
const courseLoadRules = {
    regular: {
        maxCourses: 4,
        minCGPA: 0
    },
    extended: {
        maxCourses: 5,
        minCGPA: 3.5
    },
    maximum: {
        maxCourses: 6,
        minCGPA: 3.8
    }
};

// First semester combination rule
const firstSemesterCombination = ['ENG101', 'MAT110'];

module.exports = {
    prerequisites,
    courseLoadRules,
    courseTypes,
    firstSemesterCombination
};
