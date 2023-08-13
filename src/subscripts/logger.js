

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
}
