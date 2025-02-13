#!/usr/bin/env node
"use strict";

const FileSystem=require("fs");
const webpack=require("webpack");
const processDir=process.cwd();
const envIds=["dev","test","prod"];
const mergeObjects=require("./mergeObjects");
const cacheDirPath=`${processDir}/node_modules/.cache/vritra-scripts/`;

module.exports=(args)=>new Promise((resolve,reject)=>{
    const env=getEnv(args),isProdEnv=(env.id==="prod");
    const defaultConfig=require("../Config/webpack.config.js")(env);
    const vritraConfig=getVritraConfig(env,args);
    const cypressConfig=getCypressConfig(env,vritraConfig);
    delete vritraConfig.cypress;
    if(!FileSystem.existsSync(cacheDirPath)) FileSystem.mkdirSync(cacheDirPath,{recursive:true});
    resolve({
        webpackConfig:getWebPackConfig(defaultConfig,vritraConfig),
        ipaddress:(!isProdEnv)&&getLocalIpAddress(),
        cacheDirPath,env,cypressConfig,
    });
});

const getCypressConfig=({id:envId},vritraConfig)=>{
    const {definitions}=vritraConfig,env={};
    for(const key in definitions){
        const value=definitions[key];
        env[key]=typeof(value)==="string"?value.replace(/^['"](.*)['"]$/,"$1"):value;
    }
    return {
        ...vritraConfig.cypress,
        env:{
            ...env,
            isDevEnv:envId==="dev",
            isTestEnv:envId==="test",
            isProdEnv:envId==="prod",
        }
    };
};

const getWebPackConfig=(defaultConfig,customConfig)=>{
    let config=defaultConfig;
    if(customConfig){
        const {definitions,ignore}=customConfig;
        if(definitions){
            delete customConfig.definitions;
            config.plugins.unshift(new webpack.DefinePlugin(definitions));
        }
        if(Array.isArray(ignore)){
            delete customConfig.ignore;
            const ignores=[];
            for(const value of ignore){
                let config;
                if(typeof(value)==="string"){
                    config={resourceRegExp:new RegExp(`^${value}$`)};
                }
                else{
                    config=value instanceof RegExp?{resourceRegExp:value}:value;
                }
                config&&ignores.push(new webpack.IgnorePlugin(config));
            }
            config.plugins.unshift(...ignores);
        }
        mergeObjects(config,customConfig);
    }
    return config;
}

const getVritraConfig=(env,args)=>{
    let customConfig;
    const configPath=`${processDir}/vritra.config.js`;
    const exists=FileSystem.existsSync(configPath);
    if(exists){
        const customConfigExport=require(configPath);
        customConfig=typeof(customConfigExport)==="function"?customConfigExport({env,args}):customConfigExport;
    }
    if(!customConfig){customConfig={}};
    const customPort=args.find(arg=>arg.startsWith("--port="));
    if(customPort){
        const value=parseInt(customPort.split("=").pop());
        if(value){
            let {devServer}=customConfig;
            if(!devServer){devServer=customConfig.devServer={}};
            devServer.port=value;
        }
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
