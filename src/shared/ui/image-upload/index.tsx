import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button, message, Input } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange?: (path: string) => void;
  label?: string;
  required?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  label,
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  // Helper function để validate URL hợp lệ (không phải fakepath)
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url || !url.trim()) return false;
    if (url.includes('fakepath') || url.includes('C:\\') || url.includes('C:/')) {
      return false;
    }
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  };

  useEffect(() => {
    if (value && isValidImageUrl(value)) {
      setPreview(value);
    } else if (!value) {
      setPreview(null);
    } else {
      console.warn("Invalid image URL detected:", value);
      setPreview(null);
      onChange?.("");
    }
  }, [value, onChange]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Truyền đường dẫn file cũ để xóa (nếu có và hợp lệ)
      if (value && value.trim() && isValidImageUrl(value)) {
        formData.append("oldPath", value);
      }

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload thất bại");
      }

      const data = await res.json();
      const imagePath = data.path;

      // Validate URL trả về từ API
      if (!isValidImageUrl(imagePath)) {
        throw new Error("URL ảnh không hợp lệ. Vui lòng thử lại.");
      }

      setPreview(imagePath);
      onChange?.(imagePath);
      message.success("Upload hình ảnh thành công");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Lỗi khi upload hình ảnh"
      );
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0]);
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error) {
        if (error.code === "file-too-large") {
          message.error("File quá lớn. Kích thước tối đa 5MB");
        } else if (error.code === "file-invalid-type") {
          message.error("File không hợp lệ. Chỉ chấp nhận hình ảnh");
        } else {
          message.error(error.message || "Không thể upload file");
        }
      }
    },
  });

  const handleRemove = () => {
    setPreview(null);
    onChange?.("");
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {preview && isValidImageUrl(preview) ? (
        <div className="relative border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="relative w-full h-48">
            {preview.startsWith('http://') || preview.startsWith('https://') ? (
              // External URL (ImgBB) - use regular img tag
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain rounded"
                onError={(e) => {
                  console.error("Failed to load image:", preview);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              // Local/relative URL - use Next.js Image
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain rounded"
                unoptimized={preview.startsWith('/img-admin/')}
              />
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              {...getRootProps()}
              icon={<UploadOutlined />}
              loading={uploading}
            >
              <input {...getInputProps()} />
              Change the image
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleRemove}>
              Delete
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <Input 
              value={preview || ""} 
              className="text-xs"
              placeholder="Hoặc dán URL ảnh trực tiếp vào đây"
              onChange={(e) => {
                const newValue = e.target.value.trim();
                if (isValidImageUrl(newValue)) {
                  setPreview(newValue);
                  onChange?.(newValue);
                } else if (newValue === "") {
                  setPreview(null);
                  onChange?.("");
                } else {
                  message.warning("URL không hợp lệ. Vui lòng nhập URL đầy đủ (http:// hoặc https://) hoặc đường dẫn relative (/img-admin/...)");
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }
          `}
        >
          <input {...getInputProps()} />
          <UploadOutlined className="text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            {isDragActive
              ? "Thả file vào đây..."
              : "Kéo thả hình ảnh vào đây hoặc click để chọn"}
          </p>
          <p className="text-sm text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
          {uploading && (
            <div className="mt-4">
              <p className="text-blue-600">Đang upload...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
