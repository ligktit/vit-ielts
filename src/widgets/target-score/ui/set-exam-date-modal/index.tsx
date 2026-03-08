import { DatePicker, Modal } from "antd";
import React, { ComponentProps, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useWidgetContext } from "../../context";
import { UPDATE_EXAM_DATE } from "../../api";
import { useAuth } from "@/appx/providers";
import dayjs, { Dayjs } from "dayjs";
import { useMutation } from "@/shared/graphql/compat";

type FormData = {
  examDate: Dayjs;
};

export const SetExamDateModal = ({
  ...props
}: ComponentProps<typeof Modal>) => {
  const {
    targetScore: { examDate },
    refetch,
  } = useWidgetContext();
  const { currentUser } = useAuth();
  const { control, getValues, reset, setValue } = useForm<FormData>();
  const [updateExamDate, { loading }] = useMutation<
    { updateUserTargetScore: { clientMutationId: string } },
    { id: string; examDate: string }
  >(UPDATE_EXAM_DATE, {
    context: {
      authRequired: true,
    },
  });

  useEffect(() => {
    reset();
  }, [props.open, reset]);

  const handleOk = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const ISODate = getValues("examDate").add(1, "day").toISOString();

    await updateExamDate({
      variables: {
        id: currentUser!.id,
        examDate: ISODate,
      },
    });

    refetch();
    props.onOk?.(e);
  };

  useEffect(() => {
    if (examDate) {
      setValue("examDate", dayjs(examDate));
    }
  }, [props.open, setValue, examDate]);

  return (
    <Modal
      {...props}
      onOk={handleOk}
      confirmLoading={loading || props.confirmLoading}
    >
      <div className="space-y-4 py-4">
        <h2 className="text-center text-xl md:text-3xl font-bold font-nunito">
          Exam Date
        </h2>
        <form className="flex -m-2 flex-wrap">
          <div className="p-2 w-full space-y-1">
            <Controller
              name="examDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  format={"DD/MM/YYYY"}
                  className="w-full"
                  minDate={dayjs()}
                  size="large"
                  {...field}
                />
              )}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};
