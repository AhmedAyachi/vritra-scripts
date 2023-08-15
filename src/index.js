#!/usr/bin/env node
"use strict";

const logger=require("./subscripts/logger");

process.on("unhandledRejection",(error)=>{
    throw error;
});
try{
    const [cmdname,...args]=process.argv.slice(2);
    if(["start","test","build","extract"].includes(cmdname)){
        const command=require("./"+cmdname+".js");
        command(args);
    }
    else{
        logger.error("No such command");
        logger.log([
            "Available commands: start, test and build",
        ]);
    }
    
}
catch(error){
    logger.error("error: "+error.message);
    process.exit(0);
}
