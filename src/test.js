

const build=require("./build");
const phonegap=require("phonegap");
const logger=require("./subscripts/logger");
const webpack=require("webpack");

module.exports=(args)=>build([...args,"--env=test"],false).
then(({webpackConfig,env,ipaddress})=>{
    logger.log(`Starting ${logger.bold("Phonegap")} server in testing mode ...`);
    let watching;
    const compiler=webpack(webpackConfig);
    compiler.watch(webpackConfig.watchOptions,(error)=>{
        if(error){logger.error(error.message)}
        else{
            const {port}=webpackConfig.devServer;
            if(!watching){
                watching=true;
                logger.logServerInfo({ipaddress,port,env});
            }
            phonegap.serve({port,livereload:false});
        }
    });
});
