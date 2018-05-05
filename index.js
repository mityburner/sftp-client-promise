let fs = require('fs');
let Client = require('ssh2').Client;

class SftpClient{
    constructor(){
        this.conn = new Client();
    }
    
    connect(config){
        return new Promise((resolve,reject) => {
            this.conn.on('ready', () => {
                this.conn.sftp((err, sftp) => {
                    if(err) reject(err);
                    this._sftp = sftp;
                    resolve(sftp);
                })
            }).on('error', (err) => reject(err))
              .connect(config);
        });
    }

    end(){
        return new Promise((resolve,reject) => {
            this.conn.end();
            resolve();
        })
    }

    sftp(obj, params){
       return new Promise((resolve, reject) => {
           let sftp = this._sftp;
           if(sftp){
               switch(obj){
                  case 'createReadStream':
                       let readStream = sftp.createReadStream(params.path, params.option);
                           readStream.pipe(params.stream);
                           readStream.on('error', reject);
                           readStream.on('close', resolve);
                       break;
                  case 'createWriteStream':
                       let writeStream = sftp.createWriteStream(params.path, params.option);
                           writeStream.on('error', reject);
                           writeStream.on('close', resolve);
                           params.data instanceof fs.ReadStream ? params.data.pipe(writeStream)
                                                                : writeStream.end(params.data);
                       break;
                  case 'readFile':
                       sftp.readFile(params.path, params.option, (err, list) => {
                           if(err) reject(err);
                           resolve(list);
                       });
                       break;
                  case 'writeFile':
                       sftp.writeFile(params.path, params.data, params.option, (err) => {
                           if(err) reject(err);
                           resolve();
                       });
                       break;
                  case 'appendFile':
                       sftp.appendFile(params.path, params.data, params.option, (err,data) => {
                           if(err) reject(err);
                           resolve();
                       });
                       break;
                  case 'exists':
                       sftp.exists(params.path, resolve);
                       break;
                  case 'unlink':
                       sftp.unlink(params.path, resolve);
                       break;
                  case 'readdir':
                       sftp.readdir(params.path, params.attrs, (err, list) => {
                           if(err) reject(err);
                           let ret = list.map((item) => {
                               return {
                                  type: item.longname.substr(0, 1),
                                  name: item.filename,
                                  size: item.attrs.size,
                                  modifyTime: item.attrs.mtime * 1000,
                                  accessTime: item.attrs.atime * 1000,
                                  rights: {
                                      user: item.longname.substr(1, 3).replace(/-/ig, ''),
                                      group: item.longname.substr(4,3).replace(/-/ig, ''),
                                      other: item.longname.substr(7, 3).replace(/-/ig, '')
                                  },
                                  owner: item.attrs.uid,
                                  group: item.attrs.gid
                               }
                           });
                           resolve(ret);
                       });
                       break;
                  case 'mkdir':
                       sftp.mkdir(params.path, params.attrs, (err) => {
                           if(err) reject(err);
                           resolve();
                       });
                       break;
                  case 'rmdir':
                       sftp.rmdir(params.path, resolve);
                       break;
                  case 'rename':
                       sftp.rename(params.oldPath, params.newPath, (err) => {
                           if(err) reject(err);
                           resolve();
                       });
                       break;
                  case 'fastPut':
                       sftp.fastPut(params.localPath, params.remotePath, (err) => {
                           if(err) reject(err);
                           resolve();
                       });
                       break;
                  case 'fastGet':
                      sftp.fastGet(params.remotePath, params.localPath, (err) => {
                           if(err) reject(err);
                           resolve();
                       });
                       break;
                  case 'chmod':
                       sftp.chmod(params.path, params.mode, (err) => {
                           if(err) reject(err);
                           resolve();
                       });
                       break;
               }
           }else{
               reject(new Error('sftp connect error'));
           }
       })
    }
}    

module.exports = SftpClient;
