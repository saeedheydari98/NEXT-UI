import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { CustomButton } from "../../app/design-system/components/ui/button";
import { CustomModal } from "../../app/design-system/components/ui/modal";

const meta = {
  title: "Design System/CustomModal",
  component: CustomModal,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "neutral"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"] },
    rounded: { control: "select", options: ["none", "sm", "md", "lg", "xl", "full"] },
    border: { control: "select", options: ["none", "base", "border-b", "subtle", "strong", "heavy", "dashed", "dotted"] },
    shadow: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },
    loading: { control: "select", options: ["spinner", "ring", "dots", "pulse", "bars", "skeleton", "skeleton-block"] },
    isLoading: { control: "boolean" },
    loadingText: { control: "text" },
  },
  args: {
    title: "Confirm Action",
    variant: "primary",
    size: "md",
    rounded: "lg",
    border: "base",
    shadow: "lg",
    closeText: "Close",
    isLoading: false,
    loading: "spinner",
    loadingText: "Loading modal...",
  },
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <div>
        <CustomButton onClick={() => setOpen(true)}>Open Modal</CustomButton>
        <CustomModal {...args} open={open} onClose={() => setOpen(false)}>
          Modal body content. You can put forms or details here.
        </CustomModal>
      </div>
    );
  },
} satisfies Meta<typeof CustomModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground = {} as Story;
