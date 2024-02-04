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
    let config=defaultConfig;
    if(customConfig){
        const {devServer,plugins,resolve,definitions,ignore}=customConfig;
        devServer&&Object.assign(config.devServer,devServer);
        if(resolve){
            const defaultResolve=config.resolve,{alias}=resolve;
            if(alias){
                defaultResolve.alias={...resolve.alias,...defaultResolve.alias};
            }
            config.resolve={...resolve,...defaultResolve};
        }
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
        Array.isArray(plugins)&&config.plugins.push(...plugins);

        config={...customConfig,...config};
    }
    return config;
}

const getWebPackCustomConfig=(env,args)=>{
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
