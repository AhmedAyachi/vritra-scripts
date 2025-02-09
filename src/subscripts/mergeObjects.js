

module.exports=function mergeObjects(item,value){
    if(item&&(typeof(item)==="object")){
        if(Array.isArray(item)){
            Array.isArray(value)&&item.push(...value);
        }
        else if(value&&(typeof(value)==="object")){
            for(const key in value){
                item[key]=mergeObjects(item[key],value[key]);
            }
        }
        return item;
    }
    else return value;
};
