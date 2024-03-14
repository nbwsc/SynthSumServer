const tencentcloud = require('tencentcloud-sdk-nodejs');
const credentials = require('../config/apikeys').TranslateCredentials;

function getRandomCredential() {
  const index = Math.floor(Math.random() * credentials.length);
  return credentials[index];
}

async function translate(txt, useMine = false) {
  const credential = useMine ? credentials[0] : getRandomCredential();
  console.log(credential.secretId);
  const client = new tencentcloud.tmt.v20180321.Client({
    credential,
    region: 'ap-beijing',
    profile: {
      signMethod: 'TC3-HMAC-SHA256',
      httpProfile: {
        reqMethod: 'POST',
        reqTimeout: 30,
        endpoint: 'tmt.ap-beijing.tencentcloudapi.com',
      },
    },
  });

  const data = await client.TextTranslate({
    SourceText: txt,
    Source: 'en',
    Target: 'zh',
    ProjectId: 0,
  });
  if (data.TargetText) {
    return data.TargetText;
  }
  return txt;
}

module.exports = {
  translate,
};
