

declare const cy:Cypress.cy&Cypress.CyEventEmitter;

declare namespace Cypress {
    interface Chainable<Subject=any> {
        /**
         * Waits for an element to be removed from the DOM.
         * 
         * If the Timeout/retryCount (if set) is reached, an error is thrown.
         * 
         * If no selector is passed, the command uses the previous chain subject.
         * @param selector element query selector
         * @notice A custom command defined by vritra-scripts
         * @example //The examples below are equivalent
         * cy.waitForRemoval("#element-id",{timeout:5000});
         * cy.get("#element-id").waitForRemoval({timeout:5000});
         */
        waitForRemoval(selector?:string,options?:WaitForRemovalOptions):this;
        waitForRemoval(options?:WaitForRemovalOptions):this;

        /**
         * Gets the first element that matches the selector
         * @notice A custom command defined by vritra-scripts
         */
        getFirst(selector:string):this;

        /**
         * If no selector is passed, the command uses the previous chain subject.
         * @param selector 
         * @param options 
         * @notice A custom command defined by vritra-scripts
         */
        longPress(selector?:string,options?:LongPressOptions):this;
        longPress(options?:LongPressOptions):this;

        /**
         * Cache item getter.
         * A caching task that persists data across tests, sessions and specs.
         * @param event 
         * @notice A custom task defined by vritra-scripts
         */
        task<S=unknown>(event:"cache",key:string,options?:Partial<Loggable&Timeoutable>):Chainable<S>;
        /**
         * Cache item setter.
         * A caching task that persists data across tests, sessions and specs.
         * @param setter [key,value]
         */
        task<S=unknown>(event:"cache",setter:[string,any],options?:Partial<Loggable&Timeoutable>):Chainable<S>;
    }
    
    type WaitForRemovalOptions={
        /**
        * @default 50
        */
        delay?:number,
        /**
         * Set to null to disable
         * in ms.
         * @default 60000
         */
        timeout?:number,
        /**
         * @default 200
         */
        interval?:number,
        /**
         * @default null
         */
        retryCount?:number,
    }

    type LongPressOptions={
        /**
         * @default true
         */
        force:boolean,
        /**
         * @default 550
         */
        duration:number,
    }

    interface cy {}
    interface Loggable {}
    interface Timeoutable {}
    interface CyEventEmitter {}
}
