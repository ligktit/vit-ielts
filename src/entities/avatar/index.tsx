import { MasterData } from "@/appx/providers";
import { Avatar as BaseAvatar } from "antd";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const Avatar = ({
  currentUser,
  ...props
}: ComponentProps<typeof BaseAvatar> & {
  currentUser: MasterData["viewer"];
}) => {
  const { className, ...rest } = props;
  return (
    <BaseAvatar
      className={twMerge("bg-yellow-300! text-black!", className)}
      src={currentUser?.userData.avatar?.node?.mediaDetails.sizes[0].sourceUrl}
      alt={currentUser?.name}
      {...rest}
    >
      {currentUser?.name.at(0)}
    </BaseAvatar>
  );
};
