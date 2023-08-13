
const hasBrowserPlatform=require("./subscripts/hasBrowserPlatform");
const PhoneGap=require("phonegap/lib/phonegap");
const proxy=require("phonegap/lib/phonegap/util/connect-proxy");

module.exports=function test(args){return new Promise((resolve,reject)=>{
    if(hasBrowserPlatform()){
        const phonegap=new PhoneGap();
        const options={
            port:3000,
            autoreload:true,
            connect:false,
        };
        phonegap.serve(options,(error,data)=>{
            console.log("server started");
            if(error){reject(error)}
            else{
                let i=0;
                const {server}=data;
                server.on("listening",function onRequest(request,result){
                    console.log("connection listener called")
                    /* result.once("finish",()=>{
                        i++;
                        console.log(i+": update listener called");
                    }); */
                });
            }
        });
    }
})}
