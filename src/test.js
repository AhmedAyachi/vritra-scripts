#!/usr/bin/env node
"use strict";

const build=require("./build");
const phonegap=require("phonegap");
const cordova=require("cordova-serve")();
const logger=require("./subscripts/logger");
const webpack=require("webpack");

module.exports=(args)=>build([...args,"--env=test"],false).
then(({webpackConfig,env,ipaddress})=>{
    logger.log(`Starting ${logger.bold("Phonegap")} server in testing mode ...`);
    let watching;
    const compiler=webpack(webpackConfig);
    compiler.watch(webpackConfig.watchOptions,(error)=>{
        if(error){logger.error(error.message)}
        else{
            const {devServer}=webpackConfig,{port}=devServer;
            phonegap.serve({port,livereload:false},()=>{
                if(!watching){
                    const {open}=devServer;
                    watching=true;
                    logger.logServerInfo({ipaddress,port,env});
                    open&&cordova.launchBrowser({url:`http://localhost:${port}`});
                }
            });
        }
    });
});
