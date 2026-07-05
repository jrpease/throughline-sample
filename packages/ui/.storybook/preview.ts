import type { Preview } from "@storybook/react";
import "../src/styles/index.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0A0A0A" },
        { name: "light", value: "#FFFFFF" },
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
