import { useEffect, useRef } from "react";
import { Modal, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { Html5Qrcode } from "html5-qrcode";

const READER_ID = "classroom-qr-reader";

/**
 * Camera QR scanner modal. Calls onResult with the decoded text (a join link or
 * raw code) the first time a code is read, then the caller closes it.
 */
export const ClassroomQrScanner = ({
  open,
  onClose,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!open) return;
    let handled = false;
    // Wait a tick so the reader div is mounted by the Modal.
    const t = setTimeout(() => {
      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;
      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (handled) return;
            handled = true;
            onResult(decoded);
          },
          () => {}
        )
        .catch(() => {
          message.error("Could not open camera. Please grant camera permission.");
          onClose();
        });
    }, 80);

    return () => {
      clearTimeout(t);
      const s = scannerRef.current;
      if (s) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [open, onResult, onClose]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={420}
      centered
      styles={{ content: { borderRadius: 16, padding: 24 } }}
      destroyOnClose
    >
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-[20px] font-bold text-[#191D24]">Scan invite QR code</h3>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6A7282] hover:bg-[#E5E7EB]"
          aria-label="Close"
        >
          <CloseOutlined />
        </button>
      </div>
      <div id={READER_ID} className="overflow-hidden rounded-[12px] bg-black" />
      <p className="mt-3 text-center text-[13px] text-[#6A7282]">
        Point the class QR code at the frame to scan automatically.
      </p>
    </Modal>
  );
};
