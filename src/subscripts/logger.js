

const minindent=2;

module.exports={
    log:(text,indent=0)=>{
        if(Array.isArray(text)){
            const {length}=text;
            for(let i=0;i<length;i++){
                console.log(" ".repeat(minindent+indent)+text[i]);
            }
        }
        else{
            console.log(" ".repeat(minindent+indent)+text);
        }
        console.log();
    },
    error:function(text){
        this.log(`${this.bold(this.errorColor("Error:"))} ${this.errorColor(text)}`);
    },
    bold:(text)=>`\x1b[1m${text}\x1b[0m`,
    mainColor:(text)=>`\x1b[91m${text}\x1b[0m`,
    minorColor:(text)=>`\x1b[95m${text}\x1b[0m`,
    sucessColor:(text)=>`\x1b[32m${text}\x1b[0m`,
    errorColor:(text)=>`\x1b[31m${text}\x1b[0m`,
    logServerInfo:function({ipaddress,port}){
        this.log(`You can now view your ${this.mainColor("cherries-app")} in the browser.`);
        this.log([
            `${this.bold("Local:")}           http://${"localhost"}:${port}`,
            ipaddress&&`${this.bold("On Your Network:")} http://${ipaddress}:${port}`,
        ].filter(Boolean),2);
        this.log([
            "Note that the development build is not optimized.",
            `To create a production build, use ${this.minorColor("npm run build")}.`
        ]);
    },
}
