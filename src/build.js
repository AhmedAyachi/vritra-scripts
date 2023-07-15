#!/usr/bin/env node
"use strict";
const prepare=require("./prepare");
const webpack=require("webpack");
const getWebpackConfig=require("./getWebpackConfig");
const runtime=require("webpack/lib/logging/runtime");

module.exports=(args)=>prepare(args).then(()=>{
    let env;
    const envoption=args.find(arg=>arg.startsWith("--env="));
    if(envoption){
        const [key,value]=envoption.split("=");
        env=value||"prod";
    }
    else{env="prod"};
    const webpackConfig=getWebpackConfig({env});
    const compiler=webpack(webpackConfig);
    compiler.run(()=>{
        compiler.close(error=>{
            if(error){console.error(error)}
            else{
                runtime.getLogger("logger").error("azdazd");
            }
        });
    });
});

