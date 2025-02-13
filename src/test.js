

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


module.exports=async function test(args,{port=50000}={}){
    const freePort=await isFreePort(port).catch(()=>false);
    if(freePort){
        args.push("-t");
        args.unshift(`--port=${port}`)// force port value
        return prepare(args).then(options=>{
            const config=getCypressConfig(options),{folderPath}=config;
            if(FileSystem.existsSync(folderPath)){
                const exists=FileSystem.existsSync(`${processDir}/${cypressConfigFileName}`);
                if(exists){
                    logger.log([
                        `A ${logger.minorColor(cypressConfigFileName)} file exists.`,
                        `Please remove it or use the ${logger.sucessColor("cypress")} property of the ${logger.accentColor("vritra.config.js")} instead.`,
                    ]);
                    throw null;
                }
                else return start(["--no-open",...args],{log:false}).then(()=>{
                    const {cacheDirPath}=options;
                    const cypressConfigFile=Path.resolve(cacheDirPath,cypressConfigFileName);
                    config.e2e.supportFile=createCypressSupportFile(cacheDirPath,config);
                    FileSystem.writeFileSync(cypressConfigFile,`module.exports=${getCypressConfigText(config)}`);
                    
                    const withGUI=args.some(arg=>arg==="--gui");
                    return (()=>{
                        const cypressOptions={
                            headless:true,
                            configFile:cypressConfigFile,
                        }
                        if(withGUI) return cypress.open(cypressOptions);
                        else{
                            const fileArg=args.find(arg=>arg.startsWith("--file="));
                            if(fileArg){
                                cypressOptions.spec=fileArg.split("=")[1];
                            }
                            return cypress.run(cypressOptions);
                        }
                    })().then(()=>{
                        const {env}=options;
                        logger.log(`Note: Tests ran in a ${logger.minorColor(env.name)} environment.`);
                    }).finally(()=>{
                        process.exit(0);
                    });
                });
            }
            else throw new Error("no such test folder: "+folderPath);
        });
    }
    else return test(args,{port:port+1});
};

const createCypressSupportFile=(location,config)=>{
    let supportFilePath=config.e2e.supportFile;
    if(!supportFilePath||FileSystem.existsSync(supportFilePath)){
        if(supportFilePath) supportFilePath=Path.resolve(process.cwd(),supportFilePath);
        const defaultPath=`${config.folderPath}/Setup.js`;
        if(FileSystem.existsSync(defaultPath)) supportFilePath=defaultPath;
        const defaultContent=FileSystem.readFileSync(Path.resolve(__dirname,"./Config/CypressSupportFile.js")).toString("utf8");
        const filePath=Path.resolve(location,"CypressSupportFile.js");
        FileSystem.writeFileSync(filePath,(supportFilePath?`import "${supportFilePath}";`:"")+"\n"+defaultContent);
        return filePath;
    }
    else throw new Error(`No such support file: ${supportFilePath}`);
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
    const config=cypress.defineConfig(mergeObjects({
        env:cypressConfig.env,
        e2e:{
            baseUrl:`http://localhost:${port}/`,
            specPattern:`${processDir}/tst/**/*.test.js`,
            screenshotOnRunFailure:true,
            video:false,
        },
    },cypressConfig));
    const {e2e}=config;
    config.folderPath=Path.resolve(processDir,e2e.specPattern.replace(/\/\*+\/[^\/]+\.js$/,""));
    return config;
}
