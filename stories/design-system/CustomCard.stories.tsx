import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CustomCard } from "../../app/design-system/components/ui/card";

const meta = {
  title: "Design System/CustomCard",
  component: CustomCard,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "neutral"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"] },
    rounded: { control: "select", options: ["none", "sm", "md", "lg", "xl", "full"] },
    border: { control: "select", options: ["none", "base", "border-b", "subtle", "strong", "heavy", "dashed", "dotted"] },
    shadow: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },
    hover: { control: "select", options: ["none", "scale", "lift", "darken", "drken"] },
    loading: { control: "select", options: ["spinner", "ring", "dots", "pulse", "bars", "skeleton", "skeleton-block"] },
    isLoading: { control: "boolean" },
    loadingText: { control: "text" },
  },
  args: {
    title: "Card Title",
    variant: "primary",
    size: "md",
    rounded: "lg",
    border: "base",
    shadow: "sm",
    hover: "none",
    isLoading: false,
    loading: "spinner",
    loadingText: "Loading card...",
    children: "This is a custom card component.",
  },
} satisfies Meta<typeof CustomCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground = {} as Story;
