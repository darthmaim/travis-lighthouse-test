const Github = require("@octokit/rest");

readInput().then(setStatus);

function readInput() {
    return new Promise(
        (resolve, reject) => {
            const stdin = process.stdin;
            const chunks = [];

            stdin.resume();
            stdin.setEncoding('utf8');

            stdin.on('data', (chunk) => chunks.push(chunk));

            stdin.on('end', () => {
                const input = JSON.parse(chunks.join(''));
                resolve(input);
            });
        }
    );
}

function setStatus(report) {
    const slug = process.env.TRAVIS_REPO_SLUG,
    const [owner, repo] = slug.split('/');

    const params = {
        owner: owner,
        repo: repo,
        sha: process.env.TRAVIS_COMMIT,
        state: 'success'
    };

    const gh = new Github();

    gh.authenticate({
        type: "oauth",
        token: process.env.GH_STATUS_TOKEN
    });
    
    return Promise.all(report.reportCategories.map(
        (category) => gh.repos.createStatus({
            ...params,
            context: `lighthouse (${category.name})`,
            description: `${Math.round(category.score)}/100`
        })
    ));
}