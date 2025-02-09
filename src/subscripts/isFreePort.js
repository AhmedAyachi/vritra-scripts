#!/usr/bin/env node
"use strict";

const net=require("net");


module.exports=(port)=>new Promise((resolve,reject)=>{
    const server=net.createServer();
    server.once("error",(error)=>{
        error.portInUse=error.code==="EADDRINUSE";
        if(error.portInUse){
            error.message=`port ${port} is in use.`;
        }
        reject(error);
    });
    server.once("listening",()=>{
        server.close(error=>{
          resolve(!error);
        });
    });
    server.listen(port);
});
