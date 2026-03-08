import { useAuth } from "@/appx/providers";
import { Avatar } from "@/entities";
import { ROUTES } from "@/shared/routes";
import { Button, Input } from "antd";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

type FormValues = {
  content: string;
};

export function NewComment() {
  const { isSignedIn, currentUser } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<FormValues>();

  return (
    <>
      {isSignedIn ? (
        <form
          onSubmit={handleSubmit((data) => console.log(data))}
          className="py-3 flex items-start gap-4"
        >
          <Avatar size={50} currentUser={currentUser} />
          <div className="flex-auto relative">
            <Controller
              name="content"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input.TextArea
                  rows={4}
                  placeholder="Write a comment"
                  className="bg-gray-50 resize-none"
                  {...field}
                />
              )}
            />
            <div className="absolute bottom-2 right-2">
              <Button
                type="primary"
                disabled={!isValid || !isDirty}
                htmlType="submit"
              >
                Post
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-5 px-2">
          <h5 className="text-base">
            You must be <Link href={ROUTES.LOGIN()}>signed in</Link> to comment
          </h5>
        </div>
      )}
    </>
  );
}
