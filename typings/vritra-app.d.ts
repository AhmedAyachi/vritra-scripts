

/**
 * A webpack definition defined by vritra-scripts.
 * 
 * true in dev mode, false otherwise.
 */
declare const isDevEnv:boolean;
/**
 * A webpack definition defined by vritra-scripts.
 * 
 * true in test mode, false otherwise.
 */
declare const isTestEnv:boolean;
/**
 * A webpack definition defined by vritra-scripts.
 * 
 * true in prod mode, false otherwise.
 */
declare const isProdEnv:boolean;

declare module "*.avif" {
    const src:string;
    export default src;
}

declare module "*.bmp" {
    const src:string;
    export default src;
}

declare module "*.gif" {
    const src:string;
    export default src;
}

declare module "*.jpg" {
    const src:string;
    export default src;
}

declare module "*.jpeg" {
    const src:string;
    export default src;
}

declare module "*.png" {
    const src:string;
    export default src;
}

declare module "*.webp" {
    const src:string;
    export default src;
}

declare module "*.svg" {
    const src:string;
    export default src;
}

declare module "*.json" {
    const src:any;
    export default src;
}

declare module "*.module.css" {
    const classes:{ readonly [key:string]:string };
    export default classes;
}

declare module "*.module.scss" {
    const classes:{ readonly [key:string]:string };
    export default classes;
}

declare module "*.module.sass" {
    const classes:{ readonly [key:string]:string };
    export default classes;
}
