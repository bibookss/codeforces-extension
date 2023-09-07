const getUserInformation = async (user_url) => {
    try {
        const response = await fetch(user_url);
        if (!response.ok) {
            throw new Error('Network response not found')
        }
        const json = await response.json()

        const user = {
            'handle': json['result'][0]['handle'],
            'organization': json['result'][0]['organization'],
            'rank': json['result'][0]['rank'],
            'rating': json['result'][0]['rating']
        }
        return user
    } catch (e) {
        console.error('Error: ' + e)
        throw e
    }
}

const getProblems = async (problems_url) => {
    try {
        const response = await fetch(problems_url);
        if (!response.ok) {
            throw new Error('Network response not found')
        }
        const json = await response.json()
        const problems = json['result']['problems']

        return problems

    } catch (e) {
        console.error('Error: ' + e)
        throw e
    }
}

const parseProblems = (problem_list) => {
    const problems  = []
    for (const key in problem_list) {
        const contest_id = problem_list[key]['contestId']
        const prob_index = problem_list[key]['index']
        const problem_id = `${contest_id}-${prob_index}`

        problems.push(problem_id)
    }

    return problems
}

const getUserSubmissions = async (user_submissions_url) => {
    try {
        const response = await fetch(user_submissions_url);
        if (!response.ok) {
            throw new Error('Network response not found')
        }
        const json = await response.json()
        return json['result']
        
    } catch (e) {
        console.error('Error: ' + e)
        throw e
    }
}

const getUserSolvedProblems =  (user_submissions) => {
    const unique_solved = []

    for (const key in user_submissions) {
        const contest_id = user_submissions[key]['problem']['contestId']
        const prob_index = user_submissions[key]['problem']['index']
        const problem_id = `${contest_id}-${prob_index}`
        const verdict = user_submissions[key]['verdict']

        if (verdict == 'OK' && !(problem_id in unique_solved)) {
            unique_solved.push(problem_id)
        }
    }

    return unique_solved
}

const getRandomProblem = (problems, user_solved, random_number) => {
    const unsolved = problems.filter(prob => !user_solved.includes(prob));
    return unsolved[Math.floor(random_number) % unsolved.length]
}

const getProblemDetails = (problem_list, problem) => {
    for (const key in problem_list) {
        const contest_id = problem_list[key]['contestId']
        const prob_index = problem_list[key]['index']
        const problem_id = `${contest_id}-${prob_index}`

        if (problem_id == problem) {
            return {
                'url': `https://codeforces.com/problemset/problem/${contest_id}/${prob_index}`,
                'name': problem_list[key]['name'],
                'rating': problem_list[key]['rating']
            }
        }
    }
}

const padTo2Digits = (num) => {
    return num.toString().padStart(2, '0');
  }
  
const formatDate = (date) => {
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-');
}

async function main() {
    const seedrandom = require('seedrandom')
    const seed = formatDate(new Date())
    const generator = seedrandom(seed);
    const random_number = generator();

    // User Information
    const handle = '0paline'
    const user_url = `https://codeforces.com/api/user.info?handles=${handle}`
    const user = await getUserInformation(user_url)

    // User solved
    const user_submissions_url = `https://codeforces.com/api/user.status?handle=${handle}`
    const user_submissions = await getUserSubmissions(user_submissions_url)
    const user_solved = getUserSolvedProblems(user_submissions)

    // Problems
    const tags = ['implementation', 'strings']
    const tags_query = tags.toString().replaceAll(',', ';')
    const problems_url =`https://codeforces.com/api/problemset.problems?tags=${tags_query}`
    const problems_list = await getProblems(problems_url)
    const problems = parseProblems(problems_list)
    
    // Get a random problem
    const problem = getRandomProblem(problems, user_solved, random_number)

    // Get random problem details
    const problem_details = getProblemDetails(problems_list, problem)
    console.log(problem_details)
}

main()