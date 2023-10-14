#!/usr/bin/env node
"use strict";

const FileSystem=require("fs");
const webpack=require("webpack");
const processDir=process.cwd();
const envIds=["dev","test","prod"];

module.exports=(args)=>new Promise((resolve,reject)=>{
    const env=getEnv(args),isProdEnv=(env.id==="prod");
    const defaultConfig=require("./webpack.config.js")(env);
    const customConfig=getWebPackCustomConfig(env,args);
    resolve({
        webpackConfig:getWebPackConfig(defaultConfig,customConfig),
        ipaddress:(!isProdEnv)&&getLocalIpAddress(),env,
    });
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
    const configPath=`${processDir}/wurm.config.js`;
    const exists=FileSystem.existsSync(configPath);
    if(exists){
        const customConfigExport=require(configPath);
        customConfig=typeof(customConfigExport)==="function"?customConfigExport({env,args}):customConfigExport;
    }
    return customConfig;
}

const getEnv=(args)=>{
    let envId;
    const envoption=args.find(arg=>arg.startsWith("--env=")||arg.match(/^-(d|t|p)$/g));    
    if(envoption){
        if(envoption.length===2){
            const char=envoption[1];
            envId=envIds.find(id=>id.startsWith(char));
        }
        else{
            const value=envoption.substring(envoption.indexOf("=")+1);
            envId=envIds.includes(value)?value:"dev";
        }
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
