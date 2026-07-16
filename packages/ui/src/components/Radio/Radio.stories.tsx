import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Radio, RadioGroup } from "./Radio";

const meta = {
  title: "Components/Radio",
  component: RadioGroup,
  // Docs page is provided by Radio.mdx (rendered from the doc record); no autodocs.
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState("apple");
    return (
      <RadioGroup value={value} onValueChange={setValue} name="fruit">
        <Radio value="apple" label="Apple" />
        <Radio value="banana" label="Banana" />
        <Radio value="cherry" label="Cherry" />
      </RadioGroup>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = React.useState("apple");
    return (
      <RadioGroup value={value} onValueChange={setValue} name="fruit" disabled>
        <Radio value="apple" label="Apple" />
        <Radio value="banana" label="Banana" />
        <Radio value="cherry" label="Cherry" />
      </RadioGroup>
    );
  },
};
