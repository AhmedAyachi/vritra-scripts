#!/usr/bin/env node
"use strict";

const Webpack=require("webpack");
const prepare=require("./subscripts/prepare");
const logger=require("./subscripts/logger");

module.exports=(args)=>prepare([...args,"--env=dev"]).
then(options=>new Promise((resolve,reject)=>{
    const {webpackConfig,env}=options;
    const compiler=Webpack(webpackConfig);
    logger.log(`Starting watch in ${env.name} mode ...`);
    let index=0;
    compiler.watch(webpackConfig.watchOptions,(error)=>{
        if(error){reject(error)}
        else{
            if(index){
                const now=new Date(Date.now());
                const hours=now.getHours(),minutes=now.getMinutes(),seconds=now.getSeconds();
                const time=[hours,minutes,seconds].map(number=>number>9?number:("0"+number)).join(":");
                logger.log(`${index}. www folder ${logger.bold(logger.sucessColor("successfully"))} updated at ${logger.accentColor(time)}.`);
            } 
            else{
                logger.log([
                    `${logger.mainColor("Wurm")} is now watching your ${logger.minorColor("src")} folder for changes.`,
                    `The ${logger.minorColor("www")} folder content will get updated accordingly.`
                ]);
                resolve(options);
            }
            index++;
        }
    });
}));
