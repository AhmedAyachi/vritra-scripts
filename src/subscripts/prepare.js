#!/usr/bin/env node
"use strict";

const FileSystem=require("fs");
const processDir=process.cwd();
const browserPlatformEntry=`${processDir}/platforms/browser/www`;
const logger=require("./logger");
const webpack=require("webpack");

module.exports=(args)=>new Promise((resolve,reject)=>{
    const env=getEnv(args),isProdEnv=env.id==="prod";
    if((!isProdEnv)||FileSystem.existsSync(browserPlatformEntry)){
        const defaultConfig=require("./webpack.config.js")(env);
        const customConfig=getWebPackCustomConfig(env,args);
        resolve({
            webpackConfig:getWebPackConfig(defaultConfig,customConfig),
            ipaddress:(!isProdEnv)&&getLocalIpAddress(),env,
        });
    }
    else{
        logger.log([
            `Browser platform is required to run a ${env.name} server.`,
            `Try running: ${logger.minorColor("cordova platform add browser")}`,
        ]);
        reject();
    }
}).
catch(error=>{
    logger.error(error.message);
    process.exit(1);
});

const getWebPackConfig=(defaultConfig,customConfig)=>{
    if(customConfig){
        Object.assign(defaultConfig.devServer,customConfig.devServer);
        const {plugins,resolve,definitions}=customConfig;
        Array.isArray(plugins)&&defaultConfig.plugins.push(...plugins);
        if(resolve){
            const defaultResolve=defaultConfig.resolve,{alias}=resolve;
            if(alias){
                defaultResolve.alias={...resolve.alias,...defaultResolve.alias};
            }
            defaultConfig.resolve={...resolve,...defaultResolve};
        }
        if(definitions){
            delete customConfig.definitions;
            defaultConfig.plugins.unshift(new webpack.DefinePlugin(definitions));
        }
        defaultConfig={...customConfig,...defaultConfig};
    }
    return defaultConfig;
}

const getWebPackCustomConfig=(env,args)=>{
    let customConfig;
    const configPath=`${processDir}/cherries.config.js`;
    const exists=FileSystem.existsSync(configPath);
    if(exists){
        const customConfigExport=require(configPath);
        customConfig=typeof(customConfigExport)==="function"?customConfigExport({env,args}):customConfigExport;
    }
    return customConfig;
}

const envIds=["dev","test","prod"];
const getEnv=(args)=>{
    let envId;
    const envoption=args.find(arg=>arg.startsWith("--env="));
    if(envoption){
        const value=envoption.substring(envoption.indexOf("=")+1);
        envId=envIds.includes(value)?value:"dev";
    }
    else{
        envId="dev";
    };
    return {
        id:envId,
        name:(()=>{
            if(envId.startsWith("test")) return "testing";
            else if(envId.startsWith("dev")) return "development";
            else return "production";
        })(),
    }
}

const getLocalIpAddress=()=>{
    const os=require("node:os");
    const networkInterfaces=os.networkInterfaces();
    const wifiNetwork=networkInterfaces["Wi-Fi"]||networkInterfaces["en0"];
    const localIP=wifiNetwork?.find(({family})=>family?.toLowerCase()==="ipv4")?.address;
    return localIP;
}
