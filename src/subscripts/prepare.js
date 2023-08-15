#!/usr/bin/env node
"use strict";

const FileSystem=require("fs");
const processDir=process.cwd();
const browserPlatformEntry=`${processDir}/platforms/browser/www`;
const logger=require("./logger");

module.exports=(args)=>new Promise((resolve,reject)=>{
    let envId;
    const envoption=args.find(arg=>arg.startsWith("--env="));
    if(envoption){
        const value=envoption.split("=")[1];
        envId=value||"dev";
    }
    else{envId="dev"};
    const env={id:envId,name:getEnvName(envId)};
    const isProdEnv=envId==="prod";
    if((!isProdEnv)||FileSystem.existsSync(browserPlatformEntry)){
        const defaultConfig=require("./webpack.config")({env});
        Object.assign(defaultConfig,{
            infrastructureLogging:{
                level:"error",
                colors:true,
                console:{
                    error:"red",
                },
            },
            stats:{
                all:false,
                logging:false,
                colors:true,
            },
        });
        resolve({
            webpackConfig:getCustomizedConfig(defaultConfig),
            ipaddress:(!isProdEnv)&&getLocalIpAddress(),env,
        });
    }
    else{
        logger.log([
            "Browser platform is required to run a development server.",
            `Try running: ${logger.minorColor("cordova platform add browser")}`,
        ]);
        reject();
    }
}).
catch(error=>{
    logger.error(error.message);
    process.exit(1);
});


const getEnvName=(envId)=>{
    if(envId.startsWith("test")) return "testing";
    else if(envId.startsWith("dev")) return "development";
    else return "production";
}

const getCustomizedConfig=(defaultConfig)=>{
    const configPath=`${processDir}/webpack.config.js`;
    const exists=FileSystem.existsSync(configPath);
    if(exists){
        const customConfig=require(configPath);
        if(customConfig){
            Object.assign(defaultConfig.devServer,customConfig.devServer);
            const {plugins,resolve}=customConfig;
            Array.isArray(plugins)&&defaultConfig.plugins.push(...plugins);
            if(resolve){
                const defaultResolve=defaultConfig.resolve,{alias}=resolve;
                if(alias){
                    defaultResolve.alias={...resolve.alias,...defaultResolve.alias};
                }
                defaultConfig.resolve={...resolve,...defaultResolve};
            }
            defaultConfig={...customConfig,...defaultConfig};
        }
    }
    return defaultConfig;
}

const getLocalIpAddress=()=>{
    const os=require("node:os");
    const networkInterfaces=os.networkInterfaces();
    const wifiNetwork=networkInterfaces["Wi-Fi"]||networkInterfaces["en0"];
    const localIP=wifiNetwork?.find(({family})=>family?.toLowerCase()==="ipv4")?.address;
    return localIP;
}
