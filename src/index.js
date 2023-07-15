#!/usr/bin/env node
"use strict";


process.on("unhandledRejection",(error)=>{
    throw error;
});

try{
    const [cmdname,...args]=process.argv.slice(2);
    const command=require(__dirname+"/"+cmdname+".js");
    command(args);
}
catch(error){
    console.error("no such command");
    process.exit(0);
}
