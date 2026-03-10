import React, { useState, useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Button, Spin, message, Typography, Space, Image } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
  FilePdfOutlined,
  SoundOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

type FileUploadFieldProps = {
  /** MIME types to accept, e.g. { 'image/*': ['.jpg','.png','.webp'] } */
  accept: Accept;
  /** Current file URL (already uploaded) */
  value?: string;
  /** Callback when URL changes (new upload or delete) */
  onChange: (url: string) => void;
  /** Label shown above the dropzone */
  label: string;
};

export default function FileUploadField({
  accept,
  value,
  onChange,
  label,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const fileType = React.useMemo(() => {
    const keys = Object.keys(accept);
    if (keys.some((k) => k.startsWith("image/"))) return "image";
    if (keys.some((k) => k.startsWith("audio/"))) return "audio";
    if (keys.some((k) => k.includes("pdf"))) return "pdf";
    return "other";
  }, [accept]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();

        if (json.success && json.data?.url) {
          onChange(json.data.url);
          message.success(`Upload "${file.name}" thành công`);
        } else {
          message.error(json.error || "Upload thất bại");
        }
      } catch (err) {
        message.error("Lỗi khi upload file");
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: uploading,
  });

  const handleDelete = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
    onChange("");
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setAudioPlaying(!audioPlaying);
  };

  const getFilename = (url: string) => {
    try {
      return decodeURIComponent(url.split("/").pop() || url);
    } catch {
      return url.split("/").pop() || url;
    }
  };

  // If we have a value, show preview
  if (value) {
    return (
      <div style={styles.container}>
        <Text strong style={{ marginBottom: 8, display: "block" }}>
          {label}
        </Text>

        <div style={styles.previewCard}>
          {/* Image preview */}
          {fileType === "image" && (
            <div style={styles.imagePreview}>
              <Image
                src={value}
                alt={label}
                style={{
                  maxHeight: 120,
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: 6,
                }}
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
              />
            </div>
          )}

          {/* Audio preview */}
          {fileType === "audio" && (
            <div style={styles.fileInfo}>
              <SoundOutlined
                style={{ fontSize: 24, color: "#1890ff", marginRight: 8 }}
              />
              <div style={{ flex: 1 }}>
                <Text ellipsis style={{ maxWidth: 200, display: "block" }}>
                  {getFilename(value)}
                </Text>
                <audio
                  ref={audioRef}
                  src={value}
                  onEnded={() => setAudioPlaying(false)}
                  style={{ display: "none" }}
                />
                <Button
                  size="small"
                  type="link"
                  icon={
                    audioPlaying ? (
                      <PauseCircleOutlined />
                    ) : (
                      <PlayCircleOutlined />
                    )
                  }
                  onClick={toggleAudio}
                  style={{ padding: 0, marginTop: 4 }}
                >
                  {audioPlaying ? "Dừng" : "Phát"}
                </Button>
              </div>
            </div>
          )}

          {/* PDF preview */}
          {fileType === "pdf" && (
            <div style={styles.fileInfo}>
              <FilePdfOutlined
                style={{ fontSize: 24, color: "#ff4d4f", marginRight: 8 }}
              />
              <div style={{ flex: 1 }}>
                <Text ellipsis style={{ maxWidth: 200, display: "block" }}>
                  {getFilename(value)}
                </Text>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12 }}
                >
                  Mở PDF ↗
                </a>
              </div>
            </div>
          )}

          {/* Other file */}
          {fileType === "other" && (
            <div style={styles.fileInfo}>
              <FileOutlined
                style={{ fontSize: 24, color: "#8c8c8c", marginRight: 8 }}
              />
              <Text ellipsis style={{ maxWidth: 200 }}>
                {getFilename(value)}
              </Text>
            </div>
          )}

          {/* Delete button */}
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            style={{ marginLeft: "auto" }}
          >
            Xóa
          </Button>
        </div>

        {/* URL display */}
        <Text
          type="secondary"
          style={{ fontSize: 11, marginTop: 4, display: "block" }}
          copyable={{ text: value }}
          ellipsis
        >
          {value}
        </Text>
      </div>
    );
  }

  // No value — show dropzone
  return (
    <div style={styles.container}>
      <Text strong style={{ marginBottom: 8, display: "block" }}>
        {label}
      </Text>

      <div
        {...getRootProps()}
        style={{
          ...styles.dropzone,
          borderColor: isDragActive
            ? "#1890ff"
            : uploading
              ? "#d9d9d9"
              : "#d9d9d9",
          backgroundColor: isDragActive
            ? "#e6f7ff"
            : uploading
              ? "#fafafa"
              : "#fafafa",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <Space direction="vertical" align="center" size="small">
            <Spin />
            <Text type="secondary">Đang upload...</Text>
          </Space>
        ) : (
          <Space direction="vertical" align="center" size="small">
            <CloudUploadOutlined
              style={{
                fontSize: 28,
                color: isDragActive ? "#1890ff" : "#bfbfbf",
              }}
            />
            <Text type="secondary" style={{ fontSize: 13 }}>
              {isDragActive
                ? "Thả file vào đây..."
                : "Kéo thả file hoặc click để chọn"}
            </Text>
          </Space>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: 8,
  },
  dropzone: {
    border: "2px dashed #d9d9d9",
    borderRadius: 8,
    padding: "20px 16px",
    textAlign: "center",
    transition: "all 0.2s ease",
    minHeight: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewCard: {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    border: "1px solid #f0f0f0",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    gap: 12,
  },
  imagePreview: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
};
