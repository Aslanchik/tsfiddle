// Define A validation interface with validation rules
    export interface Validatable{
        value: string | number;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    }
    // Define a validate function that checks each one of the validation interface rules
    export function validate(validatableInput: Validatable){
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
