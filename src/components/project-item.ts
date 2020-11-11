import {Draggable} from "../models/drag-drop";
import Component from "./base-component";
import {Project} from "../models/project";
import {autoBind} from "../decorators/autobind";

        export default class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
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