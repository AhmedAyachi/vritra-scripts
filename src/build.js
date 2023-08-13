#!/usr/bin/env node
"use strict";

const prepare=require("./subscripts/prepare");
const webpack=require("webpack");
const logger=require("./subscripts/logger");

module.exports=(args,log=true)=>prepare([...args,"--env=prod"]).
then(options=>new Promise(resolve=>{
    const {webpackConfig,env}=options;
    const compiler=webpack(webpackConfig);
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
