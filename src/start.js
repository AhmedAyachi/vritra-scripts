#!/usr/bin/env node
"use strict";
const prepare=require("./prepare");
const build=require("./build");
const getWebpackConfig=require("./getWebpackConfig");
const webpack=require("webpack");
const WebpackDevServer=require("webpack-dev-server");


module.exports=(args)=>prepare(args).then(()=>{
    const webpackConfig=getWebpackConfig();
    const devServer=new WebpackDevServer(webpackConfig.devServer,webpack(webpackConfig));
    devServer.startCallback(error=>{
        if(error){
            console.log("could not start server",error);
        }
        else{
            build(["--env=dev"]);
            console.log(`%cListening at https://${"localhost"}:${3000}`,"color:red");    
        }
    });
});

["SIGINT","SIGUSR1","SIGUSR2"].forEach(eventName=>{
    process.on(eventName,()=>{
        build(["--env=dev"]);
    });
});
