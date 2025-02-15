import InputField from "../form/inputField";
import FileUpload from "../form/fileUpload";
import GreenButton from "../ui/buttonGreen"

export default function ExamForm() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-8">
      {/* Left: File Upload */}
      <div>
        <h3 className="text-lg font-semibold mb-2">File Upload</h3>
        <FileUpload />
      </div>

      {/* Right: Form Fields */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Exam Title</h3>
        <InputField 
          placeholder="Untitled Exam" 
        />
        
        <h3 className="text-lg font-semibold mt-4 mb-2">Description</h3>
        <InputField placeholder="What do you want the exam to focus on?" textarea />
        <div className="mt-4">
            <GreenButton text="Generate"></GreenButton>
        </div>
      </div>
    </div>
  );
}
