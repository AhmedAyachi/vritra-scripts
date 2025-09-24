#!/usr/bin/env node
"use strict";

const FileSystem=require("fs");
const Webpack=require("webpack");
const WebpackDevServer=require("webpack-dev-server");
const build=require("./build");
const isFreePort=require("./Subscripts/isFreePort");
const phonegap=require("connect-phonegap");
const cordova=require("cordova-serve")();
const logger=require("./Subscripts/logger");
const processDir=process.cwd();
const browserPlatformEntry=`${processDir}/platforms/browser/www`;


module.exports=(args,{log=true}={})=>build([...args,"--env=dev"],{
    log:false,
}).then(data=>{
    const {env}=data;
    if(env.isProdEnv){
        return Promise.reject(new Error("Can not execute the start command in production mode"));
    }
    else if(FileSystem.existsSync(browserPlatformEntry)){
        const {webpackConfig}=data;
        webpackConfig.output.clean=false;
        const {port}=webpackConfig.devServer;
        const noOpen=args.some(arg=>arg==="--no-open");
        if(noOpen) webpackConfig.devServer.open=false;
        return isFreePort(port).then(()=>{
            const {isDevEnv}=env;
            if(log){
                logger.log(`Starting ${logger.bold(isDevEnv?"Webpack":"Phonegap")} server in ${env.name} mode ...`);
            }
            return (isDevEnv?startWebPackServer:startPhonegapServer)(data,log);
        }).catch(error=>{
            if(log){
                logger.error(error.message);
                if(error.portInUse){
                    logger.log([
                        `use the ${logger.minorColor("--port option")} to specify a different port.\n`,
                        `--port=<PORT_NUMBER>`,
                    ]);
                }
            }
        });
    }
    else{
        logger.log([
            `Browser platform is required to run a ${env.name} server.`,
            `Try running: ${logger.minorColor("cordova platform add browser")}`,
        ]);
        return Promise.reject();
    }
});

const startWebPackServer=(data,log)=>new Promise((resolve,reject)=>{
    const {webpackConfig,env,ipaddress}=data;
    const devServer=new WebpackDevServer(webpackConfig.devServer,Webpack(webpackConfig));
    devServer.startCallback(error=>{
        if(error) reject(error);
        else{
            if(log) logger.logServerInfo({
                ipaddress,env,
                port:logger.bold(devServer.options.port),
            });
            resolve(data);
        }
    });
});

const startPhonegapServer=(data,log)=>new Promise((resolve,reject)=>{
    const {webpackConfig,env,ipaddress}=data;
    webpackConfig.output.path=webpackConfig.devServer.static.directory;
    const compiler=Webpack(webpackConfig);
    compiler.watch(webpackConfig.watchOptions,(error)=>{
        if(error) reject(error);
        else{
            const {devServer}=webpackConfig,{port}=devServer;
            process.cwd=()=>processDir+"/platforms/browser/";
            phonegap.serve({...phonegapOptions,port}).once("complete",()=>{
                if(log) logger.logServerInfo({ipaddress,port,env});
                if(devServer.open) cordova.launchBrowser({url:`http://localhost:${port}`});
            }).on("error",reject);
            process.cwd=()=>processDir;
            resolve(data);
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
