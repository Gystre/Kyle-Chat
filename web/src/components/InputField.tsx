import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import {
    FormControl,
    FormErrorMessage,
    FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Textarea } from "@chakra-ui/textarea";

//make this component take in any props that a normal <input> element would take
type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    textarea?: boolean;
};

export const InputField: React.FC<Props> = ({
    label,
    textarea,
    size: _,
    ...props
}) => {
    //check if textarea, then change the component acorrdingly
    let InputOrTextArea = Input;
    if (textarea) {
        InputOrTextArea = Textarea;
    }

    const [field, { error }] = useField(props);
    return (
        // !! = cast to boolean ("" -> empty string becomes false, "asdfasdf" -> not empty becomes true)
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <InputOrTextArea
                {...field}
                {...props}
                id={field.name}
                placeholder={props.placeholder}
            />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};
