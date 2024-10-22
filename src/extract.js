

const FileSystem=require("fs");
const logger=require("./Subscripts/logger");
const processDir=process.cwd();
const filename="webpack.config.js";

module.exports=(args)=>new Promise((resolve,reject)=>{
    const exists=FileSystem.existsSync(processDir+"/"+filename);
    if(exists){
        reject({message:"Could not extract the webpack.config.js file, such file already exists"});
    }
    else{
        FileSystem.copyFile(__dirname+"/Subscripts/"+filename,processDir+"/"+filename,()=>{
            logger.log(`A ${filename} file was ${logger.bold(logger.sucessColor("successfully"))} extracted.`);
            resolve();
        });
    }
});
