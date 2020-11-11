   import {Project, ProjectStatus} from "../models/project.js"
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
    export class ProjectState extends State<Project>{
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
    export const projectState = ProjectState.getInstance();
