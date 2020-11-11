    // A Decorator that automatically binds 'this' to the method when it is called
    export function autoBind(_: any, _2:string, descriptor:PropertyDescriptor){
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