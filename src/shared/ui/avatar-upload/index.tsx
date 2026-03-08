/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { fileSizeValidator } from "@/shared/lib/fileValidator";
import { twMerge } from "tailwind-merge";

export function AvatarUpload({
  setFile = () => {},
  validator = fileSizeValidator,
  previewUrl,
  classNames,
}: {
  setFile: (file: File | null) => void;
  validator?: DropzoneOptions["validator"];
  required?: boolean;
  previewUrl?: string;
  classNames?: {
    container?: string;
    wrapper?: string;
    image?: string;
    error?: string;
  };
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "image/*": [],
      },
      validator,
    });

  useEffect(() => {
    if (fileRejections.length) {
      setError(fileRejections[0].errors[0].message);
    } else {
      setError("");
    }
  }, [fileRejections]);

  useEffect(() => {
    if (acceptedFiles.length) {
      setFile(acceptedFiles[0]);
      const blob = URL.createObjectURL(acceptedFiles[0]);
      setPreview(blob);

      return () => {
        URL.revokeObjectURL(blob);
      };
    } else {
      setFile(null);
      setPreview(previewUrl || null);
    }
  }, [acceptedFiles, setFile, previewUrl]);

  // useEffect(() => {
  //   if (value) {
  //     const blob = URL.createObjectURL(value);
  //     setPreview(blob);

  //     return () => {
  //       URL.revokeObjectURL(blob);
  //     };
  //   }
  // }, [value]);

  return (
    <div
      className={twMerge(
        "w-full h-full aspect-square rounded-lg border-dashed cursor-pointer border border-black/20 overflow-hidden bg-gray-50 hover:border-primary-500 duration-150",
        classNames?.container
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className={twMerge("p-1 w-full h-full", classNames?.wrapper)}>
          <div className="relative w-full h-full">
            <img
              className={twMerge(
                "h-full w-full object-contain rounded overflow-hidden",
                classNames?.image
              )}
              src={preview}
              alt=""
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full text-sm space-y-1">
          <i className="fa-regular fa-plus"></i>
          <p>Upload</p>
          {error && <p>{error}</p>}
        </div>
      )}
    </div>
  );
}
