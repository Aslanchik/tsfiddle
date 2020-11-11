
   // Component BASE class
    export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
        templateEl: HTMLTemplateElement;
        hostEl: T;
        element: U;
    
        constructor(templateId:string, hostElementId: string, insertAtStart:boolean, newElementId?: string ){
            // Determine property values by grabbing them from the DOM and typecasting to respective types, adding ! so that TS knows that these are not null
            this.templateEl = document.getElementById(templateId)! as HTMLTemplateElement; 
            this.hostEl = document.getElementById(hostElementId)! as T;
            // Import html content from template element
            const importedHtmlContent = document.importNode(this.templateEl.content, true);
            // Get form element from imported html content
            this.element = importedHtmlContent.firstElementChild as U;
            // If we have a new element Id to assign, we attach it to the new element
            if(newElementId){
                this.element.id = newElementId;
            }
            this.attach(insertAtStart);
        }
    
            // A method which takes an html element and adds it into another element
        private attach(insertAtBeginning: boolean){
            this.hostEl.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
        }
        // Define abstract classes that need to be defined when instantiating a class Based on this class
        abstract configure():void;
        abstract renderContent():void;
    }
    
