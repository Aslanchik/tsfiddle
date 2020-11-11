import Component from "./base-component.js";
import {DragTarget} from "../models/drag-drop.js";
import {Project, ProjectStatus} from "../models/project.js";
import {autoBind} from "../decorators/autobind.js";
import {projectState} from "../state/project-state.js";
import ProjectItem from "./project-item.js";

        export default class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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