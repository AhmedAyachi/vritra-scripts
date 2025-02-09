

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
         * @example The example below are equivalent
         * cy.waitForRemoval("#element-id",{timeout:5000});
         * cy.get("#element-id").waitForRemoval({timeout:5000});
         */
        waitForRemoval(selector?:string,options?:WaitForRemovalOptions):this;
        waitForRemoval(options?:WaitForRemovalOptions):this;

        /**
         * A caching task that persists data across tests/specs.
         * @param event 
         * @notice A custom task defined by vritra-scripts
         */
        task<S=unknown>(event:"cache",key:string,options?:Partial<Loggable&Timeoutable>):Chainable<S>;
        /**
         * 
         * @param setter [key,value]
         */
        task<S=unknown>(event:"cache",setter:[string,any],options?:Partial<Loggable&Timeoutable>):Chainable<S>;
    }
    
    type WaitForRemovalOptions={
        /**
             * @default 30
             */
        delay?:number,
        timeout?:number,
        /**
         * @default 200
         */
        interval?:number,
        /**
         * @default until the timeout elapses
         */
        retryCount?:number,
    }

    interface cy {}
    interface Loggable {}
    interface Timeoutable {}
    interface CyEventEmitter {}
}
