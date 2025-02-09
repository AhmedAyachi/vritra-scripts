

Cypress.Commands.add("waitForRemoval",{prevSubject:"optional"},(subject,...args)=>{
    let selector=args.find(arg=>typeof(arg)==="string");
    const options=args.find(arg=>typeof(arg)==="object")||{};
    if(!selector&&subject) selector=subject.selector;
    if(selector){
        const {timeout,delay=30,interval=200}=options;
        const retryCount=options.retryCount||(timeout&&10);
        if(delay) cy.wait(delay);
        const start=timeout&&Date.now();
        cy.window().then(window=>{
            !function perform(tryIndex=0){
                cy.wrap(new Promise(resolve=>{
                    const elapsed=timeout&&(Date.now()-start);
                    if(!timeout||(elapsed<=timeout)){
                        resolve(Boolean(window.document.querySelector(selector)));
                    }
                })).then(exists=>{
                    if(exists){
                        if(!retryCount||(tryIndex<retryCount)){
                            if(interval) cy.wait(interval);
                            perform(tryIndex+1);
                        }
                        else throw new Error(`element ${selector} still in the DOM`);
                    }
                }); 
            }(); 
        });
    }
});
