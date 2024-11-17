export interface JsonSchema {
    formTitle: string;
    formDescription: string;
    fields: Field[];
  }
  
  export enum FieldType {
    text = "text",
    email = "email",
    select = "select",
    radio = "radio",
    textarea = "textarea",
    checkbox = "checkbox"
  }
  
  export interface Field {
    id: string;
    type: FieldType;
    label: string;
    required: boolean;
    placeholder?: string;
    validation?: FieldValidation;
    options?: Option[];
  }
  
  export interface FieldValidation {
    pattern: string;
    message: string;
  }
  
  export interface Option {
    value: string;
    label: string;
  }
  
  import { z } from "zod";

  const JsonSchemaValidator = z.object({
    formTitle: z.string().min(1, "Form title is required."),
    formDescription: z.string().min(1, "Form description is required."),
    fields: z
      .array(
        z.object({
          id: z.string().min(1, "Field ID is required."),
          type: z
            .enum(["text", "email", "select", "radio", "textarea", "checkbox"], {
              errorMap: () => ({ message: "Invalid field type provided." }),
            }),
          label: z.string().min(1, "Field label is required."),
          required: z.boolean(),
          placeholder: z.string().optional(),
          validation: z
            .object({
              pattern: z
                .string()
                .min(1, "Validation pattern must be a non-empty string."),
              message: z
                .string()
                .min(1, "Validation message must be a non-empty string."),
            })
            .optional(),
          options: z
            .array(
              z.object({
                value: z.string().min(1, "Option value is required."),
                label: z.string().min(1, "Option label is required."),
              })
            )
            .optional()
        })
      )
      .min(1, "Fields array must have at least one field."),
  });
  
  export default JsonSchemaValidator;
  