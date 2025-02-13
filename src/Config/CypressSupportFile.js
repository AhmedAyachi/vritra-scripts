
Cypress.Commands.add("longPress",{prevSubject:"optional"},(subject,selector,options)=>{
    const {duration=550,force=true}=options||{};
    (()=>{
        if(selector) return cy.get(selector);
        else return cy.wrap(subject[0]);
    })().as("LongPressStart").
    trigger("mousedown",{force}).
    wait(duration).
    trigger("mouseup",{force}).
    as("LongPressEnd");
});

Cypress.Commands.add("waitForRemoval",{prevSubject:"optional"},(subject,...args)=>{
    let selector=args.find(arg=>typeof(arg)==="string");
    const options=args.find(arg=>typeof(arg)==="object")||{};
    if(!selector&&subject) selector=subject.selector;
    if(selector){
        const {retryCount,timeout=60000,delay=50,interval=200}=options;
        if(delay) cy.wait(delay);
        const start=timeout&&Date.now();
        cy.window().as("waitForRemoval").then({timeout},(window)=>{
            const checkExistance=(tryIndex=0)=>new Cypress.Promise(resolve=>{
                if(!timeout||((Date.now()-start)<=timeout)){
                    const exists=Boolean(window.document.querySelector(selector));
                    if(exists){
                        if(!retryCount||(tryIndex<retryCount)){
                            setTimeout(()=>{
                                resolve(checkExistance(tryIndex+1));
                            },interval);
                        }
                        else throw `Max retry count (${retryCount}) reached`;
                    }
                    else resolve();
                }
                else throw `Timeout (${timeout+" ms"}) reached`;
            });
            return checkExistance().catch(message=>{
                message=`${message} and the element ${selector} still in the DOM`;
                return Cypress.Promise.reject(new Error(message));
            }); 
        });
    }
});
