const seedrandom = require('seedrandom')

const seed = new Date()
const generator = seedrandom(seed);
const randomNumber = generator();

console.log(seed)
console.log(randomNumber)

const handle = '0paline'


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

// User Information
const user_url = 'https://codeforces.com/api/user.info?handles=' + handle
const user_information = await getUserInformation(user_url)
// Problems
console.log(user_information)
const tags = 'implementation'
const problems_url = 'https://codeforces.com/api/problemset.problems?tags=' + tags
const problems_list = fetch(problems_url).then((response) => response.json())
