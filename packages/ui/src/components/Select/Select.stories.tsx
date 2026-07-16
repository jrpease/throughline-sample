import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const options = (
  <>
    <option>Select option</option>
    <option>Apple</option>
    <option>Banana</option>
  </>
);

const meta = {
  title: "Components/Select",
  component: Select,
  // Docs page is provided by Select.mdx (rendered from the doc record); no autodocs.
  args: { children: options },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {(["sm", "md", "lg"] as const).map((s) => (
        <div key={s} style={{ width: 280 }}>
          <Select {...args} size={s} />
        </div>
      ))}
    </div>
  ),
};

export const Error: Story = { args: { error: true } };

export const Disabled: Story = { args: { disabled: true } };
