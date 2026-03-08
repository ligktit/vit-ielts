import { Button } from "antd";
import { ComponentProps, forwardRef } from "react";

const MyButton: React.ForwardRefRenderFunction<
  HTMLAnchorElement,
  ComponentProps<typeof Button>
> = ({ onClick, href, children, ...props }, ref) => {
  return (
    <Button {...props} href={href} onClick={onClick} ref={ref}>
      {children}
    </Button>
  );
};

export const LinkButton = forwardRef(MyButton);
