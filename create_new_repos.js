const https = require('https');
const { exec } = require('child_process');


function getRepoNames() {
  return new Promise((resolve) => {
    exec('ls ./cloned_lessons', (err, stdout) => {
      if (err) console.log(err);
  
      const repoNames = stdout.split('\n');
      repoNames.pop();
  
      resolve(repoNames);
    });
  })
}


function createOneRepo(repoName) {
  return new Promise((resolve) => {
    const request = https.request(`https://api.github.com/orgs/${PUBLIC_ORG_NAME}/repos`, {
      method: 'POST',
      headers: {
        Authorization: `token ${process.env.PUBLIC_GITHUB_ACCESS_TOKEN}`,
        'Accept' : 'application/vnd.github.v3+json',
        'user-agent': 'curl/7.55.1'
      },
    }, (response) => console.log('statusCode:', response.statusCode));
  
    request.on('error', (err) => {
      console.log('Error creating repo. Repo Name:', repoName, err);
      resolve();
    });

    request.write(`{ "name": "${repoName}" }`);

    request.end(() => resolve());

  })
}


function addPublicRemote(repoName) {
  return new Promise((resolve, reject) => {
    exec(`git remote add ga-706-pub git@github.com:SEIR-7-06/${repoName}.git`, { cwd: `./cloned_lessons/${repoName}` }, (err, stdout, stderr) => {
      if (err) {
        console.log('Error adding public remote. Repo Name:', repoName, err);
        resolve();
      };

      resolve();
    });
  });
}


function renameMainBranch(repoName) {
  return new Promise((resolve) => {
    exec('git branch -m main', { cwd: `./cloned_lessons/${repoName}` }, (err) => {
      if (err) {
        console.log('Error renaming branch. Repo Name:', repoName, err);
        resolve();
      }

      resolve();
    })
  })
}


function pushUpCode(repoName) {
  return new Promise((resolve, reject) => {
    exec(`git push ga-706-pub main`, { cwd: `./cloned_lessons/${repoName}` }, (err) => {
      if (err) {
        console.log('Error pushing up code. Repo Name:', repoName, err);
        resolve();
      };

      resolve();
    });
  });
}


async function createRepos(repoNames) {
  repoNames.forEach(async (repoName) => {
    await createOneRepo(repoName);

    await addPublicRemote(repoName);

    await renameMainBranch(repoName);

    await pushUpCode(repoName);
  });
}


async function init() {
  const repoNames = await getRepoNames();

  console.log(repoNames);

  createRepos(repoNames);
}

init();
