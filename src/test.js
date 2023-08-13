
//const prepare=require("./subscripts/prepare");
const build=require("./build");
const cordova=require("cordova-serve")();
const logger=require("./subscripts/logger");
const webpack=require("webpack");
/* const http=require("http");
new http.Server() */

module.exports=(args)=>build([...args,"--env=test"],true).
then(({webpackConfig,env})=>{
    let server;
    const {devServer}=webpackConfig;
    console.log(devServer.static.directory);
    const compiler=webpack({
        ...webpackConfig,
        output:{
            ...webpackConfig.output,
            path:devServer.static.directory,
        },
    });
    compiler.watch(webpackConfig.watchOptions,(error)=>{
        if(error){logger.error(error.message)}
        else{
            logger.log("www folder updated");
            new Promise((resolve,reject)=>{
                if(server){
                    server.close(error=>{
                        console.log("server closed");
                        error?reject(error):setTimeout(()=>{resolve()},5000);
                    });
                }
                else{resolve()}
            }).
            then(()=>cordova.servePlatform("browser",{
                //root:process.cwd()+"/www/index.html",
                port:devServer.port,
                noLogOutput:true,
                noServerInfo:true,
            }).
            then(()=>{
                console.log("server launched");
                const {port,root}=cordova;
                if(server===undefined){
                    cordova.launchBrowser({
                        url:`http://localhost:${port}`,
                    });
                }
                server=cordova.server;
            })).
            catch(error=>{
                logger.error(error.message);
            });
        }
    });
});
