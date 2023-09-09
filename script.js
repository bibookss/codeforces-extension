document.addEventListener('DOMContentLoaded', async function () {
    // clear storage
    // chrome.storage.local.clear(function () { 
    //     var error = chrome.runtime.lastError; 
    //     if (error) { 
    //         console.error(error); 
    //     }
    // })

    const inputContainer = document.getElementById('input-container')
    const usernameSaveButton = document.getElementById('save-username-button')
    const usernameInput = document.getElementById('username-input')
    const username = document.getElementById('username')
    const userRating = document.getElementById('user-rating')
    const userRank = document.getElementById('user-rank')
    const problemName = document.getElementById('problem-name')
    const problemRating = document.getElementById('problem-rating')
    const problemTags = document.getElementById('problem-tags')
    const problemLink = document.getElementById('problem-link')
    const submitContainer = document.getElementById('submit-container')
    const submitButton = document.getElementById('submit-button')
    const submitStatus = document.getElementById('submit-status')

    let user = {}
    let problem = {}
    const problems = await getProblems()

    usernameSaveButton.addEventListener('click', async function () {
        user = await setUserDetails(usernameInput.value)
        problem = await setProblemDetails(problems, user['solved'])

        // Hide user input div
        inputContainer.style.display = 'none';

        if (username && userRating && userRank) {
            username.textContent = user['username']
            userRating.textContent = user['rating']
            userRank.textContent = user['rank']
        }

        if (problemName && problemRating && problemTags && problemLink) {
            problemName.textContent = problem['name']
            problemRating.textContent = problem['rating']
            problemTags.textContent = problem['tags'].join(', ')
            problemLink.textContent = problem['url']
        }

        if (submitContainer) {
            submitContainer.style.display = 'block';
            
            submitStatus.textContent = 'Not Attempted'
        }
    })
    

    chrome.storage.local.get(['user'], async function (result) {
        if (result.user) {
            user = result.user
            username.textContent = user['username']
            userRating.textContent = user['rating']
            userRank.textContent = user['rank']
    
            inputContainer.style.display = 'none';
        } else {
            console.log('User not found');

            inputContainer.style.display = 'block';
        }
    });

    chrome.storage.local.get(['problem'], async function (result) {
        if (result.problem) {
            problem = result.problem

            if (problemName && problemRating && problemTags && problemLink) {
                problemName.textContent = problem['name']
                problemRating.textContent = problem['rating']
                problemTags.textContent = problem['tags'].join(', ')
                problemLink.textContent = problem['url']
            }
        } else {
            console.log('Problem not found');
        }
    });
});

const setProblemDetails = async (problems, solved) => {
    const problem = getRandomProblem(problems, solved)
    problem['url'] = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`

    // Save problem to storage
    chrome.storage.local.set({ problem: problem }, function () {
        console.log('Problem saved: ' + problem['name']);
    });

    return problem
}

const setUserDetails = async (username) => {
    const user = await getUserDetails(username)
    user['solved'] = await getUserSubmissions(username)

    // Save user to storage
    chrome.storage.local.set({ user: user }, function () {
        console.log('User saved: ' + user['username']);
    });
    
    return user
}

const getRandomNumber = () => {
    let seed = Date.now()
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
}

const getRandomProblem = (problems, solved) => {
    // Get all problem ids and filer solved problems
    let problemIds = Object.keys(problems)
    problemIds = problemIds.filter(problemId => !solved.includes(problemId))

    const random_number = getRandomNumber()
    console.log('Random number: ' + random_number)

    const randomIndex = Math.floor(random_number * problemIds.length) % problemIds.length
    console.log('Random index: ' + randomIndex)

    const problemId = problemIds[randomIndex]

    return problems[problemId]
}

const getProblems = async () => {
    let url = `https://codeforces.com/api/problemset.problems`
    try {
        const response = await fetch(url);
        const data = await response.json();

        const problems = data.result.problems

        // Check if data.result exists and contains at least one element
        if (problems && problems.length > 0) {
            const parsedProblems = parseProblems(problems)
            return parsedProblems
        } else {
            throw new Error('Problems not found');
        }
    } catch (error) {
        console.error('Error fetching problems:', error);
        throw error;
    }
}

const parseProblems = (problems) => {
    const parsedProblems = {}

    for (const problem of problems) {
        const problemId = `${problem.contestId}-${problem.index}`
        parsedProblems[problemId] = problem
    }

    return parsedProblems
}

const getUserDetails = async (username) => {
    let url = `https://codeforces.com/api/user.info?handles=${username}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Check if data.result exists and contains at least one element
        if (data.result && data.result.length > 0) {
            return {
                'username': username,
                'rating': data.result[0].rating,
                'rank': data.result[0].rank
            };
        } else {
            throw new Error('User data not found');
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error; 
    }
};

const getUserSubmissions = async (username) => {
    let url = `https://codeforces.com/api/user.status?handle=${username}`
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Check if data.result exists and contains at least one element
        if (data.result && data.result.length > 0) {
            const submissions = data.result;
            const solved = parseUserSubmissions(submissions);
            return solved;
        } else {
            throw new Error('User submissions not found');
        }

    } catch (error) {
        console.error('Error fetching user submissions:', error);
        throw error; 
    }
}

const parseUserSubmissions = (submissions) => {
    const solvedProblems = [];
    for (const submission of submissions) {
        const constestId = submission.problem.contestId;
        const problemIndex = submission.problem.index;
        const verdict = submission.verdict;

        const problemId = `${constestId}-${problemIndex}`;

        if (verdict === 'OK' && !solvedProblems.includes(problemId)) {
            solvedProblems.push(problemId);
        }
    }

    return solvedProblems
}
