import InputField from "../form/inputField";
import FileUpload from "../form/fileUpload";
import GreenButton from "../ui/longButtonGreen";

export default function ExamForm() {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 h-full">
    
      {/* Left: File Upload */}
      <div className="flex flex-col h-full">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">File Upload</h3>
        {/* The container below will fill the remaining space */}
        <div className="flex-1">
          <FileUpload />
        </div>
      </div>

      {/* Right: Form Fields */}
      <div className="flex flex-col h-full">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Exam Title</h3>
          <InputField placeholder="Untitled Exam" />
          
          <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-8 mb-2 sm:mb-4">Description</h3>
          <InputField 
            placeholder="What do you want the exam to focus on?" 
            textarea 
          />
        </div>
        {/* mt-auto pushes the button container to the bottom */}
        <div className="text-lg lg:mt-12 mt-auto">
          <GreenButton text="Generate" />
        </div>
      </div>
    </div>
  );
}
