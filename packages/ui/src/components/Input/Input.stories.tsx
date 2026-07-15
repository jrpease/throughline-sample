import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "lucide-react";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  // Docs page is provided by Input.mdx (rendered from the doc record); no autodocs.
  args: { placeholder: "Placeholder" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(["sm", "md", "lg"] as const).map((s) => (
        <div key={s} style={{ width: 280 }}>
          <Input {...args} size={s} placeholder={s} />
        </div>
      ))}
    </div>
  ),
};

export const WithIcon: Story = { args: { leadingIcon: Search } };

export const Error: Story = { args: { error: true } };

export const Disabled: Story = { args: { disabled: true } };
