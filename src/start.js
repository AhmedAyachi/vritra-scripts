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


module.exports=(args)=>build([...args,"--env=dev"],{log:false,clean:false}).
then(data=>{
    const {env}=data,envId=env.id;
    if(envId==="prod"){
        return Promise.reject(new Error("Can not execute the start command in production mode"));
    }
    else if(FileSystem.existsSync(browserPlatformEntry)){
        const {port}=data.webpackConfig.devServer;
        const noOpen=args.some(arg=>arg==="--no-open");
        if(noOpen) data.webpackConfig.devServer.open=false;
        const verbose=!args.some(arg=>arg==="--no-log");
        return isFreePort(port).then(()=>{
            const isDevEnv=(envId==="dev");
            if(verbose){
                logger.log(`Starting ${logger.bold(isDevEnv?"Webpack":"Phonegap")} server in ${env.name} mode ...`);
            }
            return (isDevEnv?startWebPackServer:startPhonegapServer)(data,verbose);
        }).
        catch(error=>{
            if(verbose){
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

const startWebPackServer=(data,verbose)=>new Promise((resolve,reject)=>{
    const {webpackConfig,env,ipaddress}=data;
    const devServer=new WebpackDevServer(webpackConfig.devServer,Webpack(webpackConfig));
    devServer.startCallback(error=>{
        if(error){reject(error)}
        else{
            if(verbose) logger.logServerInfo({
                ipaddress,env,
                port:logger.bold(devServer.options.port),
            });
            resolve();
        }
    });
});

const startPhonegapServer=(data,verbose)=>new Promise((resolve,reject)=>{
    const {webpackConfig,env,ipaddress}=data;
    webpackConfig.output.path=webpackConfig.devServer.static.directory;
    const compiler=Webpack(webpackConfig);
    compiler.watch(webpackConfig.watchOptions,(error)=>{
        if(error){reject(error)}
        else{
            const {devServer}=webpackConfig,{port}=devServer;
            process.cwd=()=>processDir+"/platforms/browser/";
            phonegap.serve({...phonegapOptions,port}).once("complete",()=>{
                if(verbose) logger.logServerInfo({ipaddress,port,env});
                if(devServer.open) cordova.launchBrowser({url:`http://localhost:${port}`});
            }).on("error",reject);
            process.cwd=()=>processDir;
            resolve();
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
