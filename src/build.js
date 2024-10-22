#!/usr/bin/env node
"use strict";

const Webpack=require("webpack");
const prepare=require("./Subscripts/prepare");
const logger=require("./Subscripts/logger");
const FileSystem=require("fs");


module.exports=(args,{log=true,clean=true}={})=>prepare([...args,"--env=prod"]).
then(options=>new Promise((resolve,reject)=>{
    const {webpackConfig,env}=options;
    const isProdEnv=env.id==="prod";
    if(clean&&isProdEnv){
        const wwwFolderPath=process.cwd()+"/www/";
        if(FileSystem.existsSync(wwwFolderPath)){
            FileSystem.rmSync(wwwFolderPath,{recursive:true});
        }
    }
    const compiler=Webpack(webpackConfig);
    compiler.run(()=>{
        compiler.close(error=>{
            if(error){reject(error)}
            else{
                if(log){
                    logger.log([
                        `A${isProdEnv?"n optimized":""} ${env.name} build was created.`,
                        `The ${logger.minorColor("www")} folder was ${logger.bold(logger.sucessColor("successfully"))} updated.`,
                    ]);
                    if(!isProdEnv){
                        logger.log(logger.getBuildNotice(env));
                    }
                }
                resolve(options);
            }
        });
    });
}));
