import { useState, useCallback } from "react"

interface FileUploadProps {
  files?: File[]
  setFiles?: (files: File[]) => void
  acceptedFormats?: string[]
  maxFileSize?: number // in bytes
  maxFiles?: number
}

export default function FileUpload({
  files = [],
  setFiles,
  acceptedFormats = [".pdf", ".jpg", ".png"],
  maxFileSize = 10 * 1024 * 1024,
  maxFiles = 5,
}: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>(files)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const acceptString = acceptedFormats.join(",")

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      setError(null)
      const validFiles = newFiles.filter((file) => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase()
        if (!acceptedFormats.includes(extension)) {
          setError(`File type ${extension} is not accepted.`)
          return false
        }
        if (file.size > maxFileSize) {
          setError(`File ${file.name} is larger than 10MB.`)
          return false
        }
        return true
      })

      if (internalFiles.length + validFiles.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} files.`)
        return
      }

      const updatedFiles = [...internalFiles, ...validFiles]
      setInternalFiles(updatedFiles)

      if (typeof setFiles === "function") {
        setFiles(updatedFiles)
      } else {
        console.warn("setFiles is not a function. File state is only updated internally.")
      }
    },
    [internalFiles, setFiles, acceptedFormats, maxFileSize, maxFiles],
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      handleFiles(newFiles)
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      handleFiles(newFiles)
      e.dataTransfer.clearData()
    }
  }

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = internalFiles.filter((_, index) => index !== indexToRemove)
    setInternalFiles(updatedFiles)

    if (typeof setFiles === "function") {
      setFiles(updatedFiles)
    } else {
      console.warn("setFiles is not a function. File state is only updated internally.")
    }
  }

  const hasFiles = internalFiles.length > 0
  const isMaxFilesReached = internalFiles.length >= maxFiles

  const dropzoneClass = `h-full border border-zinc-800 rounded-lg p-6 text-center bg-zinc-900 transition-colors duration-300`

  return (
    <div
      className={dropzoneClass}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="h-full flex flex-col gap-6">
        {hasFiles && (
          <div className="flex flex-wrap gap-3">
            {internalFiles.map((file, index) => (
              <div key={index} className="bg-zinc-800 px-3 py-1 rounded-md flex items-center text-sm">
                <span className="mr-2">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-zinc-400 hover:text-zinc-200 material-icons text-base"
                  aria-label={`Remove ${file.name}`}
                >
                  close
                </button>
              </div>
            ))}
          </div>
        )}

        <label
          className={`flex-1 flex flex-col w-full h-full ${isMaxFilesReached ? "cursor-not-allowed " : "cursor-pointer hover:bg-zinc-800/30"} items-center justify-center px-4 py-8 border border-dashed rounded-md self-start transition-colors ${
            isMaxFilesReached ? "border-zinc-700" : isDragging ? "border-emerald-700" : "border-zinc-700"
          }`}
        >
          <span className="text-9xl -mt-6">+</span>
          <span className={`text-xl -mt-4 text-zinc-400`}>
            {isMaxFilesReached ? "File limit reached" : hasFiles ? "Add more files" : "Drop your files here"}
          </span>
          <span className="text-zinc-500 mt-2">
            {isMaxFilesReached
              ? `Maximum ${maxFiles} files uploaded`
              : `Up to ${maxFiles - internalFiles.length} more file(s), 10MB each`}
          </span>
          <span className="text-zinc-500 -mt-0.5">{`Accepted formats: ${acceptedFormats.join(", ")}`}</span>
          {!isMaxFilesReached && (
            <input type="file" className="hidden" onChange={handleFileUpload} accept={acceptString} multiple />
          )}
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
        </label>
      </div>
    </div>
  )
}

