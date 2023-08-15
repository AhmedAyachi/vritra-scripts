
const path=require("path");
const webpack=require("webpack");
const TerserPlugin=require("terser-webpack-plugin");
const HTMLPlugin=require("html-webpack-plugin");
const CopyPlugin=require("copy-webpack-plugin");
const processDir=process.cwd();
const webviews=[
    {name:"MainView",file:"index.html"},
    ...require(`${processDir}/src/WebViews/WebViews`),
];

module.exports=({id})=>{
    const isDevEnv=id.startsWith("dev");
    const isTestEnv=id.startsWith("test");
    const isProdEnv=id.startsWith("prod");
    return {
        mode:isProdEnv?"production":"development",
        entry:(()=>{
            const entry={};
            webviews.forEach(webview=>{
                entry[webview.name]=path.resolve("./src/WebViews/",webview.name,"index.js");
            });
            return entry;
        })(),
        output:{
            path:path.resolve(processDir,"www"),
            filename:"[name].js",
        },
        devServer:{
            compress:true,
            port:3000,
            open:true,
            static:{
                directory:path.join(processDir,"platforms/browser/","www"),
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
                templateContent,
                title:webview.name,
                inject:"body",
                minify:isProdEnv,
                filename:webview.file,
                chunks:[webview.name],
            })),
            new CopyPlugin({
                patterns:[{from:"src/Assets/Fonts",to:"Fonts"}],
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
                                    localIdentName:"[local]_[hash]",
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.(jpe?g|png|gif|svg|mp4)$/i,
                    loader:require.resolve("file-loader"),
                    options:{
                        name:"Assets/[name]_[hash].[ext]",
                    },
                },
            ]
        },
        optimization:{
            minimize:true,
            minimizer:[new TerserPlugin({
                parallel:true,
                extractComments:false,
                terserOptions:isProdEnv?{
                    compress:{drop_console:true},
                }:undefined,
            })],
        },
        watchOptions:{
            aggregateTimeout:0,
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
        stats:{
            all:false,
            logging:false,
            colors:true,
        },
    };
}

const templateContent=`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <meta name="format-detection" content="telephone=no"/>
    <meta name="msapplication-tap-highlight" content="no"/>
    <meta name="viewport" content="user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width,viewport-fit=cover"/>
    <title>Cherries App</title>
    <link rel="stylesheet" type="text/css" href="./Fonts/index.css"/>
</head>
<body>
    <script type="text/javascript" src="cordova.js"></script>
</body>
</html>
`.trim();
