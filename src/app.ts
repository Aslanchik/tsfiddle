// DRAG AND DROP Interfaces
interface Draggable{
    dragStartHandler(e: DragEvent):void;
    dragEndHandler(e: DragEvent):void;
}

interface DragTarget{
    dragOverHandler(e:DragEvent):void;
    dropHandler(e:DragEvent):void;
    dragLeaveHandler(e:DragEvent):void;
}

// Project Type
enum ProjectStatus { Active, Finished};
class Project {
    constructor(public id:string, public title:string, public description:string, public people:number, public projectStatus:ProjectStatus){}
}

// Define a custom type of function for listeners
type Listener<T> = (items: T[]) => void;

class State<T> {
        // Array of event listeners with protected keyword so only this class and those that inherit it can access this array
    protected listeners: Listener<T>[] = [];

    // Public method that lets us push a new listener function into the listener array
    addListener(listenFnc:Listener<T>){
        this.listeners.push(listenFnc);
    }

}

// ProjectState is a singleton class which means there can only be one and only instance of this class and we will allways work with that instance
class ProjectState extends State<Project>{
    // Define a starting projects array
    private projects: Project[] = [];
    // Define an instance property so you can use this class as a singleton
    private static instance: ProjectState;

    private constructor(){
        super();
    }

    // Static method that retrieves the single instance
    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        // If this class was not instantiated - instantiate it!
        this.instance = new ProjectState();
        return this.instance;
    }
    // Public method that lets us add a new project into the state array
    addProject(title:string, description:string, people:number){
        // Create a new instance of project class with Random id, title, description, people and a ProjectStatus of Active
        const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
        
    }
    // Public method that handles moving project from one list to another Statewise
    moveProject(projectId: string, newStatus: ProjectStatus){
        // Fish the selected project from the projects state
        const project = this.projects.find(project => project.id === projectId);
        // Check if project exists at all and if it does, check if its status is the same as its current status
        if(project && project.projectStatus !== newStatus){
            // If both are true update the new status
            project.projectStatus = newStatus;
            // After updating status rerender the DOM
            this.updateListeners();
        }
    }
    
    private updateListeners(){
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

// Component BASE class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
    private project:Project;
    // Define a getter that returns a template text to display inside the project item depending on amount of people set in the project
    get persons(){
        if(this.project.people === 1){
            return '1 person';
        } else {
            return `${this.project.people} persons`;
        }
    }
    // Call the constructor method and pass it a host element Id and the current project
    constructor(hostId:string, project:Project){
        // Call super(Base component constructor)
        super('single-project', hostId, false, project.id);
        // Initialize project with project recieved when instantiating ProjectItem
        this.project = project;
        this.configure();
        this.renderContent();
    }

    // Define methods for drag and drop
    @autoBind
    dragStartHandler(e:DragEvent){
        // Transfer project id with the drag event
        e.dataTransfer!.setData('text/plain', this.project.id);
        e.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_:DragEvent){
        console.log('Drag end!')
    }

    configure(){
        // add event listeners to the element based on drag and drop
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    renderContent(){
        // Render content into the template
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    // Initialize class properties
    assignedProjects:Project[];
    // This class expected an argument inside the constructor which is the type of project (active or finished)
    constructor(private type: 'active' | 'finished'){
        super('project-list', 'app', false , `${type}-projects`);
        // Assign class properties
        this.assignedProjects = [];
        // Configure listener
        this.configure();
        // Render content into the element
        this.renderContent();
    }

    @autoBind
    dragOverHandler(e: DragEvent){
        if(e.dataTransfer && e.dataTransfer.types[0] === 'text/plain'){
            e.preventDefault();
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.add('droppable');
        }
    }

    @autoBind
    dropHandler(e: DragEvent){
        const projId = e.dataTransfer!.getData('text/plain');
        projectState.moveProject(projId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    @autoBind
    dragLeaveHandler(_: DragEvent){
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.remove('droppable');
    }

    // A method which renders content into the selected element
    renderContent(){
        // Determine an ID depending on Project list type
        const listId = `${this.type}-projects-list`;
        // Set id to the UL element
        this.element.querySelector('ul')!.id = listId;
        // Insert text into the h2 element
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }
    // A method that assigns a listener function to any projects change
    configure(){
        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)
        this.element.addEventListener('drop', this.dropHandler)
        // Assign a listener function to any projects change
        projectState.addListener((projects:Project[]) =>{
            // Filter projects based on Active or Finished
            const relevantProjects = projects.filter((proj)=>{
                if(this.type === 'active'){
                    return proj.projectStatus === ProjectStatus.Active;
                }
                return proj.projectStatus === ProjectStatus.Finished;
            })
            // overwrite assignedProjects property with the filtered projects array
            this.assignedProjects = relevantProjects;
            // Render Projects into the dom
            this.renderProjects();
        })
    }

    // A method that renders projects based on assigned projects
    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        // First empty listEl html from old projects so you wont get duplicates
        listEl.innerHTML = '';
        // Loop through assignedProjects property and create list elements with title as textcontent and then append to ul
        for(const projItem of this.assignedProjects){
            new ProjectItem(this.element.querySelector('ul')!.id, projItem);
        }
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    // Initialize class properties
    titleInputEl: HTMLInputElement;
    descriptionInputEl: HTMLInputElement;
    peopleInputEl: HTMLInputElement;
    
    constructor(){
        super('project-input', 'app', true, 'user-input');
                        // Get form input elements from DOM and typecast
        this.titleInputEl = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputEl = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputEl = this.element.querySelector('#people')! as HTMLInputElement;
        // Use private method that attaches an eventListener to formElement 
        this.configure();
    }

    // A method which attaches an event listener to form Element - in this case to the submit event and submitHandler method
    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    renderContent(){}

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

    
}


// Create a new Project Input instance
const projInput = new ProjectInput();
// Create new ProjectLists Instance
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');