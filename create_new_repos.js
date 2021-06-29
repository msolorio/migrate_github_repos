const https = require('https');
const { exec } = require('child_process');

// Loop through array of existing repos

// For each repo
  // create a new repo on public github org
  // add remote for new public repo
  // push up local repo to new public repo


function getRepoNames() {
  return new Promise((resolve, reject) => {
    exec('ls ./cloned_lessons', (err, stdout, stderr) => {
      if (err) console.log(err);
  
      const repoNames = stdout.split('\n');
      repoNames.pop();
  
      resolve(repoNames);
    });
  })
}


function getRepos(repoNames) {
  return new Promise((resolve, reject) => {
    https.get('https://api.github.com/orgs/SEIR-7-06/repos?type=all', {
      headers: {
        Authorization: `token ${process.env.PUBLIC_GITHUB_ACCESS_TOKEN}`,
        'Accept' : 'application/vnd.github.v3+json',
        'user-agent': 'curl/7.55.1'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        console.log(data);
        
        const parsedData = JSON.parse(data);
        console.log('================================')
        // console.log(JSON.parse(data))
        console.log('================================')
        
        resolve(parsedData);
      });
    }).on('error', (err) => {
      console.log('error:', err.message);
      reject(err.message);
    });
  });
}


function createOneRepo(repoName) {
  return new Promise((resolve, reject) => {
    let data = null;
    
    const request = https.request('https://api.github.com/orgs/SEIR-7-06/repos', {
      method: 'POST',
      headers: {
        Authorization: `token ${process.env.PUBLIC_GITHUB_ACCESS_TOKEN}`,
        'Accept' : 'application/vnd.github.v3+json',
        'user-agent': 'curl/7.55.1'
      },
    }, (response) => {

      console.log('statusCode:', response.statusCode);
    });
  
    request.on('error', (err) => {
      console.log('Error creating repo', repoName, err);
      resolve();
    });

    request.write(`{ "name": "${repoName}" }`);

    request.end(() => {
      resolve();
    });

  })
}


function addPublicRemote(repoName) {
  return new Promise((resolve, reject) => {

    // exec(`git remote add ga-706-pub https://github.com/SEIR-7-06/Arrays-iterating-over-them.git`, { cwd: `./cloned_lessons/${repoName}` }, (err, stdout, stderr) => {
    exec(`git remote add ga-706-pub git@github.com:SEIR-7-06/${repoName}.git`, { cwd: `./cloned_lessons/${repoName}` }, (err, stdout, stderr) => {
      if (err) {
        console.log('Error adding public remote', repoName, err);
        resolve();
      };

      resolve();
    });
  });
}


function renameMainBranch(repoName) {
  return new Promise((resolve, reject) => {
    exec('git branch -m main', { cwd: `./cloned_lessons/${repoName}` }, (err, stdout) => {
      if (err) {
        console.log('Error renaming branch', repoName, err);
        resolve();
      }

      resolve();
    })
  })
}


function pushUpCode(repoName) {
  return new Promise((resolve, reject) => {
    exec(`git push ga-706-pub main`, { cwd: `./cloned_lessons/${repoName}` }, (err, stdout) => {
      if (err) {
        console.log('Error pushing up code', repoName, err);
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
