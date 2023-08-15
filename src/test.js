#!/usr/bin/env node
"use strict";

const Webpack=require("webpack");
const build=require("./build");
const phonegap=require("connect-phonegap");
const cordova=require("cordova-serve")();
const logger=require("./subscripts/logger");
const processDir=process.cwd();


module.exports=(args)=>build([...args,"--env=test"],false).
then(({webpackConfig,env,ipaddress})=>new Promise((resolve,reject)=>{
    logger.log(`Starting ${logger.bold("Phonegap")} server in testing mode ...`);
    webpackConfig.output.path=webpackConfig.devServer.static.directory;
    const compiler=Webpack(webpackConfig);
    compiler.watch(webpackConfig.watchOptions,(error)=>{
        if(error){reject(error)}
        else{
            const {devServer}=webpackConfig,{port}=devServer;
            process.cwd=()=>processDir+"/platforms/browser/";
            phonegap.serve({...phonegapOptions,port}).
            once("complete",()=>{
                logger.logServerInfo({ipaddress,port,env});
                devServer.open&&cordova.launchBrowser({url:`http://localhost:${port}`});
            });
            process.cwd=()=>processDir;
        }
    });
}));

const phonegapOptions={
    browser:true,
    autoreload:true,
    proxy:true,
    livereload:false,
    connect:false,
    console:false,
    deploy:false,
    homepage:false,
    localtunnel:false,
    push:false,
    refresh:false,
}
