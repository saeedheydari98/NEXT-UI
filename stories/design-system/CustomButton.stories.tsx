import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";
import { FaRegStar } from "react-icons/fa";
import { fn } from "storybook/test";
import { CustomButton } from "../../app/design-system/components/ui/button";

type StoryArgs = ComponentProps<typeof CustomButton> & {
  icon?: boolean;
  iconAfter?: boolean;
};

const meta = {
  title: "Design System/CustomButton",
  component: CustomButton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "neutral"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"] },
    hover: { control: "select", options: ["none", "scale", "lift", "darken", "drken"] },
    rounded: { control: "select", options: ["none", "sm", "md", "lg", "xl", "full"] },
    border: { control: "select", options: ["none", "base", "border-b", "subtle", "strong", "heavy", "dashed", "dotted"] },
    shadow: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },
    loading: { control: "select", options: ["spinner", "ring", "dots", "pulse", "bars", "skeleton", "skeleton-block"] },
    isLoading: { control: "boolean" },
    loadingText: { control: "text" },
    icon: { control: "boolean" },
    iconAfter: { control: "boolean" },
  },
  args: {
    children: "Click me",
    variant: "primary",
    size: "md",
    hover: "scale",
    rounded: "md",
    border: "none",
    shadow: "none",
    isLoading: false,
    loading: "spinner",
    loadingText: "Loading...",
    icon: true,
    iconAfter: false,
    onClick: fn(),
  },
  render: ({ icon, iconAfter, ...args }) => (
    <CustomButton
      {...args}
      icon={icon ? <FaRegStar /> : undefined}
      iconAfter={iconAfter ? <FaRegStar /> : undefined}
    />
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground = {} as Story;
