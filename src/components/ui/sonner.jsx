import React from "react";
import { Toaster as Sonner } from "sonner";
import { IconCircleCheck, IconInfoCircle, IconAlertTriangle, IconAlertOctagon, IconLoader } from "@tabler/icons-react"

const Toaster = ({
  theme = "system",
  ...props
}) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <IconCircleCheck className="size-4" />
        ),
        info: (
          <IconInfoCircle className="size-4" />
        ),
        warning: (
          <IconAlertTriangle className="size-4" />
        ),
        error: (
          <IconAlertOctagon className="size-4" />
        ),
        loading: (
          <IconLoader className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--panel-2)",
          "--normal-text": "var(--bone)",
          "--normal-border": "rgba(242, 169, 59, 0.3)",
          "--border-radius": "2px"
        }
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props} />
  );
}

export { Toaster }
