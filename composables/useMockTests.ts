export const useMockTests = () => {
    return [
        {
            id: 1,
            title: 'Frontend Basics',
            description: 'HTML, CSS, JS fundamentals',
            duration: 10,
            questions: [
                {
                    text: 'What does HTML stand for?',
                    options: {
                        A: 'Hyper Trainer Marking Language',
                        B: 'Hyper Text Markup Language',
                        C: 'High Text Machine Language',
                        D: 'None of the above',
                    },
                },
                {
                    text: 'Which language is used for styling web pages?',
                    options: {
                        A: 'HTML',
                        B: 'JQuery',
                        C: 'CSS',
                        D: 'XML',
                    },
                },
            ],
        },
    ]
}
