#!/usr/bin/env node
"use strict";

process.on("unhandledRejection",(error)=>{
    throw error;
});

const cmdenv={
    start:"dev",
    test:"test",
    build:"prod",
}

const args=process.argv.slice(2);
const env=cmdenv[args[0]];
if(env){
    const webpack=require("webpack");
    const webpackConfig=require("./webpack.config")({env});
    const WebpackDevServer=require("webpack-dev-server");

    Object.assign(webpackConfig,{
        infrastructureLogging:{
            level:"info",
            colors:true,
        },
        stats:"none",
    });

    try{
        const devServer=new WebpackDevServer({
            ...webpackConfig.devServer,
            host:"localhost",
            port:3000,
        },webpack(webpackConfig));
        devServer.startCallback(error=>{
            if(error){
                console.log("error",error);
            }
            else{
                webpack(webpackConfig).watch(webpackConfig.watchOptions,(error,stats)=>{
                    console.log(`%cListening at https://${"localhost"}:${3000}`,"color:red");             
                });
            }
        });
    }
    catch(error){
        console.log(error.message);
        process.exit(1);
    }
}
else{
    process.exit(0);
}
