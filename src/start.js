#!/usr/bin/env node
"use strict";

const build=require("./build");
const webpack=require("webpack");
const WebpackDevServer=require("webpack-dev-server");
const prepare=require("./subscripts/prepare");
const logger=require("./subscripts/logger");


module.exports=(args)=>prepare([...args,"--env=dev"],true).then(({webpackConfig,env,ipaddress})=>{
    const devServer=new WebpackDevServer(webpackConfig.devServer,webpack(webpackConfig));
    devServer.startCallback(error=>{
        if(error){
            logger.error(error.message);
        }
        else{
            const port=logger.bold(devServer.options.port);
            build([`--env=${env.id}`]);
            logger.logServerInfo({ipaddress,port});
        }
    });
    ["SIGINT","SIGUSR1","SIGUSR2"].forEach(eventName=>{
        process.on(eventName,()=>{
            build([`--env=${env.id}`]);
        });
    });
});


