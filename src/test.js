

const Path=require("path");
const FileSystem=require("fs");
const cypress=require("cypress");
const prepare=require("./Subscripts/prepare");
const start=require("./start");
const isFreePort=require("./Subscripts/isFreePort");
const mergeObjects=require("./Subscripts/mergeObjects");
const logger=require("./Subscripts/logger");
const processDir=process.cwd();
const cypressConfigFileName="cypress.config.js";
const cypressConfigDir=`${processDir}/platforms/browser/`;
const cypressConfigFile=Path.resolve(cypressConfigDir,cypressConfigFileName);


module.exports=async function test(args,port=50000){
    const freePort=await isFreePort(port).catch(()=>false);
    const supportFiles=[cypressConfigFile];
    if(freePort){
        args.push("-t");
        args.unshift(`--port=${port}`);
        return prepare([...args]).then(options=>{
            const exists=FileSystem.existsSync(`${processDir}/${cypressConfigFileName}`);
            if(exists){
                logger.log([
                    `A ${logger.minorColor(cypressConfigFileName)} file exists.`,
                    `Please remove it or use the cypress property of the ${logger.mainColor("vritra.config.js")} instead.`,
                ]);
                throw null;
            }
            else return start(["--no-open","--no-log",...args]).finally(()=>{
                const config=getCypressConfig(options);
                const supportFilePath=config.e2e.supportFile=createCypressSupportFile(config);
                supportFiles.push(supportFilePath);
                FileSystem.writeFileSync(cypressConfigFile,`module.exports=${getCypressConfigText(config)}`);
                const withGUI=args.some(arg=>arg==="--gui");
                process.on("SIGINT",()=>{
                    try { 
                        supportFiles.forEach(path=>{
                            FileSystem.rmSync(path);
                        });
                    } catch {};
                });
                (withGUI?cypress.open:cypress.run)({configFile:cypressConfigFile}).then(()=>{
                    const {env}=options;
                    if(env.id!=="prod"){
                        logger.log(`Note: Tests ran in a ${logger.minorColor(env.name)} environment.`);
                    }
                }).finally(()=>{
                    supportFiles.forEach(path=>{
                        FileSystem.rmSync(path);
                    });
                    process.exit(0);
                });
            });
        });
    }
    else return test(args,port+1);
};

const createCypressSupportFile=(config)=>{
    const supportFilePath=config.e2e.supportFile;
    const fileName=Path.basename(supportFilePath);
    const customContent=FileSystem.existsSync(supportFilePath)?FileSystem.readFileSync(supportFilePath).toString("utf8"):"";
    const defaultContent=FileSystem.readFileSync(Path.resolve(__dirname,"./Config/CypressSupportFile.js")).toString("utf8");
    const filePath=Path.resolve(cypressConfigDir,fileName);
    FileSystem.writeFileSync(filePath,customContent+"\n"+defaultContent);
    return filePath;
}

const getCypressConfigText=(config)=>{
    const {e2e}=config;
    return `{
        ...(${JSON.stringify({...config,e2e:undefined})}),
        e2e:{
            ...(${JSON.stringify(e2e)}),
            setupNodeEvents:(on,config)=>{
                const cache={};
                on("task",{
                    cache:(param)=>{
                        if(typeof(param)==="string") return cache[param]||null;
                        else if(Array.isArray(param)){
                            const [key,value]=param;
                            cache[key]=value;
                            return value;
                        }
                    },
                });
                return config;
            },
        },
    }`;
}

const getCypressConfig=({webpackConfig,cypressConfig})=>{
    const port=webpackConfig.devServer.port;
    return cypress.defineConfig(mergeObjects({
        env:cypressConfig.env,
        e2e:{
            baseUrl:`http://localhost:${port}/`,
            supportFile:`${processDir}/tst/Setup.js`,
            specPattern:`${processDir}/tst/**/*.test.js`,
            screenshotOnRunFailure:true,
            video:false,
            setupNodeEvents:(on,config)=>{
                const cache={};
                on("task",{
                    cache:(param)=>{
                        if(typeof(param)==="string") return cache[param]||null;
                        else if(Array.isArray(param)){
                            const [key,value]=param;
                            cache[key]=value;
                            return value;
                        }
                    },
                });
                return config;
            },
        },
    },cypressConfig));
}
