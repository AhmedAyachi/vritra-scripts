#!/usr/bin/env node
"use strict";

const logger=require("./Subscripts/logger");
const cmds=["start","build","watch","extract"];

new Promise((_,reject)=>{
    process.on("unhandledRejection",reject);
    const [cmdname,...args]=process.argv.slice(2);
    if(cmds.includes(cmdname)){
        const command=require("./"+cmdname+".js");
        return command(args);
    }
    else{
        logger.log(`Available commands: ${cmds.join(", ")}`);
        reject({message:"No such command"});
    }
}).
catch(error=>{
    error&&logger.error(error.message||"unknown error");
    process.exit(1);
});
