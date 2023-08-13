#!/usr/bin/env node
"use strict";

const build=require("./build");
const os=require("node:os");
const webpack=require("webpack");
const WebpackDevServer=require("webpack-dev-server");
const prepare=require("./subscripts/prepare");
const logger=require("./subscripts/logger");


module.exports=(args)=>prepare([...args,"--env=dev"],true).then(({webpackConfig,env})=>{
    const devServer=new WebpackDevServer(webpackConfig.devServer,webpack(webpackConfig));
    devServer.startCallback(error=>{
        if(error){
            logger.error(error.message);
        }
        else{
            const port=logger.bold(devServer.options.port);
            const localIP=os.networkInterfaces()["Wi-Fi"]?.find(({family})=>family==="IPv4")?.address;
            build([`--env=${env.id}`]);
            logger.log(`You can now view your ${logger.mainColor("cherries-app")} in the browser.`);
            logger.log([
                `${logger.bold("Local:")}           http://${"localhost"}:${port}`,
                localIP&&`${logger.bold("On Your Network:")} http://${localIP}:${port}`,
            ].filter(Boolean),2);
            logger.log([
                "Note that the development build is not optimized.",
                `To create a production build, use ${logger.minorColor("npm run build")}.`
            ]);
        }
    });
    ["SIGINT","SIGUSR1","SIGUSR2"].forEach(eventName=>{
        process.on(eventName,()=>{
            build([`--env=${env.id}`]);
        });
    });
});


