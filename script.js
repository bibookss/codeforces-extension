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
        
        const _problems = json['result']['problems']
        const problems  = []
        for (const key in _problems) {
            const contest_id = _problems[key]['contestId']
            const prob_index = _problems[key]['index']
            const problem_id = `${contest_id}-${prob_index}`

            problems.push(problem_id)
        }

        return problems

    } catch (e) {
        console.error('Error: ' + e)
        throw e
    }
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

    console.log(seed)
    console.log(random_number)

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
    
    // Get a random problem
    const problem = getRandomProblem(problems_list, user_solved, random_number)
    console.log(problem)

    // Get random problem details
    const contest_id = problem.split('-')[0]
    const prob_index = problem.split('-')[1]
    const problem_link = `https://codeforces.com/problemset/problem/${contest_id}/${prob_index}`
    console.log(problem_link)
}

main()