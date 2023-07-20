const fs = require('fs');
const path = require('path');

const rootPath = path.dirname(process.argv[1]); //取得執行檔案的路徑
const directoryPath = `${rootPath}/sql_files`;

//compDBList: 要轉換的資料庫名稱
const compDBList = [ 'MLHG_OD_M', 'MLCG_OD_M', 'MHHG_OD_M' ]

//Regex
const fileRegex = /\.txt$/i;
const sqlRegex = /USE MLHG_OD_M/ig;

console.log('開始轉換...');
createFile(); //執行

//use promise
function getSqlFiles() {
  return new Promise((resolve, rejects) => {
    fs.readdir(directoryPath, (err, files) => {
      if(err) {
        return rejects(err);
      }
      //過濾出所有.txt結尾的檔案
      const sqlFiles = files.filter(file => fileRegex.test(file));
      return resolve(sqlFiles);
    })
  })
};

function processFiles(files, directoryPath) {
  //取得所有sql文件的路徑
  const filePathList = files.reduce((prevArr, file) => {
    const filePath = path.join(directoryPath, file);
    return [...prevArr, filePath];
  }, []);

  return Promise.all(filePathList.map(filePath => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if(err) {
          return reject(err);
        }
        //符合正則表達式規則則替換內容
        if (sqlRegex.test(data)) {
          //去除'USE MLHG_OD_M', 'GO', 換行符號
          data = data.replace(sqlRegex, '').replace(/go/ig, '').replace(/\n/g, '');
          const newFile = compDBList.map(item => {
            return `USE ${item}\nGO\n${data}\n\n`
          })
          return resolve(newFile.join(''));
        }else {
          return resolve(data);
        }
      })
    });
  }));
}

async function createFile() {
  //取得所有檔案檔名
  const files = await getSqlFiles();
  //處理檔案
  const fileList = await processFiles(files, directoryPath);
  //寫入檔案並覆蓋原檔案
   fileList.forEach((file, index) => {
       fs.writeFile(`${directoryPath}/${files[index]}`, file, (err) => {
        if(err) throw err;
       })
    })
  console.log('轉換結束');
}

