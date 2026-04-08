import { useEffect, useState } from "react";
import { Button, Input, Form, Card, Space, Collapse, message } from "antd";
import type { PracticeLibraryBannerConfig } from "@/shared/types/admin-config";
import AdminLayout from "../_layout";
import { withAdmin } from "@/shared/hoc/withAdmin";

const { Panel } = Collapse;

function PracticeLibraryPageHeaderPage() {
  const [config, setConfig] = useState<PracticeLibraryBannerConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/ielts-practice-library/banner");
      if (!res.ok) throw new Error("Failed to load config");
      const data = await res.json();

      const normalizedData: PracticeLibraryBannerConfig = {
        listening: { title: data.listening?.title || "" },
        reading: { title: data.reading?.title || "" },
      };

      setConfig(normalizedData);
      form.setFieldsValue(normalizedData);
    } catch {
      message.error("Error loading config");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const configData: PracticeLibraryBannerConfig = {
        listening: { title: values.listening.title },
        reading: { title: values.reading.title },
      };

      const res = await fetch("/api/admin/ielts-practice-library/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Save failed");
      }

      const result = await res.json();
      message.success(result.message || "Config saved successfully");
      setConfig(configData);
    } catch (error) {
      console.error("Error saving config:", error);
      message.error(
        error instanceof Error ? error.message : "Error saving config"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading config...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card
        title={
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold m-0">
              Manage Practice Library Page Header
            </h1>
          </div>
        }
      >
        <Form form={form} layout="vertical" preserve={true}>
          <Collapse defaultActiveKey={["listening", "reading"]}>
            {/* Listening */}
            <Panel header="Listening Page Header" key="listening">
              <Form.Item
                name={["listening", "title"]}
                label="Title"
                rules={[{ required: true, message: "Please enter title" }]}
              >
                <Input placeholder="IELTS Listening Practice Tests" />
              </Form.Item>
            </Panel>

            {/* Reading */}
            <Panel header="Reading Page Header" key="reading">
              <Form.Item
                name={["reading", "title"]}
                label="Title"
                rules={[{ required: true, message: "Please enter title" }]}
              >
                <Input placeholder="IELTS Reading Practice Tests" />
              </Form.Item>
            </Panel>
          </Collapse>

          <Space className="mt-6 w-full justify-end">
            <Button
              type="primary"
              onClick={handleSave}
              loading={saving}
              size="large"
            >
              Save changes
            </Button>
          </Space>
        </Form>
      </Card>
    </AdminLayout>
  );
}

export default PracticeLibraryPageHeaderPage;

export const getServerSideProps = withAdmin;
