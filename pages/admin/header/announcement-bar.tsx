import { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Collapse,
  Switch,
  Space,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import AdminLayout from "../_layout";
import {
  type AnnouncementBarConfig,
  DEFAULT_ANNOUNCEMENT_BAR,
} from "@/widgets/layouts/base/ui/header/types";
import { withAdmin } from "@/shared/hoc/withAdmin";

const { Panel } = Collapse;

export default function AnnouncementBarAdminPage() {
  const [form] = Form.useForm<AnnouncementBarConfig>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/header/announcement-bar");
        if (res.ok) {
          const data = await res.json();
          if (data) form.setFieldsValue(data);
        }
      } catch {
        message.error("Không tải được cấu hình");
      }
    })();
  }, [form]);

  const handleSubmit = async (values: AnnouncementBarConfig) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/header/announcement-bar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        message.success("Đã lưu");
      } else {
        const data = await res.json();
        message.error(data.message || "Lưu thất bại");
      }
    } catch {
      message.error("Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Card title="Thanh thông báo (chạy ngang)">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={DEFAULT_ANNOUNCEMENT_BAR}
        >
          <Form.Item
            name="enabled"
            label="Bật thanh thông báo"
            valuePropName="checked"
            extra="Tắt thì thanh sẽ không hiển thị trên web."
          >
            <Switch />
          </Form.Item>

          <Collapse defaultActiveKey={["items", "right", "style"]}>
            <Panel header="Nội dung chạy (các mục)" key="items">
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...rest }) => (
                      <Space
                        key={key}
                        align="baseline"
                        style={{ display: "flex", marginBottom: 8 }}
                      >
                        <Form.Item
                          {...rest}
                          name={[name, "text"]}
                          rules={[{ required: true, message: "Nhập nội dung" }]}
                          style={{ marginBottom: 0, minWidth: 280 }}
                        >
                          <Input placeholder="Nội dung, vd: 8.6 Đã Cập Nhật" />
                        </Form.Item>
                        <Form.Item
                          {...rest}
                          name={[name, "url"]}
                          style={{ marginBottom: 0, minWidth: 240 }}
                        >
                          <Input placeholder="Link (tùy chọn)" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button
                        type="dashed"
                        onClick={() => add({ text: "", url: "" })}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm mục
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Panel>

            <Panel header="Link bên phải (Zalo / nhóm)" key="right">
              <Form.Item
                name={["rightLink", "enabled"]}
                label="Hiển thị link bên phải"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item name={["rightLink", "badge"]} label="Nhãn badge">
                <Input placeholder="ZALO" />
              </Form.Item>
              <Form.Item name={["rightLink", "label"]} label="Chữ link">
                <Input placeholder="Nhóm Dự Đoán" />
              </Form.Item>
              <Form.Item name={["rightLink", "url"]} label="URL">
                <Input placeholder="https://zalo.me/g/..." />
              </Form.Item>

              <Form.Item
                name={["settingsIcon", "enabled"]}
                label="Hiển thị icon bánh răng"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name={["settingsIcon", "url"]}
                label="URL icon bánh răng (tùy chọn)"
              >
                <Input placeholder="https://..." />
              </Form.Item>
            </Panel>

            <Panel header="Giao diện" key="style">
              <Form.Item
                name="backgroundColor"
                label="Màu nền"
                extra="Mã màu hex, vd: #D94A56"
              >
                <Input placeholder="#D94A56" />
              </Form.Item>
              <Form.Item name="textColor" label="Màu chữ" extra="vd: #ffffff">
                <Input placeholder="#ffffff" />
              </Form.Item>
              <Form.Item
                name="speedSeconds"
                label="Tốc độ chạy (giây/vòng)"
                extra="Số nhỏ = chạy nhanh hơn. Mặc định 30."
                rules={[{ required: true, message: "Nhập tốc độ" }]}
              >
                <InputNumber min={5} max={120} style={{ width: 160 }} />
              </Form.Item>
            </Panel>
          </Collapse>

          <Form.Item
            style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}
          >
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </AdminLayout>
  );
}

export const getServerSideProps = withAdmin;
