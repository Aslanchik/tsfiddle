import Component from "./base-component";
import {Validatable, validate} from "../util/validation";
import {autoBind} from "../decorators/autobind";
import {projectState} from "../state/project-state";

    export default class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
