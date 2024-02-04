#!/usr/bin/env node
"use strict";

const Webpack=require("webpack");
const prepare=require("./Subscripts/prepare");
const logger=require("./Subscripts/logger");

module.exports=(args,log=true)=>prepare([...args,"--env=prod"]).
then(options=>new Promise((resolve,reject)=>{
    const {webpackConfig,env}=options;
    const compiler=Webpack(webpackConfig);
    compiler.run(()=>{
        compiler.close(error=>{
            if(error){reject(error)}
            else{
                if(log){
                    const isNotProdEnv=env.id!=="prod";
                    logger.log([
                        `A${isNotProdEnv?"":"n optimized"} ${env.name} build was created.`,
                        `The ${logger.minorColor("www")} folder was ${logger.bold(logger.sucessColor("successfully"))} updated.`,
                    ]);
                    isNotProdEnv&&logger.log(logger.getBuildNotice(env));
                }
                resolve(options);
            }
        });
    });
}));
