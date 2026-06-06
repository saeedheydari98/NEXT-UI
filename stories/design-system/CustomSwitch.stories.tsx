import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import { CustomSwitch } from "../../app/design-system/components/ui/switch";

const meta = {
  title: "Design System/CustomSwitch",
  component: CustomSwitch,
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
    label: "Enable feature",
    variant: "primary",
    size: "md",
    rounded: "full",
    border: "base",
    shadow: "none",
    isLoading: false,
    loading: "spinner",
    loadingText: "Saving...",
  },
  render: (args) => {
    const [checked, setChecked] = React.useState(false);
    return <CustomSwitch {...args} checked={checked} onChange={setChecked} />;
  },
} satisfies Meta<typeof CustomSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground = {} as Story;
