const getUserInformation = async (user_url) => {
    try {
        const response = await fetch(user_url);
        if (!response.ok) {
            throw new Error('Network response not found')
        }
        const json = await response.json()
        return json
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
        return json
    } catch (e) {
        console.error('Error: ' + e)
        throw e
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
    const randomNumber = generator();

    console.log(seed)
    console.log(randomNumber)

    // User Information
    const handle = '0paline'
    const user_url = 'https://codeforces.com/api/user.info?handles=' + handle
    const user_information = await getUserInformation(user_url)
    console.log(user_information)

    // Problems
    const tags = 'implementation'
    const problems_url = 'https://codeforces.com/api/problemset.problems?tags=' + tags
    const problems_list = await getProblems(problems_url)
    console.log(problems_list)
}

main()