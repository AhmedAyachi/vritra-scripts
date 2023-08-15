#!/usr/bin/env node
"use strict";

const Webpack=require("webpack");
const prepare=require("./subscripts/prepare");
const logger=require("./subscripts/logger");

module.exports=(args,log=true)=>prepare([...args,"--env=prod"]).
then(options=>new Promise(resolve=>{
    const {webpackConfig,env}=options;
    const compiler=Webpack(webpackConfig);
    compiler.run(()=>{
        compiler.close(error=>{
            if(error){logger.error(error.message)}
            else{
                log&&logger.log([
                    `A ${env.name} build was created.`,
                    `The ${logger.minorColor("www")} folder was ${logger.bold(logger.sucessColor("successfully"))} updated.`,
                ]);
            }
            resolve(options);
        });
    });
}));
