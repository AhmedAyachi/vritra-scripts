
declare const cordova:Cordova;

interface Window {
    readonly cordova:Cordova,

    addEventListener(
        type:"cordovacallbackerror",
        listener:(event:Event)=>any,
        useCapture?:boolean
    ):void;
}

interface Cordova {
    /** Invokes native functionality by specifying corresponding service ,action and optional arguments.
     * @param callback A success callback function.
     * @param fallback An error callback function.
     * @param serviceName The service name to call on the native side (corresponds to a native class).
     * @param actionName The action name to call on the native side (generally corresponds to the native class method).
     * @param args An array of arguments to pass into the native environment.
    */
    exec(
        callback:()=>any,
        fallback:()=>any,
        serviceName:string,
        actionName:string,
        args?:string[]
    ):void;

    /** 
     * Defines custom logic as a Cordova module. 
     * Other modules can later access it using module name provided.
    */
    define(
        moduleName:string,
        factory:(require:any,exports:any,module:any)=>any
    ):void;

    /** Accesses a Cordova module by name */
    require(moduleName:string):any;

    /** The platform id */
    readonly platformId:"android"|"ios"|"browser";

    /** Cordova framework version */
    readonly version:string;

    /** Namespace for Cordova plugin functionality */
    readonly plugins:object;
}

interface Document {
    addEventListener(
        type:CordovaEventType,
        listener:(event:Event)=>any,
        useCapture?:boolean
    ):void;

    removeEventListener(
        type:CordovaEventType,
        listener:(event:Event)=>any,
        useCapture?:boolean
    ):void;
}

type CordovaEventType=(
    "deviceready"|"pause"|"resume"|
    "backbutton"|"menubutton"|"searchbutton"|
    "startcallbutton"|"endcallbutton"|
    "volumedownbutton"|"volumeupbutton"
)
