"use client";
import type { ComponentProps } from "react";
import {
  DialogContent as BaseContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Close } from "@/components/icons";
export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function DialogContent({
  children,
  ...props
}: ComponentProps<typeof BaseContent>) {
  return (
    <BaseContent {...props} showCloseButton={false}>
      {children}
      <DialogClose className="bao-close" aria-label="Close image">
        <Close size={20} />
      </DialogClose>
    </BaseContent>
  );
}
