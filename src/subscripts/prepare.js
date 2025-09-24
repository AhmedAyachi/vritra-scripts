#!/usr/bin/env node
"use strict";

const Path=require("path");
const FileSystem=require("fs");
const webpack=require("webpack");
const CopyPlugin=require("copy-webpack-plugin");
const processDir=process.cwd();
const envIds=["dev","test","prod"];
const mergeObjects=require("./mergeObjects");
const cacheDirPath=`${processDir}/node_modules/.cache/vritra-scripts/`;

module.exports=(args)=>new Promise((resolve,reject)=>{
    const env=getEnv(args),isProdEnv=(env.id==="prod");
    const vritraConfig=getVritraConfig(env,args);
    const defaultConfig=require("../Config/webpack.config.js")({env,config:vritraConfig});
    const cypressConfig=getCypressConfig(env,vritraConfig);
    if(!FileSystem.existsSync(cacheDirPath)) FileSystem.mkdirSync(cacheDirPath,{recursive:true});
    resolve({
        webpackConfig:getWebPackConfig(defaultConfig,vritraConfig),
        ipaddress:(!isProdEnv)&&getLocalIpAddress(),
        cacheDirPath,env,cypressConfig,
    });
});

const getCypressConfig=(env,vritraConfig)=>{
    const {definitions}=vritraConfig,cypressEnv={...env};
    for(const key in definitions){
        const value=definitions[key];
        cypressEnv[key]=typeof(value)==="string"?value.replace(/^['"](.*)['"]$/,"$1"):value;
    }
    return {
        ...vritraConfig.cypress,
        env:cypressEnv,
    };
};

const getWebPackConfig=(defaultConfig,customConfig)=>{
    const config=defaultConfig;
    if(customConfig){
        const {plugins}=config;
        const {provide,definitions,ignore,copy}=customConfig;
        if(provide) plugins.unshift(new webpack.ProvidePlugin(provide));
        if(definitions) plugins.unshift(new webpack.DefinePlugin(definitions));
        if(Array.isArray(ignore)){
            const ignores=[];
            for(const value of ignore){
                let options;
                if(typeof(value)==="string"){
                    options={resourceRegExp:new RegExp(`^${value}$`)};
                }
                else{
                    options=value instanceof RegExp?{resourceRegExp:value}:value;
                }
                if(options) ignores.push(new webpack.IgnorePlugin(options));
            }
            plugins.unshift(...ignores);
        }
        if(copy?.patterns) handleCopy(copy,config);
        [
            "cypress","html","copy",
            "definitions","provide","ignore",
        ].forEach(key=>{
            delete customConfig[key];
        });
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
        customConfig=typeof(customConfigExport)==="function"?customConfigExport({env,webpack,args}):customConfigExport;
    }
    if(!customConfig) customConfig={};
    const customPort=args.find(arg=>arg.startsWith("--port="));
    if(customPort){
        const value=parseInt(customPort.split("=").pop());
        if(value){
            let {devServer}=customConfig;
            if(!devServer) devServer=customConfig.devServer={};
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
    const isDevEnv=envId.startsWith("dev");
    const isTestEnv=envId.startsWith("test");
    const isProdEnv=envId.startsWith("prod");
    return {
        id:envId,
        name:(()=>{
            if(isTestEnv) return "testing";
            else if(isDevEnv) return "development";
            else return "production";
        })(),
        isDevEnv,isTestEnv,isProdEnv,
    }
}

const getLocalIpAddress=()=>{
    const os=require("node:os");
    const networkInterfaces=os.networkInterfaces();
    const wifiNetwork=networkInterfaces["Wi-Fi"]||networkInterfaces["en0"];
    const localIP=wifiNetwork?.find(({family})=>family?.toLowerCase()==="ipv4")?.address;
    return localIP;
}

const handleCopy=(copy,config)=>{
    const {plugins}=config;
    copy.patterns.forEach(pattern=>{
        const {to}=pattern;
        if(Path.extname(to).match(/^(\.(js|cjs|mjs|ts|cts|mts))$/i)){
            const {transform}=pattern;
            if(typeof(transform)==="function"){
                pattern.transform=async (content,path)=>{
                    let result=transform(content,path);
                    if(result instanceof Promise) result=await result;
                    if(typeof(result)==="string") return injectValues(result,getDefinitions());
                    else if(typeof(result?.toString)==="function"){
                        return injectValues(result.toString(),getDefinitions());
                    }
                    else return result;
                };
            }
            else pattern.transform=(content)=>injectValues(content.toString(),getDefinitions());
        };
    });
    let allDefinitions;
    const getDefinitions=()=>{
        if(!allDefinitions){
            const definePlugins=plugins.filter(it=>it instanceof webpack.DefinePlugin);
            allDefinitions=Object.assign({},...definePlugins.map(it=>it.definitions));
        }
        return allDefinitions;
    }
    plugins.push(new CopyPlugin(copy));
}

const injectValues=(str,valueMap)=>{
    if(str&&valueMap){
        const keys=Object.keys(valueMap);
        if(keys.length){
            const regex=new RegExp(keys.map(key=>key.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|"),"g");
            str=str.replace(regex,(it)=>valueMap[it]);
        }
    }
    return str;
}
