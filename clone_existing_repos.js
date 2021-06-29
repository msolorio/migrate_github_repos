const https = require('https');
const { exec } = require('child_process');
require('dotenv').config();


function getRepoData(pageNum) {
  return new Promise((resolve, reject) => {
    https.get(`https://git.generalassemb.ly/api/v3/orgs/${ENTERPRISE_ORG_NAME}/repos\?type\=all&&page=${pageNum}&per_page=100`, {
      headers: {
        Authorization: `token ${process.env.ENTERPRISE_GITHUB_ACCESS_TOKEN}`,
        'Accept' : 'application/vnd.github.v3+json'
      }  
    }, (response) => {
      let data = '';
    
      response.on('data', (chunk) => {
        data += chunk;
      });
    
      response.on('end', () => {
        const parsedData = JSON.parse(data);
        console.log('================================')
        console.log(JSON.parse(data))
        console.log('================================')
        
        resolve(parsedData);
      })
    }).on('error', (err) => {
      console.log('error:', err.message);
      reject(err.message);
    })
  });
}


function getClonedRepos() {
  return new Promise((resolve) => {
    exec('ls ./cloned_lessons', (err, stdout) => {
      if (err) console.log(err);
  
      const repoNames = stdout.split('\n');
      repoNames.pop();
  
      resolve(repoNames);
    });
  })
}


async function cloneRepos(cloneUrls) {
  const clonedRepos = await getClonedRepos();

  cloneUrls.forEach((repoObj) => {
    exec(`git clone ${repoObj.cloneUrl} ./cloned_lessons/${repoObj.repoName}`);
  });
}


function resetLessonDir() {
  return new Promise((resolve, reject) => {
    exec('rm -rf ./cloned_lessons', (err) => {
      if (err) {
        console.log('Error reseting lesson dir');
        reject();
      }

      exec('mkdir ./cloned_lessons', (err) => {
        if (err) {
          console.log('Error reseting lesson dir');
          reject();
        }

        resolve();
      });
    });
  })
}


async function init() {
  await resetLessonDir();

  // const repoDataPageOne = await getRepoData(1);
  const repoDataPageTwo = await getRepoData(2);

  // const repoData = [...repoDataPageOne, ...repoDataPageTwo];
  // const repoData = repoDataPageOne.slice(0, 26);
  const repoData = repoDataPageTwo.slice(0, 26);
  
  const repoObjs = repoData.map((repoObj) => {
    // return repoObj.html_url;
    return {
      cloneUrl: repoObj.clone_url,
      repoName: repoObj.name
    }
  });
  
  console.log('================================')
  console.log('repoObjs:');
  console.log(repoObjs);
  console.log('repoObjs.length:')
  console.log(repoObjs.length);
  console.log('================================');

  cloneRepos(repoObjs);
}

init();