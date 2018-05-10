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
                            if(err){
                                switch(err.code){
                                    // no such file
                                    case 2:
                                        let tokens = params.path.split(/\//).filter((path) => path.trim());
                                        let path = '/';
                                        let mkdir = () => {
                                            if(!tokens.length){
                                                return resolve();
                                            }
                                            path += tokens.shift() + '/';
                                            sftp.exists(path, (isExists) => {
                                                if(isExists){
                                                    mkdir();
                                                }else{
                                                    sftp.mkdir(path, (err) => {
                                                        if(err){
                                                            if(err.code === 4){
                                                                reject(new Error("cannot create directory: File exists"));
                                                            }else{
                                                               reject(err);
                                                            }
                                                        }else{
                                                            mkdir();
                                                        }
                                                    })
                                                }
                                            });
                                        }
                                        mkdir();
                                        break;
                                    case 4:
                                        reject(new Error("cannot create directory: File exists"));
                                        break;
                                    default: reject(err);
                                        break;
                                }
                            }else{
                                resolve();
                            }
                        });
                       break;
                  case 'rmdir':
                            sftp.rmdir(params.path, (err) => {
                                if(err){
                                    switch(err.code){
                                        case 2:
                                            reject(new Error("No such file or directory"));
                                            break;
                                        case 4:
                                            let path = [params.path];
                                            let rmdir = () => {
                                                let _path = path.pop();
                                                if(!_path) return resolve();
                                                sftp.readdir(_path, (err, list) => {
                                                    if(err) return reject(err);
                                                    if(!list.length) {
                                                        return sftp.rmdir(_path, (err) => err ? reject(err) : rmdir());
                                                    }
                                                    // staging dir not deleted before the subdirectory or file is processed
                                                    path.push(_path);
                                                    let files = [];
                
                                                    list.map((item) => ({
                                                        path: _path.endsWith('/') ? _path + item.filename 
                                                                                    : _path + "/" + item.filename,
                                                        type: item.longname.substr(0,1)
                                                    })).map((item) => {
                                                        if(item.type === 'd'){
                                                            path.push(item.path);
                                                        }else{
                                                            files.push(item.path);
                                                        }
                                                    });
                                                    if(!files.length) return rmdir();
                                                    let promise = files.map((file) => this.sftp('unlink', {path: file}));
                                                    Promise.all(promise).then(rmdir).catch(reject);
                                                });
                                            };
                                            rmdir();
                                            break;
                                        default:
                                            reject(err);
                                            break;
                                    }
                                    
                                }else{
                                    resolve();
                                }
                            });
                            
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
