#!/usr/bin/env node
"use strict";


process.on("unhandledRejection",(error)=>{
    throw error;
});

try{
    const [cmdname,...args]=process.argv.slice(2);
    const command=require(__dirname+"/"+cmdname+".js");
    if(typeof(command)==="function"){
        command(args);
    }
    else{
        throw new Error("no such command");
    }
    
}
catch(error){
    console.error(error.message);
    process.exit(0);
}
