import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Download } from "lucide-react";
import JsonSchemaValidator, { JsonSchema } from "../utils/validations";

export const HomePage = () => {
  const [jsonCode, setJsonCode] = useState<string>("{}");
  const [parsedJson, setParsedJson] = useState<JsonSchema>();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [submissions, setSubmissions] = useState<Array<{ [key: string]: any }>>(
    []
  );
  const [formKey, setFormKey] = useState<number>(0);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setJsonCode(value);
      try {
        const parsed = JSON.parse(value);
        JsonSchemaValidator.parse(parsed);
        setParsedJson(parsed);
        setError(null);
      } catch (err: any) {
        console.error(err);

        if (err?.errors) {
          const errorMessages = err.errors
            .map((error: any) => {
              const path = error.path.join(" -> ");
              return `${path}: ${error.message}`;
            })
            .join("\n");

          setError(errorMessages);
        } else {
          setError(err.message);
        }

        setParsedJson(undefined);
      }
    }
  };

  const validateField = (field: any, value: string) => {
    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      const isValid = regex.test(value);
      setFieldErrors((prev) => ({
        ...prev,
        [field.id]: isValid ? "" : field.validation.message,
      }));
      return isValid;
    }
    return true;
  };

  const handleFieldChange = (field: any, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field.id]: value,
    }));

    if (field.type === "email") {
      validateField(field, value);
    }
  };

  const handleCopy = () => {
    if (error) {
      alert("Cannot copy invalid JSON!");
      return;
    }
    navigator.clipboard.writeText(jsonCode);
    alert("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (error) {
      alert("Cannot download invalid JSON!");
      return;
    }
    const blob = new Blob([jsonCode], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "schema.json";
    link.click();
  };

  const handleDownloadSubmissions = () => {
    if (submissions.length === 0) {
      alert("No submissions to download!");
      return;
    }
    const submissionsJSON = JSON.stringify(submissions, null, 2);
    const blob = new Blob([submissionsJSON], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `form-submissions-${new Date().toISOString()}.json`;
    link.click();
  };

  const resetForm = () => {
    setFormData({});
    setFieldErrors({});
    setFormKey((prev) => prev + 1); // Increment form key to force re-render
  };

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
      case "select":
        return (
          <div key={field.id} className="mb-4">
            <label htmlFor={field.id} className="text-lg flex">
              {field.label}
              {field.required && <div className="text-red-500 text-xs">*</div>}
            </label>
            <select
              id={field.id}
              required={field.required}
              value={value}
              className="w-full p-2 border border-gray-300 rounded"
              onChange={(e) => handleFieldChange(field, e.target.value)}
            >
              <option value="">Select an option</option>
              {field.options?.map((option: any, index: number) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      case "radio":
        return (
          <div key={field.id} className="mb-4">
            <label htmlFor={field.id} className="text-lg flex">
              {field.label}
              {field.required && <div className="text-red-500 text-xs">*</div>}
            </label>
            {field.options?.map((option: any, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  className="mr-2"
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                />
                <label htmlFor={`${field.id}-${option.value}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div key={field.id} className="mb-4">
            <label htmlFor={field.id} className="text-lg flex">
              {field.label}
              {field.required && <div className="text-red-500 text-xs">*</div>}
            </label>
            <input
              id={field.id}
              type="checkbox"
              required={field.required}
              checked={value}
              className="mr-2"
              onChange={(e) => handleFieldChange(field, e.target.checked)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (error) {
      alert("Cannot submit invalid JSON!");
      return;
    }

    // Validate all fields before submission
    let hasErrors = false;
    const newFieldErrors: { [key: string]: string } = {};

    parsedJson?.fields.forEach((field) => {
      if (field.validation?.pattern && formData[field.id]) {
        const isValid = validateField(field, formData[field.id]);
        if (!isValid) {
          hasErrors = true;
          newFieldErrors[field.id] = field.validation.message;
        }
      }
    });

    setFieldErrors(newFieldErrors);

    if (!hasErrors) {
      // Create a new submission object with all form fields
      const submission = {
        ...formData,
        submittedAt: new Date().toISOString(),
      };

      setSubmissions((prev) => [...prev, submission]);
      console.log("Form data submitted:", submission);
      setSuccessMessage("Form submitted successfully!");

      // Reset the form
      resetForm();

      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <>
      <div className="w-screen h-screen flex p-5 gap-5 overflow-hidden">
        <div className="w-full h-full border ">
          <div className="flex justify-between p-5">
            <div className="h-full text-3xl">JSON Schema Editor</div>
            <div className="flex gap-5">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Copy
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Download Schema
              </button>
            </div>
          </div>

          <div className="h-full w-full">
            <Editor
              height="85vh"
              defaultLanguage="json"
              value={jsonCode}
              onChange={handleEditorChange}
              theme={
                localStorage.getItem("theme") === "light"
                  ? "vs-light"
                  : "vs-dark"
              }
            />
          </div>
        </div>

        <div className="w-full h-full border  flex flex-col">
          <div className="flex justify-between p-5 sticky top-0 z-10">
            <div className="h-full text-3xl">Form Preview</div>
            <button
              onClick={handleDownloadSubmissions}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              disabled={submissions.length === 0}
            >
              <Download size={20} />
              Download Submissions ({submissions.length})
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {!error ? (
              <>
                {parsedJson && (
                  <div>
                    <h1 className="text-2xl font-bold mb-4">
                      {parsedJson.formTitle}
                    </h1>
                    <h1 className="text-xl mb-4">
                      {parsedJson.formDescription}
                    </h1>

                    <form
                      key={formKey}
                      className="space-y-4"
                      onSubmit={handleSubmit}
                    >
                      {parsedJson?.fields?.map((field: any) =>
                        renderField(field)
                      )}

                      <button
                        type="submit"
                        className="w-full text-center bg-blue-500 p-2 hover:bg-blue-600 text-white rounded"
                      >
                        Submit
                      </button>
                    </form>
                  </div>
                )}

                {successMessage && (
                  <div className="text-green-500 mt-4">{successMessage}</div>
                )}
              </>
            ) : (
              <div className="text-red-500">{error}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
