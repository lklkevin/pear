import { useState, useCallback } from "react";
import { useErrorStore } from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  files?: File[];
  setFiles?: (files: File[]) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
}

export default function FileUpload({
  files = [],
  setFiles,
  acceptedFormats = [".pdf"],
  maxFileSize = 10 * 1024 * 1024,
  maxFiles = 3,
}: FileUploadProps) {
  const [internalFiles, setInternalFiles] = useState<File[]>(files);

  const acceptString = acceptedFormats.join(",");

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      // Clear previous global error
      useErrorStore.getState().setError(null);

      const validFiles = newFiles.filter((file) => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        if (!acceptedFormats.includes(extension)) {
          useErrorStore
            .getState()
            .setError(`File type ${extension} is not accepted.`);
          return false;
        }
        if (file.size > maxFileSize) {
          useErrorStore
            .getState()
            .setError(`File ${file.name} is larger than 10MB.`);
          return false;
        }
        return true;
      });

      if (internalFiles.length + validFiles.length > maxFiles) {
        useErrorStore
          .getState()
          .setError(`You can only upload up to ${maxFiles} files.`);
        return;
      }

      const updatedFiles = [...internalFiles, ...validFiles];
      setInternalFiles(updatedFiles);

      if (typeof setFiles === "function") {
        setFiles(updatedFiles);
      } else {
        console.warn(
          "setFiles is not a function. File state is only updated internally."
        );
      }
    },
    [internalFiles, setFiles, acceptedFormats, maxFileSize, maxFiles]
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      handleFiles(newFiles);
      // Reset the file input value to allow reselecting the same file
    }
    event.target.value = "";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      handleFiles(newFiles);
      e.dataTransfer.clearData();
    }
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = internalFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setInternalFiles(updatedFiles);

    if (typeof setFiles === "function") {
      setFiles(updatedFiles);
    } else {
      console.warn(
        "setFiles is not a function. File state is only updated internally."
      );
    }
  };

  const hasFiles = internalFiles.length > 0;
  const isMaxFilesReached = internalFiles.length >= maxFiles;
  const dropzoneClass =
    "h-full border border-zinc-800 rounded-lg text-center bg-zinc-900 transition-all duration-500 ease-in-out";

  // Animation variants for consistent animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const fileItemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  };

  return (
    <div
      className={dropzoneClass}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <motion.div
        layout
        className="h-full flex flex-col"
        transition={{
          layout: {
            duration: 0.3,
            ease: "easeOut",
            type: "tween",
          },
        }}
      >
        <AnimatePresence mode="popLayout">
          {hasFiles && (
            <motion.div
              layout
              style={{ overflow: "hidden", zIndex: 1 }}
              className="flex flex-wrap gap-3 sm:gap-4 p-4 sm:p-6 bg-zinc-950/25 rounded-t-lg border-b border-zinc-800"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
              layoutRoot
            >
              {internalFiles.map((file, index) => (
                <motion.div
                  key={`file-${file.name}-${index}`}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md flex items-center text-sm"
                  variants={fileItemVariants}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    transition: { duration: 0.15 },
                  }}
                  transition={{ duration: 0.2 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    borderColor: "rgba(161, 161, 170, 0.5)",
                  }}
                  layout="position"
                >
                  <span className="mr-2">{file.name}</span>
                  <motion.button
                    onClick={() => removeFile(index)}
                    className="text-zinc-400 hover:text-white material-icons text-sm sm:text-base"
                    aria-label={`Remove ${file.name}`}
                  >
                    close
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          layout
          style={{ overflow: "hidden", position: "relative", zIndex: 2 }}
          transition={{
            layout: {
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1.0],
              type: "spring",
              stiffness: 200,
              damping: 25,
            },
          }}
          className="p-4 sm:p-6 flex-1"
        >
          <motion.label
            className={`flex-1 flex flex-col w-full h-full ${
              isMaxFilesReached
                ? "cursor-not-allowed "
                : "cursor-pointer hover:bg-zinc-800/30"
            } items-center justify-center px-4 py-8 border border-dashed rounded-md self-start transition-all duration-300 ${
              isMaxFilesReached ? "border-zinc-700" : "border-zinc-700"
            }`}
          >
            <motion.span className="text-9xl -mt-6">+</motion.span>
            <motion.span className="text-base sm:text-xl -mt-2 sm:-mt-4 text-zinc-400">
              {isMaxFilesReached
                ? "File limit reached"
                : hasFiles
                ? "Add more files"
                : "Drop your files here"}
            </motion.span>
            <span className="text-sm sm:text-base text-zinc-500 mt-1 sm:mt-2">
              {isMaxFilesReached
                ? `Maximum ${maxFiles} files uploaded`
                : `Up to ${
                    maxFiles - internalFiles.length
                  } more file(s), 10MB each`}
            </span>
            <span className="text-sm sm:text-base text-zinc-500 -mt-0.5">
              {`Accepted formats: ${acceptedFormats.join(", ")}`}
            </span>
            {!isMaxFilesReached && (
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept={acceptString}
                multiple
              />
            )}
          </motion.label>
        </motion.div>
      </motion.div>
    </div>
  );
}
