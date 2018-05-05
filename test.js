let fs = require('fs');
let Client = require('./index.js');
let conn = new Client();

conn.connect({
    host: '127.0.0.1',
    port: 22,
    username: 'username',
    password: '******'
})
  //.then(() => conn.sftp('appendFile', {path: '/root/t.js', data: 'test'}))
  //.then(() => conn.sftp('writeFile', {path: '/root/t.js', data: fs.readFileSync('./README.md')}))
  //.then(() => conn.sftp('readFile', {path: '/root/t.js', option: {encoding: 'utf8'}}))
  //.then(() => conn.sftp('readdir', {path: '/root'}))
  //.then(() => {
  //     let writeStream = fs.createWriteStream('./README.md');
  //     return conn.sftp('createReadStream', {path: '/root/README.md', stream: writeStream})
  //})
  //.then(() => conn.sftp('createWriteStream', {path: '/root/README.md', data: fs.createReadStream('./README.md')}))
  //.then(() => conn.sftp('unlink',{path: '/root/README.md'}))
  //.then(() => conn.sftp('rmdir', {path: '/root/test'}))
  //.then(() => conn.sftp('exists',{path: '/root/test'}))
  //.then((isExist) => isExist ? '' : conn.sftp('mkdir', {path: '/root/test'}))
  //.then(() => conn.sftp('fastPut', {
  //       localPath: __dirname+'/test.gz', 
  //       remotePath: '/root/test.gz.tmp'
  //}))
  //.then(() => conn.sftp('rename', {
  //       oldPath: '/root/test.gz.tmp', 
  //       newPath: '/root/test.gz'
  //}))
  .then(console.log)
  .then(() => conn.end())
  .catch(console.log);




