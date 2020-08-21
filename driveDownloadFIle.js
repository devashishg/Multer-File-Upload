const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = './token.json';


async function downloadFile(req, res, next) {
    fs.readFile('./backend/_helpers/credentials.json', (err, content) => {
        authorize(JSON.parse(content), {}, (obj, OAuth) => {
            const drive = google.drive({ version: 'v3', auth: OAuth });
            var fileId = req.params.id;
            res.status(202);
            drive.files.get({
                fileId: fileId,
                alt: 'media'
            })            
            .then(val=>{
                // console.log( val.headers);
                // console.log( val.config);
                res.write(val.data);
            }).catch(err=>{
                console.log(err);
                res.status(500).write(err);
            }).finally(()=>{
                console.log('DONE');
                res.status(200).end();
            })
        });
    });
}


function authorize(credentials, obj, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err || token.length === 0) return getAccessToken(oAuth2Client, obj,  callback);
      await oAuth2Client.setCredentials(JSON.parse(token));
      OAuth2 = await oAuth2Client;
      callback(obj, OAuth2)
    });
  }
  
  
  
  function getAccessToken(oAuth2Client,{stream, name, mimeType},  callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:\n', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: \n', async (code) => {
      rl.close();
      await oAuth2Client.getToken(code, async (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        await oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        OAuth2 = await oAuth2Client;
        callback(obj, OAuth2)
      });
    });
  }
