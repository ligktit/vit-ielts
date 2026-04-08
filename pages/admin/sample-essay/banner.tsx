import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Form,
  Card,
  Space,
  Collapse,
  message,
  Divider,
} from "antd";
import type { SampleEssayBannerConfig } from "@/shared/types/admin-config";
import AdminLayout from "../_layout";
import { withAdmin } from "@/shared/hoc/withAdmin";

const { Panel } = Collapse;

function SampleEssayPageHeaderPage() {
  const [config, setConfig] = useState<SampleEssayBannerConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/sample-essay/banner");
      if (!res.ok) throw new Error("Failed to load config");
      const data = await res.json();

      const normalizedData: SampleEssayBannerConfig = {
        writing: {
          title: data.writing?.title || "",
          description: {
            line1: data.writing?.description?.line1 || "",
            line2: data.writing?.description?.line2 || "",
          },
          backgroundColor: data.writing?.backgroundColor || "",
        },
        speaking: {
          title: data.speaking?.title || "",
          description: {
            line1: data.speaking?.description?.line1 || "",
            line2: data.speaking?.description?.line2 || "",
          },
          backgroundColor: data.speaking?.backgroundColor || "",
        },
      };

      setConfig(normalizedData);

      if (!isFormInitialized) {
        form.setFieldsValue(normalizedData);
        setIsFormInitialized(true);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      message.error("Error loading config");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const configData: SampleEssayBannerConfig = {
        writing: values.writing,
        speaking: values.speaking,
      };

      const res = await fetch("/api/admin/sample-essay/banner", {
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
              Manage Sample Essay Page Header
            </h1>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          preserve={true}
          validateTrigger="onBlur"
        >
          <Collapse defaultActiveKey={["writing", "speaking"]}>
            {/* Writing */}
            <Panel header="Writing Page Header" key="writing">
              <Form.Item
                name={["writing", "title"]}
                label="Title"
                rules={[
                  { required: true, message: "Please enter title" },
                ]}
              >
                <Input placeholder="DOL IELTS Writing Task 1 Academic Sample" />
              </Form.Item>
              <Divider orientation="left">Description</Divider>
              <Form.Item
                name={["writing", "description", "line1"]}
                label="Line 1"
                preserve={true}
                validateTrigger="onBlur"
                rules={[{ required: true, message: "Please enter line 1" }]}
              >
                <Input placeholder="Tổng hợp bài mẫu IELTS Writing Task 1 và hướng dẫn cách làm bài," />
              </Form.Item>
              <Form.Item
                name={["writing", "description", "line2"]}
                label="Line 2"
                preserve={true}
                validateTrigger="onBlur"
                rules={[{ required: true, message: "Please enter line 2" }]}
              >
                <Input placeholder="từ vựng chi tiết theo chủ đề." />
              </Form.Item>
              <Form.Item
                name={["writing", "backgroundColor"]}
                label="Background Color/Gradient"
                rules={[
                  { required: true, message: "Please enter background color" },
                ]}
                extra="Ví dụ: linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%) hoặc #ffffff"
              >
                <Input placeholder="linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)" />
              </Form.Item>
            </Panel>

            {/* Speaking */}
            <Panel header="Speaking Page Header" key="speaking">
              <Form.Item
                name={["speaking", "title"]}
                label="Title"
                rules={[
                  { required: true, message: "Please enter title" },
                ]}
              >
                <Input placeholder="DOL IELTS Speaking Sample" />
              </Form.Item>
              <Divider orientation="left">Description</Divider>
              <Form.Item
                name={["speaking", "description", "line1"]}
                label="Line 1"
                preserve={true}
                validateTrigger="onBlur"
                rules={[{ required: true, message: "Please enter line 1" }]}
              >
                <Input placeholder="Tổng hợp bài mẫu IELTS Speaking và hướng dẫn cách làm bài," />
              </Form.Item>
              <Form.Item
                name={["speaking", "description", "line2"]}
                label="Line 2"
                preserve={true}
                validateTrigger="onBlur"
                rules={[{ required: true, message: "Please enter line 2" }]}
              >
                <Input placeholder="từ vựng chi tiết theo chủ đề." />
              </Form.Item>
              <Form.Item
                name={["speaking", "backgroundColor"]}
                label="Background Color/Gradient"
                rules={[
                  { required: true, message: "Please enter background color" },
                ]}
                extra="Ví dụ: linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%) hoặc #ffffff"
              >
                <Input placeholder="linear-gradient(180deg, #FFF3F3 0%, #FFF8F0 100%)" />
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

export default SampleEssayPageHeaderPage;

export const getServerSideProps = withAdmin;
