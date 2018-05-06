## SSH2 SFTP Client
a SFTP client for node.js, a wrapper for [ssh2](https://github.com/mscdex/ssh2)

### Installation
```shell
npm install sftp-client-promise
```

### Usage
```javascript
let Client = require('sftp-client-promise');
let conn = new Client();
conn.connect({
    host: '127.0.0.1',
    port: '8080',
    username: 'username',
    password: '******'
}).then(() => {
    return conn.sftp('readdir', {path: '/pathname'});
}).then((data) => {
    console.log(data, 'the data info');
}).catch((err) => {
    console.log(err, 'catch error');
    conn.end();
});
```

### Documentation
the connection to server config pls see [ssh2 client event](https://github.com/mscdex/ssh2#user-content-client-methods).

list of methods: all the methods will return a Promise;

#### readdir
read a directory
```
conn.sftp('readdir', {path: remoteFilePath})
```

directory info:

```
type: // file type(-, d, l)
name: // file name
size: // file size
modifyTime: // file timestamp of modified time
accessTime: // file timestamp of access time
rights: {
    user:
    group:
    other:
},
owner: // user ID
group: // group ID

```

#### exists
return true if the path(file or directory) exists, false otherwise.
```
conn.sftp('exists', {path: remotePath})
```

#### createReadStream
download file from remote server
```
conn.sftp('createReadStream',  {
  path: remoteFilePath, 
  stream: localWriteStream, 
  option: option
})
```
for example:
```javascript
conn.sftp('createReadStream', { 
  path: '/home/temp.gz', 
  stream: fs.createWriteStream('./local/temp.gz')
})
```
#### createWriteStream
upload file from local, data(stream | buffer | string)
```
conn.sftp('createWriteStream',  {
  path: remoteFilePath, 
  data: stream | buffer | string, 
  option: option
})
```
for example:
```javascript
conn.sftp('createWriteStream', { 
  path: '/home/temp.gz', 
  data: fs.createReadStream('./local/temp.gz')
  //data: fs.readFileSync('./local/temp.gz')
  //data: 'some local data'
})
```
#### fastGet
download file from remote server
```
conn.sftp('fastGet', {remotePath: remotePath, localPath: localPath})
```
#### fastPut
upload local file to remote serer
```
conn.sftp('fastPut', {localPath: localPath, remotePath: remotePath})
```

#### readFile
download remote server file
```
conn.sftp('readFile', {path: remoteFilePath, option: option})
```
#### writeFile
upload file to remote server 
```
conn.sftp('writeFile', {path: remoteFilePath, data: localFilePath, option: option})
```
#### appendFile
append local data to remote server file
```
conn.sftp('appendFile', {path: remoteFilePath, data: localData, option: option})
```
#### mkdir

create a new directory.
```
conn.sftp('mkdir', {path: remoteFilePath});
```

#### rmdir

remove the directory.
```
conn.sftp('rmdir', {path: localPath});
```

#### unlink

delete file.
```
conn.sftp('delete', {path: remoteFilePath});
```

#### rename

rename remoteSourcePath to remoteDestPath (removes remoteSourcePath).
```
conn.sftp('rename', {oldPath: remoteSourcePath, newPath: remoteDestPath});
```

#### chmod

modify rights to remoteDestPath file
```
conn.sftp('chmod', {path: remoteDestPath,  mode: mode});
```
####connect

connection config you will see [here](https://github.com/mscdex/ssh2#user-content-client-methods)

#### end

close the sftp connection. when you need it, you can call it in `then()` or `catch()`.

```
conn.end();
```







