
const FileSystem=require("fs");
const processDir=process.cwd();
const projectWebpackConfigPath=processDir+"/webpack.config.js";


module.exports=(args)=>new Promise((resolve,reject)=>{
    const exists=FileSystem.existsSync(projectWebpackConfigPath);
    if(exists){resolve(args)}
    else{
        FileSystem.copyFile(__dirname+"/webpack.config.js",projectWebpackConfigPath,(error)=>{
            error?reject(error):resolve(args);
        });
    }
}).
catch(error=>{
    console.log(error.message);
    process.exit(1);
});

