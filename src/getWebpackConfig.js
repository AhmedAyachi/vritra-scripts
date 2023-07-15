"use strict";

module.exports=(config)=>{
    const processDir=process.cwd();
    const webpackConfig=require(processDir+"/webpack.config")({env:"dev",...config});
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
    return webpackConfig;
};
