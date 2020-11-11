// ProjectState is a singleton class which means there can only be one and only instance of this class and we will allways work with that instance
class ProjectState{
    // Array of event listeners
    private listeners: any[] = [];
    // Define a starting projects array
    private projects: any[] = [];
    // Define an instance property so you can use this class as a singleton
    private static instance: ProjectState;
    private constructor(){}

    // Static method that retrieves the single instance
    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        // If this class was not instantiated - instantiate it!
        this.instance = new ProjectState();
        return this.instance;
    }

    // Public method that lets us push a new listener function into the listener array
    addListener(listenFnc:Function){
        this.listeners.push(listenFnc);
    }
    // Public method that lets us add a new project into the state array
    addProject(title:string, description:string, people:number){
        const newProject ={
            id:Math.random().toString(),
            title,
            description,
            people
        }
        this.projects.push(newProject);
        // Loop through the listener functions and pass them a new array based on the projects array
        for(const listenFnc of this.listeners){
            listenFnc(this.projects.slice());
        }
    }
}
// Get the instance (or create a new one if it has not been declared yet) so you always work with the same instance of project state
const projectState = ProjectState.getInstance();



// Define A validation interface with validation rules
interface Validatable{
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}
// Define a validate function that checks each one of the validation interface rules
function validate(validatableInput: Validatable){
    // Set initial value to true
    let isValid = true;
    // Check if each one of the Validatable interface rules are met and then set isValid to be false if they are 
    if(validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if(validatableInput.minLength != null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if(validatableInput.maxLength !=null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if(validatableInput.min != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value >= validatableInput.min;
    } 
    if(validatableInput.max != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    // Return true if everything is valid and return false if atleast one of the if checks pinged a validation rule
    return isValid
}
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

class ProjectList {
    // Initialize class properties
    templateEl: HTMLTemplateElement;
    hostEl: HTMLDivElement;
    element: HTMLElement;
    assignedProjects:any[];
    // This class expected an argument inside the constructor which is the type of project (active or finished)
    constructor(private type: 'active' | 'finished'){
        // Determine property values by grabbing them from the DOM and typecasting to respective types, adding ! so that TS knows that these are not null
        this.templateEl = document.getElementById('project-list')! as HTMLTemplateElement; 
        this.hostEl = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = [];
        // Import html content from template element
        const importedHtmlContent = document.importNode(this.templateEl.content, true);
        // Get form element from imported html content
        this.element = importedHtmlContent.firstElementChild as HTMLElement;
        // Interact with element and add an ID depending on initialized ProjectList type
        this.element.id = `${type}-projects`;
        // Assign a listener function to any projects change
        projectState.addListener((projects:any[]) =>{
            // overwrite assignedProjects property with the projects array from the state
            this.assignedProjects = projects;
            // Render Projects into the dom
            this.renderProjects();
        })
        // Attach imported element into hostElement
        this.attach();
        // Render content into the element
        this.renderContent();
    }

    // A method that renders projects based on assigned projects
    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        // Loop through assignedProjects property and create list elements with title as textcontent and then append to ul
        for(const projItem of this.assignedProjects){
            const listItem = document.createElement('li');
            listItem.textContent = projItem.title;
            listEl.appendChild(listItem);
        }
    }
    // A method which renders content into the selected element
    private renderContent(){
        // Determine an ID depending on Project list type
        const listId = `${this.type}-projects-list`;
        // Set id to the UL element
        this.element.querySelector('ul')!.id = listId;
        // Insert text into the h2 element
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }

    // A method which takes an html element and adds it into another element
    private attach(){
        this.hostEl.insertAdjacentElement('beforeend', this.element);
    }
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
        // Create validatable objects with validation rules
        const titleValidatable: Validatable = {
            value: titleVal,
            required:true,
            minLength: 5
        }
        const descriptionValidatable: Validatable = {
            value: descriptionVal,
            required:true,
            minLength: 20
        }
        const peopleValidatable: Validatable = {
            value: +peopleVal,
            required:true,
            min:1,
            max: 5
        }
        // If atleast one input validation fails, return function and alert 
        if(!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)){
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
            // Push the new project into our state instance
            projectState.addProject(title, description, people);
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
// Create new ProjectLists Instance
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');