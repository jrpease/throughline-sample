import type { Meta, StoryObj } from "@storybook/react";
import { Check } from "lucide-react";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  // Docs page is provided by Badge.mdx (rendered from the doc record); no autodocs.
  args: { children: "Badge", variant: "default" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {(["default", "secondary", "destructive", "outline"] as const).map((v) => (
        <Badge key={v} {...args} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  ),
};

export const WithIcon: Story = { args: { leadingIcon: Check } };
