import type { Meta, StoryObj } from "@storybook/react";
import { SelectMenu, SelectMenuItem } from "./SelectMenu";

/**
 * Stories for the Select Menu — the popover list of options that pairs with the
 * Select trigger. `SelectMenu` is the surface; `SelectMenuItem` is one row.
 */
const meta = {
  title: "Components/Select Menu",
  component: SelectMenu,
  // Docs page is provided by SelectMenu.mdx (rendered from the doc record); no autodocs.
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SelectMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default open menu: a list of options with one selected. */
export const Default: Story = {
  render: () => (
    <SelectMenu>
      <SelectMenuItem>Apple</SelectMenuItem>
      <SelectMenuItem selected>Banana</SelectMenuItem>
      <SelectMenuItem>Cherry</SelectMenuItem>
      <SelectMenuItem>Date</SelectMenuItem>
    </SelectMenu>
  ),
};

/** A menu containing a disabled option that can't be chosen. */
export const WithDisabledItem: Story = {
  render: () => (
    <SelectMenu>
      <SelectMenuItem>Apple</SelectMenuItem>
      <SelectMenuItem>Banana</SelectMenuItem>
      <SelectMenuItem disabled>Cherry (out of stock)</SelectMenuItem>
      <SelectMenuItem selected>Date</SelectMenuItem>
    </SelectMenu>
  ),
};

/**
 * Every item state side by side. Hover and focus are interaction states —
 * hover an item or tab to it in the canvas to see them; the static states
 * (default, selected, disabled) are shown here.
 */
export const ItemStates: Story = {
  name: "Item states",
  render: () => (
    <SelectMenu>
      <SelectMenuItem>Default</SelectMenuItem>
      <SelectMenuItem selected>Selected</SelectMenuItem>
      <SelectMenuItem disabled>Disabled</SelectMenuItem>
    </SelectMenu>
  ),
};

/**
 * A single item in isolation, with `selected` and `disabled` wired to controls.
 */
export const Item: StoryObj<typeof SelectMenuItem> = {
  render: (args) => (
    <SelectMenu>
      <SelectMenuItem {...args}>Menu item</SelectMenuItem>
    </SelectMenu>
  ),
  args: { selected: false, disabled: false },
  argTypes: {
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
