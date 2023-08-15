

const FileSystem=require("fs");
const logger=require("./subscripts/logger");
const processDir=process.cwd();
const filename="webpack.config.js";

module.exports=()=>{
    const exists=FileSystem.existsSync(processDir+"/"+filename);
    if(exists){
        logger.error("Could not extract webpack.config.js file, such file already exists");
    }
    else{
        FileSystem.copyFile(__dirname+"/subscripts/"+filename,processDir+"/"+filename,()=>{
            logger.log(`A ${filename} file was ${logger.sucessColor("successfully")} extracted.`);
        });
    }
}
