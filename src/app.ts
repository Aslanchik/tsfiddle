// A Decorator that automatically binds 'this' to the method when it is called
function autoBind(_: any, _2:string, descriptor:PropertyDescriptor){
    // Get the original method inside the class
    const originalMethod = descriptor.value;
    // Adjut the method so when it is called the getter is invoked and binds 'this' to the method
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        // This is invoked when we are calling the method
        get(){
            // Bind 'this' to the original method
            const boundFunction = originalMethod.bind(this);
            // Return the method with the new bound 'this'
            return boundFunction;
        }
    };
    // Return the adjusted Descriptor
    return adjDescriptor;
}

class ProjectInput {
    // Initialize class properties
    templateEl: HTMLTemplateElement;
    hostEl: HTMLDivElement;
    formEl: HTMLFormElement;
    titleInputEl: HTMLInputElement;
    descriptionInputEl: HTMLInputElement;
    peopleInputEl: HTMLInputElement;
    
    constructor(){
        // Determine property values by grabbing them from the DOM and typecasting to respective types, adding ! so that TS knows that these are not null
        this.templateEl = document.getElementById('project-input')! as HTMLTemplateElement; 
        this.hostEl = document.getElementById('app')! as HTMLDivElement;
        // Import html content from template element
        const importedHtmlContent = document.importNode(this.templateEl.content, true);
        // Get form element from imported html content
        this.formEl = importedHtmlContent.firstElementChild as HTMLFormElement;
        // Interact with element and add an ID
        this.formEl.id = 'user-input';
        // Get form input elements from DOM and typecast
        this.titleInputEl = this.formEl.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputEl = this.formEl.querySelector('#description')! as HTMLInputElement;
        this.peopleInputEl = this.formEl.querySelector('#people')! as HTMLInputElement;
        // Use private method that attaches an eventListener to formElement 
        this.configure();
        // Use private method to insert the form element into the hostElement
        this.attach();
    }

    // A method that gets userInput from fields with a tuple or void return
    private gatherUserInput(): [string, string, number] | void{
        // Get value from input fields
        const titleVal = this.titleInputEl.value;
        const descriptionVal = this.descriptionInputEl.value;
        const peopleVal = this.peopleInputEl.value;

        if(titleVal.trim().length === 0 || descriptionVal.trim().length === 0 || peopleVal.trim().length === 0 ){
            alert('Invalid input, try again!')
            return;
        } else return [titleVal, descriptionVal, +peopleVal]
    }

    //  A method that clears input fields
    private clearInput(): void {
        this.titleInputEl.value = '';
        this.descriptionInputEl.value = '';
        this.peopleInputEl.value = '';
    }
    // A method that handles form submission with the auto bind decorator infront of it
    @autoBind
    private submitHandler(e: Event){
        // Prevent default form behavior (i.e no http request sent by default)
        e.preventDefault();
        // Get userInput from private method
        const userInput = this.gatherUserInput();
        // Check if userInput is an array(or tuple in our case)
        if(Array.isArray(userInput)){
            // Destructure array to get tuple props
            const [title, description, people] = userInput;
            console.log(title, description, people);
            // Clear input after submission
            this.clearInput();
        }
        
    }

    // A method which attaches an event listener to form Element - in this case to the submit event and submitHandler method
    private configure() {
        this.formEl.addEventListener('submit', this.submitHandler)
    }

    // A method which takes an html element and adds it into another element
    private attach(){
        this.hostEl.insertAdjacentElement('afterbegin', this.formEl);
    }
}
// Create a new Project Input instance
const projInput = new ProjectInput();