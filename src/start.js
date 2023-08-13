#!/usr/bin/env node
"use strict";

const build=require("./build");
const webpack=require("webpack");
const WebpackDevServer=require("webpack-dev-server");
const logger=require("./subscripts/logger");

module.exports=(args)=>build([...args,"--env=dev"],false).
then(({webpackConfig,env,ipaddress})=>{
    logger.log(`Starting ${logger.bold("Webpack")} server in development mode ...`);
    const devServer=new WebpackDevServer(webpackConfig.devServer,webpack(webpackConfig));
    devServer.startCallback(error=>{
        if(error){
            logger.error(error.message);
        }
        else{
            const port=logger.bold(devServer.options.port);
            logger.logServerInfo({ipaddress,port,env});
        }
    });
    /* ["SIGINT","SIGUSR1","SIGUSR2"].forEach(eventName=>{
        process.on(eventName,()=>{
            build([`--env=${env.id}`]);
        });
    }); */
});
