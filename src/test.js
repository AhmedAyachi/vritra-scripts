
//const prepare=require("./subscripts/prepare");
const build=require("./build");
const phonegap=require("phonegap");
const logger=require("./subscripts/logger");
const webpack=require("webpack");
/* const http=require("http");
new http.Server() */

module.exports=(args)=>build([...args,"--env=test"],true).
then(({webpackConfig,env,ipaddress})=>{
    let watching;
    const compiler=webpack(webpackConfig);
    compiler.watch(webpackConfig.watchOptions,(error)=>{
        if(error){logger.error(error.message)}
        else{
            const {port}=webpackConfig.devServer;
            if(!watching){
                watching=true;
                logger.logServerInfo({ipaddress,port});
            }
            phonegap.serve({port,livereload:false});
        }
    });
});
