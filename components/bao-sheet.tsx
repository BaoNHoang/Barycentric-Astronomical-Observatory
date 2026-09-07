"use client";
import type { ComponentProps } from "react";
import { SheetContent as BaseContent, SheetClose } from "@/components/ui/sheet";
import { Close } from "@/components/icons";
export {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

// Keep the supplied accessible dialog behavior; replace only the stock artwork.
export function SheetContent({
  children,
  ...props
}: ComponentProps<typeof BaseContent>) {
  return (
    <BaseContent {...props} showCloseButton={false}>
      {children}
      <SheetClose className="bao-close" aria-label="Close details">
        <Close size={20} />
      </SheetClose>
    </BaseContent>
  );
}
