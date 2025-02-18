import { useState } from "react";

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  return (
    <div className="border border-zinc-700 rounded-lg p-6 text-center bg-zinc-800">
      {files.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={index} className="bg-zinc-900 px-3 py-1 rounded-md">
              {file.name} ✖
            </div>
          ))}
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center">
          <span className="text-4xl">+</span>
          <span className="text-zinc-400">Drop your file here</span>
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
      )}
    </div>
  );
}
