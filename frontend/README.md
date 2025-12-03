# Frontend - KPI Reports Application

Frontend application for the KPI Reports system built with React and Recharts.

## Features

- Interactive dashboard for KPI visualization
- CSV/Excel file upload functionality
- Real-time data visualization using Recharts
- Line and Bar charts for KPI analysis
- Responsive design
- Integration with backend API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API endpoint:
The application connects to the backend API at `http://localhost:5000`. If your backend runs on a different port, update the API URL in `src/App.js`.

## Running the Application

### Development mode:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Build for production:
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Run tests:
```bash
npm test
```

## Usage

1. Start the backend server first (see backend README)
2. Start the frontend application
3. Upload a CSV or Excel file using the upload section
4. View the processed data in the charts below

## CSV/Excel File Format

The application can process CSV and Excel files. For best results, ensure your file has:
- A header row with column names
- Numeric data for chart visualization
- Column names that match the chart data keys (e.g., 'name', 'KPI1', 'KPI2')

Example format:
```csv
name,KPI1,KPI2
January,400,240
February,300,139
March,200,980
```

## Dependencies

- **react** - UI library
- **recharts** - Chart library for React
- **axios** - HTTP client for API requests
- **react-scripts** - Build tooling

## Technologies

- React 18
- Recharts for data visualization
- Axios for HTTP requests
- CSS3 for styling

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
