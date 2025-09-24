#!/usr/bin/env node
"use strict";

const Webpack=require("webpack");
const prepare=require("./Subscripts/prepare");
const logger=require("./Subscripts/logger");


module.exports=(args,cmdops)=>prepare([...args,"--env=prod"]).
then(options=>new Promise((resolve,reject)=>{
    const {webpackConfig,env}=options,{isProdEnv}=env;
    const {log=true}=cmdops||{};
    
    const compiler=Webpack(webpackConfig);
    compiler.run((error)=>{
        if(error) reject(error);
        else compiler.close(error=>{
            if(error) reject(error);
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
