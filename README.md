
# JSON Schema Form Builder

A React-based web application that allows users to create, edit, validate, and preview forms dynamically based on a JSON schema. The project also supports theme switching (light/dark) and allows users to copy and download the generated schema.

## Features

1. **Editing the JSON Schema**:  
   The editor uses the Monaco Editor for syntax highlighting and validation. Edit the schema directly in the editor on the left-hand side.

2. **Form Preview**:  
   On the right-hand side, the form dynamically updates as you edit the schema. The form will reflect the fields defined in the schema, and you can interact with it as a user would.

3. **Validation and Submission**:  
   The form has built-in validation based on the schema (e.g., required fields, regex patterns). Once the form is filled out, it can be submitted. You can also download the form submissions.

4. **Theme Switching**:  
   The application supports light and dark themes. Click the 🌑/☀️ button in the bottom-right corner to toggle between the two themes.

5. **Copying and Downloading JSON**:  
   You can copy the generated JSON schema to your clipboard or download it as a `.json` file using the provided buttons.

## Tech Stack

- React (with functional components and hooks)
- TypeScript
- Monaco Editor for JSON schema editing
- Zod for JSON schema validation
- Tailwind CSS for styling
- React Router for routing

## How did I Implement this Project ?

I started by setting up the project using **Vite** for fast bundling and development. The project was initialized with TypeScript for type safety, and essential dependencies were installed. Here's a step-by-step setup process for the client-side application:

```bash
# Create a new Vite project
npx create-vite@latest client

# Navigate to the project folder
cd client

# Install necessary dependencies
npm install @monaco-editor/react lucide-react react-router-dom zod
```

Setting up tailwindCSS from the docs https://tailwindcss.com/docs/guides/vite

### Dependencies

The following dependencies were added to the `package.json` file:

```json
"dependencies": {
  "@monaco-editor/react": "^4.6.0",
  "lucide-react": "^0.460.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "zod": "^3.23.8"
}
```

- **@monaco-editor/react**: Monaco Editor used to edit and visualize the JSON schema.
- **lucide-react**: Icons used for UI components, including a download button.
- **react-router-dom**: To manage routing in the application (if needed for future expansion).
- **zod**: A schema validation library to ensure the JSON schema's structure is correct.


### Step 1: Setting Up Monaco Editor

The Monaco Editor was integrated into the project to allow users to edit the JSON schema with syntax highlighting and validation. It is a controlled component where the state (`jsonCode`) tracks the current content of the editor.

```tsx
<Editor
  height="85vh"
  defaultLanguage="json"
  value={jsonCode}
  onChange={handleEditorChange}
  theme={localStorage.getItem("theme") === "light" ? "vs-light" : "vs-dark"}
/>
```

### Step 2: Handling JSON Schema Validation with Zod

Zod was used to validate the JSON schema's structure. The validation logic is applied whenever the user updates the schema in the editor. Here's the Zod validation used for the JSON schema:

```ts
const JsonSchemaValidator = z.object({
  formTitle: z.string().min(1, "Form title is required."),
  formDescription: z.string().min(1, "Form description is required."),
  fields: z
    .array(
      z.object({
        id: z.string().min(1, "Field ID is required."),
        type: z.enum(["text", "email", "select", "radio", "textarea", "checkbox"], {
          errorMap: () => ({ message: "Invalid field type provided." }),
        }),
        label: z.string().min(1, "Field label is required."),
        required: z.boolean(),
        placeholder: z.string().optional(),
        validation: z
          .object({
            pattern: z.string().min(1, "Validation pattern must be a non-empty string."),
            message: z.string().min(1, "Validation message must be a non-empty string."),
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
```


### Step 3: Interfaces

To ensure type safety and code clarity, I defined **TypeScript interfaces** for the form structure and the JSON schema. This not only improves code maintainability but also helps prevent errors during development. Each form field type and validation is strictly typed.

```ts
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
```

### Step 4: Rendering the Form Based on JSON Schema

The schema dynamically generates a form based on the user-provided fields. The form is rendered using switch statements, with each field being created according to its type (text input, radio button, checkbox, etc.).

```tsx
  const renderField = (field: any) => {
    const value = formData[field.id] || "";

    switch (field.type) {
      case "text":
      case "email":
      case "textarea":
        return (
          <div key={field.id} className="mb-4">
            <label htmlFor={field.id} className="text-lg flex">
              {field.label}
              {field.required && <div className="text-red-500 text-xs">*</div>}
            </label>
            <input
              id={field.id}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              value={value}
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => handleFieldChange(field, e.target.value)}
            />
            {fieldErrors[field.id] && (
              <span className="text-sm text-red-500">
                {fieldErrors[field.id]}
              </span>
            )}
          </div>
        );
    // Other cases for select, radio, checkbox
  }
};
```

