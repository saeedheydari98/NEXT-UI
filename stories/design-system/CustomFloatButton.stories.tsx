import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import { fn } from "storybook/test";
import { FloatButton } from "../../app/design-system/components/ui/float-button";

type StoryArgs = ComponentProps<typeof FloatButton> & {
  icon?: boolean;
  iconAfter?: boolean;
};

const meta = {
  title: "Design System/FloatButton",
  component: FloatButton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "neutral"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"] },
    rounded: { control: "select", options: ["none", "sm", "md", "lg", "xl", "full"] },
    border: { control: "select", options: ["none", "base", "border-b", "subtle", "strong", "heavy", "dashed", "dotted"] },
    shadow: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },
    hover: { control: "select", options: ["none", "scale", "lift", "darken", "drken"] },
    cursor: { control: "select", options: ["none", "pointer", "notAllowed"] },
    position: { control: "select", options: ["bottom-right", "bottom-left"] },
    loading: { control: "select", options: ["spinner", "ring", "dots", "pulse", "bars", "skeleton", "skeleton-block"] },
    isLoading: { control: "boolean" },
    loadingText: { control: "text" },
    icon: { control: "boolean" },
    iconAfter: { control: "boolean" },
  },
  args: {
    label: "Create",
    variant: "primary",
    size: "md",
    rounded: "full",
    border: "base",
    shadow: "lg",
    hover: "lift",
    cursor: "pointer",
    position: "bottom-right",
    isLoading: false,
    loading: "spinner",
    loadingText: "Creating...",
    icon: true,
    iconAfter: false,
    onClick: fn(),
  },
  render: ({ icon, iconAfter, ...args }) => (
    <div className="relative h-28 overflow-visible p-4">
      <FloatButton
        {...args}
        className="!absolute !bottom-4"
        icon={icon ? <FaPlus /> : null}
        iconAfter={iconAfter ? <FaArrowRight /> : undefined}
      />
    </div>
  ),
  parameters: {
    layout: "padded",
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground = {} as Story;
