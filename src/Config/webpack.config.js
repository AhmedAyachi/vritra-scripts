
const path=require("path");
const webpack=require("webpack");
const HTMLPlugin=require("html-webpack-plugin");
const CopyPlugin=require("copy-webpack-plugin");
const TerserPlugin=require("terser-webpack-plugin");
const CssMinimizerPlugin=require("css-minimizer-webpack-plugin");
const JsonMinimizerPlugin=require("json-minimizer-webpack-plugin");
const processDir=process.cwd();
const webviews=[
    {name:"MainView",file:"index.html"},
    ...require(`${processDir}/src/WebViews/WebViews`),
];

module.exports=(options)=>{
    const {env,config}=options;
    const {isDevEnv,isTestEnv,isProdEnv}=env;
    const appName=getAppName();
    return {
        mode:isProdEnv?"production":"development",
        entry:Object.fromEntries(webviews.map(webview=>[
            webview.name,
            path.resolve("./src/WebViews/",webview.name,"index.js"),
        ])),
        output:{
            filename:"[name].js",
            path:path.resolve(processDir,"www"),
            clean:!isDevEnv,
        },
        cache:false,
        devServer:{
            port:3000,
            open:true,
            compress:isProdEnv,
            static:{
                directory:path.join(processDir,"platforms/browser/","www"),
            },
            headers:{
                "Cache-Control":"no-store",
            },
            client:{
                reconnect:5,
                logging:"none",
                overlay:{
                    errors:true,
                    warnings:true,
                    runtimeErrors:true,
                },
            },
        },
        plugins:[
            new webpack.DefinePlugin({isDevEnv,isTestEnv,isProdEnv}),
            ...webviews.map(webview=>new HTMLPlugin({
                inject:"body",
                minify:isProdEnv,
                filename:webview.file,
                chunks:[webview.name],
                scriptLoading:"defer",
                ...config.html,
                templateContent:getTemplateContent({
                    title:appName,
                    withDefaultIconTag:!isProdEnv,
                    ...config.html,
                }),
            })),
            new CopyPlugin({
                patterns:[
                    {from:"src/Assets/Fonts",to:"Fonts"},
                ],
            }),
        ],
        module:{
            rules:[
                {
                    test: /\.css$/,
                    use:[
                        require.resolve("style-loader"),
                        {
                            loader:require.resolve("css-loader"),
                            options:{
                                modules:{
                                    mode:"local",
                                    auto:true,
                                    localIdentName:isProdEnv?"[hash]":"[local]_[hash]",
                                },
                            },
                        },
                    ],
                },
                {
                    test:/\.(jpe?g|png|gif|svg|mp4|webm|mp3|wav|ogg|avi|mov|flv|mkv|pdf|txt)$/i,
                    loader:require.resolve("file-loader"),
                    options:{
                        name:"Assets/[name]_[hash].[ext]",
                    },
                },
            ]
        },
        optimization:{
            minimize:true,
            minimizer:[
                new TerserPlugin({
                    parallel:true,
                    extractComments:false,
                    terserOptions:{
                        compress:{
                            defaults:true,
                            drop_console:isProdEnv,
                            drop_debugger:isProdEnv,
                        },
                        format:{
                            comments:!isProdEnv,
                        },
                    },
                }),
                isProdEnv&&new CssMinimizerPlugin(),
                isProdEnv&&new JsonMinimizerPlugin(),
            ].filter(Boolean),
        },
        watchOptions:{
            aggregateTimeout:200,
            poll:true,
            ignored:["node_modules/**"],
        },
        resolve:{
            alias:{
                "assets":path.resolve(processDir,"src/Assets/index.js"),
                "screens":path.resolve(processDir,"src/Screens/index.js"),
                "actions":path.resolve(processDir,"src/Store/Actions/index.js"),
                "resources":path.resolve(processDir,"src/Resources/index.js"),
                "components":path.resolve(processDir,"src/Components/index.js"),
                "localdb":isDevEnv&&path.resolve(processDir,"src/LocalDB/index.js"),
            },
        },
        infrastructureLogging:{
            level:"error",
            colors:true,
            console:{
                error:"red",
            },
        },
        stats:{all:false},
    };
}

const getTemplateContent=(options)=>{
    const {title,metadata,withDefaultIconTag,withCordovaScript=true}=options;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="format-detection" content="telephone=no"/>
    <meta name="msapplication-tap-highlight" content="no"/>
    <meta name="viewport" content="user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width,viewport-fit=cover"/>
    <title>${title||"Vritra App"}</title>
    ${withDefaultIconTag?`<link rel="icon" href="https://raw.githubusercontent.com/AhmedAyachi/RepoIllustrations/f7ee069a965d3558e0e7e2b7e6733d1a642c78c2/Vritra/Icon.svg"/>`:""}
    <link rel="stylesheet" type="text/css" href="./Fonts/index.css"/>
    ${metadata?.trim()||"<!-- html.metadata string of your vritra config goes here -->"}
</head>
<body>
    ${withCordovaScript?`<script type="text/javascript" src="cordova.js"></script>`:""}
</body>
</html>
`.trim();
}

const getAppName=()=>{
    const {name}=require(path.resolve(processDir,"package.json"));
    return name&&name.split(/ |_|-/g).map(word=>word[0].toUpperCase()+word.slice(1)).join(" ");
}
