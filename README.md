# UI Forge

UI Forge is a powerful web-based design tool that allows users to rapidly generate, refine, and manage UI elements and entire web pages using AI. It provides a collaborative canvas where designers and developers can work together in real-time.

## Features

- **AI-Powered UI Generation**: Describe your desired UI with natural language prompts, and let the AI generate the initial design.
- **Real-time Collaboration**: See other users' cursors and project updates in real-time, fostering a seamless collaborative environment.
- **Component Library**: Save frequently used UI elements or sections as reusable components for quick access and consistent design across projects.
- **Design System Management**: Define and apply a consistent design system including colors, typography, spacing, and more.
- **Responsive Design Controls**: Easily switch between desktop, tablet, and mobile views to ensure your designs look great on any device.
- **Figma Integration**: Export generated UI elements as editable SVG for seamless integration into Figma workflows.
- **HTML Export**: Download the generated HTML code for easy integration into your web projects.
- **Refinement Capabilities**: Provide natural language feedback to the AI to refine and iterate on generated designs.
- **Annotations**: Add notes and comments directly on the canvas for clear communication and feedback.

## Getting Started

To get started with UI Forge, simply describe the website or UI you want to build in the sidebar's prompt input. The AI will generate a project with initial screens based on your description.

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd ui-forge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

Open your browser to `http://localhost:3000` to access UI Forge.

## Usage

- **New Project**: Use the sidebar to create a new project by providing a design brief.
- **Generate/Refine**: Enter prompts to generate new UI or refine existing screens.
- **Canvas Interaction**: Use the hand tool to pan, and the select tool to interact with screens. Use the text tool to add annotations.
- **Component Library**: Save and reuse components across your project.
- **Preview Mode**: Toggle the preview mode to interact with your generated UI as a live webpage.

## Contributing

We welcome contributions! Please see `CONTRIBUTING.md` for details.
