# What Can I Buy? - Shell Spending Optimizer

A Next.js application that helps you optimize your shell spending by calculating the best combination of products within your budget.

## 🚀 Features

### Core Functionality

-   **Smart Purchase Optimization**: Choose between maximizing value or quantity
-   **Flexible Filtering**: Exclude credits, badges, lottery tickets or allow duplicates
-   **Real-time Calculations**: Fast API-powered optimization algorithms
-   **Budget Management**: Set shell limits and product quantity constraints
-   **Smart Product Exclusion**: Search-based autocomplete for excluding specific items

### Performance & UX Optimizations

-   **💾 Auto-save Preferences**: Form data persists in localStorage
-   **🎨 Skeleton Loading**: Smooth loading states with custom skeleton components
-   **📱 Responsive Design**: Tailwind CSS with mobile-first approach
-   **🖼️ Optimized Images**: Next.js Image component with lazy loading
-   **🔍 Dynamic Search**: Real-time product search with autocomplete

### Security & Privacy

-   **🛡️ Environment-Based Configuration**: Sensitive data stored in environment variables
-   **🔐 Query-Based Access**: Products only revealed through specific search queries
-   **⚡ Minimal Data Transfer**: Only necessary data sent to client

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

# Set up environment variables
cp .env.example .env.local
# Add your product data to .env.local: DATA={"your":"json","data":"here"}

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
│   ├── page.tsx                # Server component (main entry)
│   ├── ClientHome.tsx          # Client-side interactive component
│   └── api/                    # API routes
│       └── v1/
│           ├── general/        # General endpoint
│           │   └── route.ts
│           ├── products/       # Product-related endpoints
│           │   ├── route.ts    # Product existence check
│           │   └── search/     # Product search endpoint
│           │       └── route.ts
│           └── wcib/           # Optimization endpoint
│               └── route.ts
├── components/
│   ├── Footer.tsx              # Footer component
│   └── Skeleton.tsx            # Loading skeleton components
├── lib/
│   ├── hooks.ts                # Custom performance hooks
│   └── products.ts             # Secure product data management
└── scripts/
    ├── extractProducts.js      # Product data extraction utility
    └── shop.html               # Source HTML for extraction
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
    - Exclude specific items using search-based autocomplete
4. **Calculate**: Get optimized product recommendations
5. **Review Results**: See total value, item count, and efficiency metrics
6. **Adjust & Recalculate**: Modify inputs and preferences as needed

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
# Product data (JSON format)
DATA={"your":"product","data":"here"}
```

### Data Source

You can populate your product data by:

1. Using the included extraction script: `node scripts/extractProducts.js`
2. Manually formatting your product catalog as JSON
3. Integrating with external APIs or databases

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
