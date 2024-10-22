#!/usr/bin/env node
"use strict";

const FileSystem=require("fs");
const net=require("net");
const Webpack=require("webpack");
const WebpackDevServer=require("webpack-dev-server");
const build=require("./build");
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
        return isFreePort(port).then(()=>{
            const isDevEnv=(envId==="dev");
            logger.log(`Starting ${logger.bold(isDevEnv?"Webpack":"Phonegap")} server in ${env.name} mode ...`);
            return (isDevEnv?startWebPackServer:startPhonegapServer)(data);
        }).
        catch(error=>{
            logger.error(error.message);
            if(error.portInUse){
                logger.log([
                    `use the ${logger.minorColor("--port option")} to specify a different port.\n`,
                    `--port=<PORT_NUMBER>`,
                ]);
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

const startWebPackServer=(data)=>new Promise((resolve,reject)=>{
    const {webpackConfig,env,ipaddress}=data;
    const devServer=new WebpackDevServer(webpackConfig.devServer,Webpack(webpackConfig));
    devServer.startCallback(error=>{
        if(error){reject(error)}
        else{
            logger.logServerInfo({
                ipaddress,env,
                port:logger.bold(devServer.options.port),
            });
            resolve();
        }
    });
});

const startPhonegapServer=(data)=>new Promise((resolve,reject)=>{
    const {webpackConfig,env,ipaddress}=data;
    webpackConfig.output.path=webpackConfig.devServer.static.directory;
    const compiler=Webpack(webpackConfig);
    compiler.watch(webpackConfig.watchOptions,(error)=>{
        if(error){reject(error)}
        else{
            const {devServer}=webpackConfig,{port}=devServer;
            process.cwd=()=>processDir+"/platforms/browser/";
            phonegap.serve({...phonegapOptions,port}).once("complete",()=>{
                logger.logServerInfo({ipaddress,port,env});
                devServer.open&&cordova.launchBrowser({url:`http://localhost:${port}`});
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

const isFreePort=(port)=>new Promise((resolve,reject)=>{
    const server=net.createServer();
    server.once("error",(error)=>{
        error.portInUse=error.code==="EADDRINUSE";
        if(error.portInUse){
            error.message=`port ${port} is in use.`;
        }
        reject(error);
    });
    server.once("listening",()=>{
        server.close(error=>{
          resolve(!error);
        });
    });
    server.listen(port);
});
