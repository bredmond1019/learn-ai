#!/bin/bash

echo "Installing Jest and testing dependencies..."

# Core Jest packages
npm install --save-dev jest@latest
npm install --save-dev @types/jest@latest
npm install --save-dev jest-environment-jsdom@latest

# Testing Library packages
npm install --save-dev @testing-library/react@latest
npm install --save-dev @testing-library/jest-dom@latest
npm install --save-dev @testing-library/user-event@latest

# Additional helpful packages
npm install --save-dev babel-jest@latest
npm install --save-dev identity-obj-proxy@latest

echo "Installation complete!"