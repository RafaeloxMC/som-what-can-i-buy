# What Can I Buy? - Shell Spending Optimizer

A Next.js application that helps you optimize your shell spending by calculating the best combination of products within your budget.

## 🚀 Features

### Core Functionality

-   **Smart Purchase Optimization**: Choose between maximizing value or quantity
-   **Flexible Filtering**: Exclude credits, badges, lottery tickets or allow duplicates
-   **Real-time Calculations**: Fast API-powered optimization algorithms
-   **Budget Management**: Set shell limits and product quantity constraints

### Performance & UX Optimizations

-   **💾 Auto-save Preferences**: Form data persists in localStorage
-   **🎨 Skeleton Loading**: Smooth loading states with custom skeleton components
-   **📱 Responsive Design**: Tailwind CSS with mobile-first approach
-   **🖼️ Optimized Images**: Next.js Image component with lazy loading

## 🛠️ Getting Started

### Prerequisites

-   Node.js and npm/yarn/pnpm or whatever package manager you like
-   Browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/RafaeloxMC/som-what-can-i-buy.git
cd som-what-can-i-buy

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture

### Project Structure

```
src/
├── app/
│   ├── globals.css             # Global styles
│   ├── favicon.ico             # Favicon
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main application component
│   └── api/                    # API routes
│       └── v1/
│           │── general/        # General endpoint
│           │   └── route.ts
│           └── wcib/           # Optimization endpoint
│               └── route.ts
├── components/
│   ├── Footer.tsx              # Footer component
│   └── Skeleton.tsx            # Loading skeleton components
└── lib/
    ├── hooks.ts                # Custom performance hooks
    ├── products.ts             # Product data management
    └── data/
        └── products.json       # Product catalog

```

## 🎯 Usage

1. **Enter Available Shells**: Input your shell budget
2. **Choose Strategy**:
    - _Maximize Value_: Get the highest-value items within budget
    - _Maximize Quantity_: Get the most items possible for your shells
3. **Set Preferences**:
    - Allow duplicate items
    - Exclude credit purchases
    - Exclude badge purchases
    - Exclude lottery tickets
    - Exclude any specific items by name
4. **Calculate**: Get optimized product recommendations
5. **Review Results**: See total value, item count, and efficiency metrics
6. **Adjust & Recalculate**: Modify inputs and preferences as needed

## 🏃‍♂️ Build & Deploy

```bash
# Run linting
npm run lint

# Create production build
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please make sure that pull requests have the same coding style and design as the rest of the project.
