import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";

const meta = {
  title: "Components/Card",
  component: Card,
  // Docs page is provided by Card.mdx (rendered from the doc record); no autodocs.
  args: { variant: "default" },
  argTypes: {
    variant: { control: "select", options: ["default", "elevated"] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const CardDemo = (args: React.ComponentProps<typeof Card>) => (
  <Card {...args} style={{ width: 360 }}>
    <CardHeader>
      <Avatar initials="JP" />
      <div className="flex flex-col">
        <CardTitle>Card title</CardTitle>
        <CardDescription>Supporting text</CardDescription>
      </div>
    </CardHeader>
    <CardContent>
      Compose this card with your own content. Drop in any subcomponents to build
      the layout you need.
    </CardContent>
    <CardFooter>
      <Button>Action</Button>
    </CardFooter>
  </Card>
);

export const Default: Story = {
  render: (args) => <CardDemo {...args} />,
};

export const Elevated: Story = {
  args: { variant: "elevated" },
  render: (args) => <CardDemo {...args} />,
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <CardDemo variant="default" />
      <CardDemo variant="elevated" />
    </div>
  ),
};
