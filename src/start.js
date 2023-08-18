#!/usr/bin/env node
"use strict";

const Webpack=require("webpack");
const WebpackDevServer=require("webpack-dev-server");
const build=require("./build");
const phonegap=require("connect-phonegap");
const cordova=require("cordova-serve")();
const logger=require("./subscripts/logger");
const processDir=process.cwd();

module.exports=(args)=>build([...args,"--env=dev"],false).
then(data=>{
    const isTestEnv=data.env.id==="test";
    return (isTestEnv?startPhonegapServer:startWebPackServer)(data);
});

const startWebPackServer=(data)=>new Promise((resolve,reject)=>{
    const {webpackConfig,env,ipaddress}=data;
    logger.log(`Starting ${logger.bold("Webpack")} server in development mode ...`);
    const devServer=new WebpackDevServer(webpackConfig.devServer,Webpack(webpackConfig));
    devServer.startCallback(error=>{
        if(error){reject(error)}
        else{
            const port=logger.bold(devServer.options.port);
            logger.logServerInfo({ipaddress,port,env});
            resolve();
        }
    })
});

const startPhonegapServer=(data)=>new Promise((resolve,reject)=>{
    const {webpackConfig,env,ipaddress}=data;
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
}),phonegapOptions={
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
};
