#!/bin/bash
# This script deploys the app to all environments

# Exit on error
set -e

# Function to print in color
print_colored() {
  local color=$1
  local message=$2
  case $color in
    "green") echo -e "\033[0;32m$message\033[0m" ;;
    "yellow") echo -e "\033[0;33m$message\033[0m" ;;
    "red") echo -e "\033[0;31m$message\033[0m" ;;
    *) echo "$message" ;;
  esac
}

# Deploy to test environment
deploy_test() {
  print_colored "yellow" "🚀 Deploying to TEST environment..."
  npm run build:test
  npm run deploy:test
  print_colored "green" "✅ TEST deployment completed successfully"
}

# Deploy to production environment
deploy_prod() {
  print_colored "yellow" "🚀 Deploying to PRODUCTION environment..."
  npm run build:prod
  npm run deploy:prod
  print_colored "green" "✅ PRODUCTION deployment completed successfully"
}

# Deploy to GitHub Pages
deploy_gh_pages() {
  print_colored "yellow" "🚀 Deploying to GitHub Pages..."
  npm run deploy
  print_colored "green" "✅ GitHub Pages deployment completed successfully"
}

# Main execution
print_colored "green" "📦 Starting deployment process..."

# Check command line arguments
if [ "$1" == "test" ]; then
  deploy_test
elif [ "$1" == "prod" ]; then
  deploy_prod
elif [ "$1" == "gh-pages" ]; then
  deploy_gh_pages
elif [ "$1" == "all" ]; then
  deploy_test
  deploy_prod
  deploy_gh_pages
else
  print_colored "yellow" "Usage: ./deploy-all.sh [test|prod|gh-pages|all]"
  print_colored "yellow" "- test: Deploy to test environment only"
  print_colored "yellow" "- prod: Deploy to production environment only"
  print_colored "yellow" "- gh-pages: Deploy to GitHub Pages only"
  print_colored "yellow" "- all: Deploy to all environments"
  exit 1
fi

print_colored "green" "🎉 All deployments have completed successfully!"