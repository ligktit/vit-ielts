import { useEffect, useState } from "react";
import { Button, Input, Form, Card, Space, Collapse, message, Select } from "antd";
import type { ContactPageConfig } from "@/shared/types/admin-config";
import AdminLayout from "./_layout";
import { ImageUpload } from "@/shared/ui/image-upload";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { withAdmin } from "@/shared/hoc/withAdmin";

const { Panel } = Collapse;

function ContactAdminPage() {
  const [config, setConfig] = useState<ContactPageConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/contact");
      if (!res.ok) throw new Error("Failed to load config");
      const data = await res.json();
      
      // Default initial structure if no config
      const initialData = data && Object.keys(data).length > 0 ? data : {
        banner: { title: "Contact", backgroundImage: "" },
        form: {
          nameLabel: "Your name", namePlaceholder: "Name",
          emailLabel: "Your email address", emailPlaceholder: "Email",
          subjectLabel: "Subject", subjectPlaceholder: "Subject",
          messageLabel: "Message", messagePlaceholder: "Message",
          buttonText: "Send message",
          successMessage: "Thank you for your message! We will get back to you soon.",
          errorMessage: "Something went wrong"
        },
        socialLinks: []
      };

      setConfig(initialData);
      form.setFieldsValue(initialData);
    } catch {
      message.error("Error loading config");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Save failed");

      message.success("Config saved successfully");
      setConfig(values);
    } catch {
      message.error("Error saving config");
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
            <h1 className="text-2xl font-bold m-0">Manage Contact Page</h1>
          </div>
        }
      >
        <Form form={form} layout="vertical" initialValues={config}>
          <Collapse defaultActiveKey={["banner", "form", "socialLinks"]}>
            {/* Banner Section */}
            <Panel header="Banner Section" key="banner">
              <Form.Item
                name={["banner", "title"]}
                label="Title"
                rules={[{ required: true, message: "Please enter title" }]}
              >
                <Input placeholder="Contact" />
              </Form.Item>
              <Form.Item
                name={["banner", "backgroundImage"]}
                label="Background Image URL (optional)"
              >
                <ImageUpload />
              </Form.Item>
            </Panel>

            {/* Form Section */}
            <Panel header="Contact Form Content" key="form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name={["form", "nameLabel"]} label="Name Label" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name={["form", "namePlaceholder"]} label="Name Placeholder" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>

                <Form.Item name={["form", "emailLabel"]} label="Email Label" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name={["form", "emailPlaceholder"]} label="Email Placeholder" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>

                <Form.Item name={["form", "subjectLabel"]} label="Subject Label" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name={["form", "subjectPlaceholder"]} label="Subject Placeholder" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>

                <Form.Item name={["form", "messageLabel"]} label="Message Label" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name={["form", "messagePlaceholder"]} label="Message Placeholder" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </div>

              <Form.Item name={["form", "buttonText"]} label="Submit Button Text" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              
              <Form.Item name={["form", "successMessage"]} label="Success Notification Message" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item name={["form", "errorMessage"]} label="Error Notification Message" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Panel>

            {/* Social Links Section */}
            <Panel header="Social Links" key="socialLinks">
              <Form.List name="socialLinks">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        size="small"
                        title={`Social Link ${name + 1}`}
                        style={{ marginBottom: 16 }}
                        extra={
                          <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)}>
                            Remove
                          </Button>
                        }
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Form.Item
                            {...restField}
                            name={[name, "platform"]}
                            label="Platform"
                            rules={[{ required: true, message: "Missing platform" }]}
                          >
                            <Select
                              options={[
                                { label: "Facebook", value: "facebook" },
                                { label: "TikTok", value: "tiktok" },
                                { label: "YouTube", value: "youtube" },
                                { label: "Zalo", value: "zalo" },
                                { label: "Instagram", value: "instagram" },
                                { label: "Other", value: "other" },
                              ]}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "label"]}
                            label="Label (e.g. Facebook Group)"
                            rules={[{ required: true, message: "Missing label" }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "username"]}
                            label="Username (e.g. @ielts.practice)"
                            rules={[{ required: true, message: "Missing username" }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "url"]}
                            label="URL"
                            rules={[{ required: true, type: "url", message: "Missing or invalid URL" }]}
                          >
                            <Input />
                          </Form.Item>
                          <div className="md:col-span-2">
                            <Form.Item
                              {...restField}
                              name={[name, "iconUrl"]}
                              label="Custom Icon Image (optional)"
                            >
                              <ImageUpload />
                            </Form.Item>
                          </div>
                        </div>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Social Link
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Panel>
          </Collapse>

          <Space className="mt-6 w-full justify-end">
            <Button type="primary" onClick={handleSave} loading={saving} size="large">
              Save changes
            </Button>
          </Space>
        </Form>
      </Card>
    </AdminLayout>
  );
}

export default ContactAdminPage;

export const getServerSideProps = withAdmin;
