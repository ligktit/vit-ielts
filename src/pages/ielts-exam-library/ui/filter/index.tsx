import {
  ConfigProvider,
  Input,
  Select,
  Tabs,
  TabsProps,
  Space,
  Button,
  InputRef,
} from "antd";
import { Controller, useFormContext } from "react-hook-form";
import { FilterFormValues } from "..";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import _ from "lodash";

const items: TabsProps["items"] = [
  {
    key: "all",
    label: "All Tests",
    icon: (
      <span className="material-symbols-rounded align-middle">checklist</span>
    ),
  },
  {
    key: "academic",
    label: "Academic Test",
    icon: <span className="material-symbols-rounded align-middle">school</span>,
  },
  {
    key: "general",
    label: "General Test",
    icon: <span className="material-symbols-rounded align-middle">groups</span>,
  },
];

export const Filter = () => {
  const router = useRouter();
  const { control, setValue, reset } = useFormContext<FilterFormValues>();
  const searchInputRef = useRef<InputRef>(null);

  useEffect(() => {
    const queryParams = _.merge(
      {
        type: "all",
        sort: "newest",
      },
      router.query
    );
    reset(queryParams as unknown as FilterFormValues);
  }, [reset, router.query]);

  const handleSearch = () => {
    if (searchInputRef.current) {
      setValue("search", searchInputRef.current.input?.value || "", {
        shouldDirty: true,
      });
    }
  };

  return (
    <>
      <Controller
        name="type"
        control={control}
        render={({ field: { onChange } }) => (
          <ConfigProvider
            theme={{
              components: {
                Tabs: {
                  horizontalMargin: "0px",
                },
              },
            }}
          >
            <Tabs
              defaultActiveKey={router.query.type?.toString() || "all"}
              items={items}
              size="large"
              onChange={onChange}
            />
          </ConfigProvider>
        )}
      />
      <div className="flex">
        <div className="w-1/2">
          <Space.Compact style={{ width: "100%" }}>
            <Input
              ref={searchInputRef}
              allowClear
              onClear={() => {
                setValue("search", "", { shouldDirty: true });
              }}
              defaultValue={router.query.search?.toString() || ""}
              placeholder="Search"
              onPressEnter={handleSearch}
            />
            <Button
              type="primary"
              icon={
                <span
                  className="material-symbols-rounded"
                  style={{ display: "flex" }}
                >
                  search
                </span>
              }
              style={{ display: "flex" }}
              onClick={handleSearch}
            />
          </Space.Compact>
        </div>
        <div className="w-1/2 flex justify-end">
          <Controller
            name="sort"
            control={control}
            render={({ field }) => (
              <Select
                className="min-w-32"
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "popular", label: "Popular" },
                  { value: "high-ranking", label: "High Ranking" },
                ]}
                {...field}
              />
            )}
          />
        </div>
      </div>
    </>
  );
};
