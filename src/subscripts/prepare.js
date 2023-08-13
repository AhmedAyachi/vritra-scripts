#!/usr/bin/env node
"use strict";

const FileSystem=require("fs");
const processDir=process.cwd();
const browserPlatformEntry=`${processDir}/platforms/browser/www`;
const logger=require("./logger");


module.exports=(args,checkBrowserPlatform)=>new Promise((resolve,reject)=>{
    const hasBrowserPlatform=(!checkBrowserPlatform)||FileSystem.existsSync(browserPlatformEntry);
    if(hasBrowserPlatform){
        let envId;
        const envoption=args.find(arg=>arg.startsWith("--env="));
        if(envoption){
            const value=envoption.split("=")[1];
            envId=value||"dev";
        }
        else{envId="dev"};
        const webpackConfig=require("./webpack.config")({env:envId});
        Object.assign(webpackConfig,{
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
        setCustomConfig(webpackConfig);
        resolve({
            webpackConfig,
            env:{id:envId,name:getEnvName(envId)},
            ipaddress:checkBrowserPlatform&&getLocalIpAddress(),
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

const setCustomConfig=(defaultConfig)=>{
    let customConfig;
    const configPath=`${processDir}/webpack.config.js`;
    const exists=FileSystem.existsSync(configPath);
    if(exists){
        customConfig=require(configPath);
        if(customConfig){
            Object.assign(defaultConfig.devServer,customConfig.devServer);
            const {plugins}=customConfig;
            Array.isArray(plugins)&&defaultConfig.plugins.push(...plugins);
        }
        
    }
}

const getLocalIpAddress=()=>{
    const os=require("node:os");
    const networkInterfaces=os.networkInterfaces();
    const wifiNetwork=networkInterfaces["Wi-Fi"]||networkInterfaces["en0"];
    const localIP=wifiNetwork?.find(({family})=>family?.toLowerCase()==="ipv4")?.address;
    return localIP;
}

/*  const exists=FileSystem.existsSync(projectWebpackConfigPath);
    if(exists){
        log&&logger.log([
            `A webpack.config.js file ${logger.bold("already exists")}.`,
            `Using the webpack configuration defined in that file.`,
        ]);
        resolve(args);
    }
    else{
        FileSystem.copyFile(__dirname+"/subscripts/webpack.config.js",projectWebpackConfigPath,(error)=>{
            if(error){
                if(log){
                    const {code}=error;
                    logger.error(`${error.message}`+(code?`#${code}`:""));
                }
                reject(error);
            }
            else{
                logger.log([
                    log&&`A webpack.config.js file was ${logger.bold(logger.sucessColor("successfully"))} created with the default cherries configuration.`,
                    "Be careful while customizing the file, some configuration is required.",
                ].filter(Boolean));
                resolve(args);
            }
        });
    } */
