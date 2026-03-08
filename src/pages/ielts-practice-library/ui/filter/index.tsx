import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Divider,
  Drawer,
  Input,
  Space,
  InputRef,
} from "antd";
import { Controller, useForm, useFormContext } from "react-hook-form";
import { FilterFormValues } from "..";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import _ from "lodash";
import { QUESTION_FORMS } from "@/shared/constants";

const FILTER_CONFIGS = {
  quarters: [
    { slug: "Q1", name: "Quarter 1 T1-T4" },
    { slug: "Q2", name: "Quarter 2 T5-T8" },
    { slug: "Q3", name: "Quarter 3 T9-T12" },
  ],
  listeningParts: [
    { slug: "0", name: "Part 1" },
    { slug: "1", name: "Part 2" },
    { slug: "2", name: "Part 3" },
    { slug: "3", name: "Part 4" },
  ],
  readingPassages: [
    { slug: "0", name: "Passage 1" },
    { slug: "1", name: "Passage 2" },
    { slug: "2", name: "Passage 3" },
  ],
};

export const Filter = ({
  drawerOpen,
  setDrawerOpen,
  filterData,
}: {
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  filterData: {
    years: Array<string>;
    sources: Array<string>;
    parts: Array<string>;
  };
}) => {
  const router = useRouter();
  const { control, setValue, reset } = useFormContext<FilterFormValues>();
  const mobileForm = useForm<FilterFormValues>();
  const skill = useMemo(() => router.pathname.split("/").pop(), [router]);
  const searchInputRef = useRef<InputRef>(null);

  const { control: mobileControl, getValues, reset: mobileReset } = mobileForm;

  const handleSearch = () => {
    if (searchInputRef.current) {
      setValue("search", searchInputRef.current.input?.value || "", {
        shouldDirty: true,
      });
    }
  };

  useEffect(() => {
    const queryParams = _.merge(
      {
        type: "all",
        sort: "newest",
      },
      router.query
    );
    reset(queryParams as unknown as FilterFormValues);
    mobileReset(queryParams as unknown as FilterFormValues);
  }, [mobileReset, reset, router.query]);

  return (
    <>
      <ConfigProvider
        theme={{
          components: {
            Card: {
              bodyPadding: 16,
            },
            Checkbox: {
              fontSize: 16,
              lineHeight: 1,
            },
          },
        }}
      >
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg md:text-xl font-bold mb-5">Search</h3>
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
                onClick={handleSearch}
              />
            </Space.Compact>
          </Card>
          {filterData.sources.length > 0 && (
            <Card>
              <h3 className="text-lg md:text-xl font-bold mb-5">Source</h3>
              <div className="flex flex-col gap-4">
                {filterData.sources.map((item, index) => (
                  <Controller
                    key={index}
                    name="source"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Checkbox
                        checked={value === item}
                        onChange={(e) => {
                          onChange(e.target.checked ? item : "");
                        }}
                      >
                        {item}
                      </Checkbox>
                    )}
                  />
                ))}
              </div>
            </Card>
          )}
          <Card>
            <h3 className="text-lg md:text-xl font-bold mb-5">
              {skill === "reading" ? "Reading Passage" : "Listening Part"}
            </h3>
            <div className="flex flex-col gap-4">
              {(skill === "reading"
                ? FILTER_CONFIGS.readingPassages
                : FILTER_CONFIGS.listeningParts
              ).map((item, index) => (
                <Controller
                  key={index}
                  name="part"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value === item.slug}
                      onChange={(e) => {
                        onChange(e.target.checked ? item.slug : "");
                      }}
                    >
                      {item.name}
                    </Checkbox>
                  )}
                />
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-lg md:text-xl font-bold mb-5">Status</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Pending", value: "pending" },
                { label: "In Progress", value: "in-progress" },
                { label: "Completed", value: "completed" },
              ].map((item) => (
                <Controller
                  key={item.value}
                  name="progress"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value === item.value}
                      onChange={(e) => {
                        onChange(e.target.checked ? item.value : "");
                      }}
                    >
                      {item.label}
                    </Checkbox>
                  )}
                />
              ))}
            </div>
          </Card>
          {/* <Card>
            <h3 className="text-lg md:text-xl font-bold mb-5">Quarter</h3>
            <div className="flex flex-col gap-4">
              {FILTER_CONFIGS.quarters.map((item, index) => (
                <Controller
                  key={index}
                  name="quarter"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value === item.slug}
                      onChange={(e) => {
                        onChange(e.target.checked ? item.slug : "");
                      }}
                    >
                      {item.name}
                    </Checkbox>
                  )}
                />
              ))}
            </div>
          </Card> */}

          {/* {filterData.years.length > 0 && (
            <Card>
              <h3 className="text-lg md:text-xl font-bold mb-5">Year</h3>
              <div className="flex flex-col gap-4">
                {filterData.years.map((item, index) => (
                  <Controller
                    key={index}
                    name="year"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Checkbox
                        checked={value === item}
                        onChange={(e) => {
                          onChange(e.target.checked ? item : "");
                        }}
                      >
                        {item}
                      </Checkbox>
                    )}
                  />
                ))}
              </div>
            </Card>
          )} */}

          <Card>
            <h3 className="text-lg md:text-xl font-bold mb-5">Question Form</h3>
            <div className="flex flex-col gap-4">
              <Controller
                name="question_form"
                control={control}
                render={({ field: { onChange } }) => (
                  <Checkbox.Group
                    className="gap-4"
                    options={[...QUESTION_FORMS]}
                    defaultValue={(router.query.question_form || "")
                      .toString()
                      .split(",")}
                    onChange={onChange}
                  />
                )}
              />
            </div>
          </Card>
        </div>
      </ConfigProvider>
      <Drawer
        title="Filter"
        open={drawerOpen}
        closeIcon={false}
        footer={
          <div className="flex gap-4">
            <div className="w-1/2">
              <Button
                type="primary"
                size="large"
                block
                onClick={() => {
                  Object.keys(getValues()).forEach((key) => {
                    const value = getValues()[key as keyof FilterFormValues];
                    setValue(key as keyof FilterFormValues, value, {
                      shouldDirty: true,
                    });
                  });
                  setDrawerOpen(false);
                }}
              >
                <span className="text-sm">Apply</span>
              </Button>
            </div>
            <div className="w-1/2">
              <Button
                block
                size="large"
                onClick={() => {
                  setDrawerOpen(false);
                }}
              >
                <span className="text-sm">Cancel</span>
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-5">Question Form</h3>
            <div className="flex flex-col gap-4">
              <Controller
                name="question_form"
                control={mobileControl}
                render={({ field: { onChange } }) => (
                  <Checkbox.Group
                    className="gap-4 flex flex-col"
                    options={[...QUESTION_FORMS]}
                    defaultValue={(router.query.question_form || "")
                      .toString()
                      .split(",")}
                    onChange={onChange}
                  />
                )}
              />
            </div>
          </div>
          <Divider />
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-5">Status</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Pending", value: "pending" },
                { label: "In Progress", value: "in-progress" },
                { label: "Completed", value: "completed" },
              ].map((item) => (
                <Controller
                  key={item.value}
                  name="progress"
                  control={mobileControl}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value === item.value}
                      onChange={() => {
                        onChange(item.value);
                      }}
                    >
                      {item.label}
                    </Checkbox>
                  )}
                />
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-5">Quarter</h3>
            <div className="flex flex-col gap-4">
              {FILTER_CONFIGS.quarters.map((item, index) => (
                <Controller
                  key={index}
                  name="quarter"
                  control={mobileControl}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value === item.slug}
                      onChange={(e) => {
                        onChange(e.target.checked ? item.slug : "");
                      }}
                    >
                      {item.name}
                    </Checkbox>
                  )}
                />
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-5">
              {skill === "reading" ? "Reading Passage" : "Listening Part"}
            </h3>
            <div className="flex flex-col gap-4">
              {(skill === "reading"
                ? FILTER_CONFIGS.readingPassages
                : FILTER_CONFIGS.listeningParts
              ).map((item, index) => (
                <Controller
                  key={index}
                  name="part"
                  control={mobileControl}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value === item.slug}
                      onChange={(e) => {
                        onChange(e.target.checked ? item.slug : "");
                      }}
                    >
                      {item.name}
                    </Checkbox>
                  )}
                />
              ))}
            </div>
          </div>
          {filterData.years.length > 0 && (
            <>
              <Divider />
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-5">Year</h3>
                <div className="flex flex-col gap-4">
                  {filterData.years.map((item, index) => (
                    <Controller
                      key={index}
                      name="year"
                      control={mobileControl}
                      render={({ field: { onChange, value } }) => (
                        <Checkbox
                          checked={value === item}
                          onChange={(e) => {
                            onChange(e.target.checked ? item : "");
                          }}
                        >
                          {item}
                        </Checkbox>
                      )}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
          {filterData.sources.length > 0 && (
            <>
              <Divider />
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-5">Source</h3>
                <div className="flex flex-col gap-4">
                  {filterData.sources.map((item, index) => (
                    <Controller
                      key={index}
                      name="source"
                      control={mobileControl}
                      render={({ field: { onChange, value } }) => (
                        <Checkbox
                          checked={value === item}
                          onChange={(e) => {
                            onChange(e.target.checked ? item : "");
                          }}
                        >
                          {item}
                        </Checkbox>
                      )}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};