### Step 5: Handling Form Validation and Submission

Form data is validated upon submission using the Zod schema. If any fields are invalid, error messages are displayed. If the form is valid, the data is added to the submissions Array.
Here’s an explanation of the approach for the steps you mentioned:


### Step 6: Copying and Downloading the Schema

In this step, we focus on providing users with the ability to copy or download the JSON schema they’ve created or edited. 

- **Copy to Clipboard:** The `handleCopy` function ensures that when the user clicks the "Copy" button, the current JSON schema is copied to the clipboard. If the schema is invalid (i.e., the `error` state is not null), the user will receive an alert indicating that invalid JSON cannot be copied. If the schema is valid, the `navigator.clipboard.writeText()` method is called to copy the JSON code.
  
- **Download as JSON File:** The `handleDownload` function allows users to download the JSON schema as a `.json` file. It checks if the schema is valid and then creates a Blob containing the schema data, which is then used to create a download link for the user. This method provides a convenient way for users to export the schema for use elsewhere.


### Step 7: Download Submissions Button

This step allows users to download all form submissions in a structured `.json` file format.

- **Download Submissions:** The `handleDownloadSubmissions` function gathers all the form submissions stored in the `submissions` state. If there are submissions, it converts the array into a formatted JSON string and creates a Blob, allowing the user to download the data. The `new Date().toISOString()` in the filename ensures each submission download file has a unique name based on the time it was generated.
  
- **No Submissions Alert:** If there are no submissions, the function alerts the user with a message saying there’s no data to download. This ensures users aren’t confused when trying to download empty data.


### Step 8: Implementing Themes

- **Switching Between Themes:** The logic for switching themes could be handled via a button that updates the `localStorage` value. You could trigger the theme switcher by adding a button that toggles between light and dark themes.



### Step 9: Adding Responsiveness Using TailwindCSS

TailwindCSS is used to ensure the form builder application is responsive across various screen sizes.

### Step 10: Deployment

Finally, the project was deployed using **Vercel** for continuous deployment. Each push to the `main` branch triggers a new deployment automatically.


![image](https://github.com/user-attachments/assets/5059c306-9eb4-4056-9cb8-282178e61974)

## Setup Instructions

### Prerequisites

Make sure you have Node.js installed on your machine. If not, you can download it from [here](https://nodejs.org/).

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/saiabhiramjaini/JSON-Schema-Form-Builder
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the local development server:

   ```bash
   npm run dev
   ```

4. Open the application in your browser at `http://localhost:5173`.

## Example JSON Schemas

Here are some example JSON schemas that can be used to generate forms:

```json
{
  "formTitle": "Project Requirements Survey",
  "formDescription": "Please fill out this survey about your project needs",
  "fields": [
    {
      "id": "name",
      "type": "text",
      "label": "Full Name",
      "required": true,
      "placeholder": "Enter your full name"
    },
    {
      "id": "email",
      "type": "email",
      "label": "Email Address",
      "required": true,
      "placeholder": "you@example.com",
      "validation": {
        "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        "message": "Please enter a valid email address"
      }
    },
    {
      "id": "companySize",
      "type": "select",
      "label": "Company Size",
      "required": true,
      "options": [
        { "value": "1-50", "label": "1-50 employees" },
        { "value": "51-200", "label": "51-200 employees" },
        { "value": "201-1000", "label": "201-1000 employees" },
        { "value": "1000+", "label": "1000+ employees" }
      ]
    },
    {
      "id": "industry",
      "type": "radio",
      "label": "Industry",
      "required": true,
      "options": [
        { "value": "tech", "label": "Technology" },
        { "value": "healthcare", "label": "Healthcare" },
        { "value": "finance", "label": "Finance" },
        { "value": "retail", "label": "Retail" },
        { "value": "other", "label": "Other" }
      ]
    },
    {
      "id": "timeline",
      "type": "select",
      "label": "Project Timeline",
      "required": true,
      "options": [
        { "value": "immediate", "label": "Immediate (within 1 month)" },
        { "value": "short", "label": "Short-term (1-3 months)" },
        { "value": "medium", "label": "Medium-term (3-6 months)" },
        { "value": "long", "label": "Long-term (6+ months)" }
      ]
    },
    {
      "id": "comments",
      "type": "textarea",
      "label": "Additional Comments",
      "required": false,
      "placeholder": "Any other details you'd like to share..."
    }
  ]
}
```




## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes and commit them (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a new Pull Request.












