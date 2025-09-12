

const FileSystem=require("fs");
const logger=require("./Subscripts/logger");
const processDir=process.cwd();
const filenames=["webpack.config.js","CypressSupportFile.js"];

module.exports=(args)=>Promise.all(filenames.map(filename=>new Promise((resolve,reject)=>{
    const exists=FileSystem.existsSync(processDir+"/"+filename);
    if(exists){
        reject({message:`Could not extract the ${filename} file, such file already exists`});
    }
    else FileSystem.copyFile(__dirname+"/Config/"+filename,processDir+"/"+filename,()=>{
        logger.log(`A ${filename} file was ${logger.bold(logger.sucessColor("successfully"))} extracted.`);
        resolve();
    });
})));
