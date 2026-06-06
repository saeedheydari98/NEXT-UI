import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";
import { FaRegStar } from "react-icons/fa";
import { CustomTag } from "../../app/design-system/components/ui/tag";

type StoryArgs = ComponentProps<typeof CustomTag> & {
  icon?: boolean;
  iconAfter?: boolean;
};

const meta = {
  title: "Design System/CustomTag",
  component: CustomTag,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "neutral"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"] },
    rounded: { control: "select", options: ["none", "sm", "md", "lg", "xl", "full"] },
    border: { control: "select", options: ["none", "base", "border-b", "subtle", "strong", "heavy", "dashed", "dotted"] },
    shadow: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },
    icon: { control: "boolean" },
    iconAfter: { control: "boolean" },
  },
  args: {
    children: "Status",
    variant: "primary",
    size: "md",
    rounded: "md",
    border: "none",
    shadow: "none",
    icon: true,
    iconAfter: false,
  },
  render: ({ icon, iconAfter, ...args }) => (
    <CustomTag
      {...args}
      icon={icon ? <FaRegStar /> : undefined}
      iconAfter={iconAfter ? <FaRegStar /> : undefined}
    />
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground = {} as Story;
