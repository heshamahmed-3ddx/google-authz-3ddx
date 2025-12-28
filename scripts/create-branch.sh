#!/bin/bash
# scripts/create-branch.sh
# Helper script to create standardized branch names

TYPE=$1
TICKET=$2
DESCRIPTION=$3

if [ -z "$TYPE" ] || [ -z "$TICKET" ] || [ -z "$DESCRIPTION" ]; then
  echo "❌ Error: Missing required arguments"
  echo ""
  echo "Usage: ./scripts/create-branch.sh <CR|BF> <ticket-number> <description>"
  echo ""
  echo "Branch Types:"
  echo "  CR = Change Request (features, enhancements)"
  echo "  BF = Bug Fix"
  echo ""
  echo "Examples:"
  echo "  ./scripts/create-branch.sh CR 5001 powerbi-integration"
  echo "  ./scripts/create-branch.sh BF 3002 fix-auth-timeout"
  echo "  ./scripts/create-branch.sh CR 7890 add-user-dashboard"
  echo ""
  exit 1
fi

# Validate type
if [[ ! "$TYPE" =~ ^(CR|BF)$ ]]; then
  echo "❌ Error: Type must be CR or BF"
  echo ""
  echo "  CR = Change Request (features/enhancements)"
  echo "  BF = Bug Fix"
  echo ""
  exit 1
fi

# Validate ticket is numeric
if ! [[ "$TICKET" =~ ^[0-9]+$ ]]; then
  echo "❌ Error: Ticket number must be numeric"
  echo ""
  echo "Example: 5001 (not CR-5001)"
  echo ""
  exit 1
fi

# Clean description (lowercase, replace spaces with hyphens)
DESCRIPTION=$(echo "$DESCRIPTION" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# Create branch name
BRANCH_NAME="${TYPE}-${TICKET}-${DESCRIPTION}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌿 Creating new branch"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Branch name: $BRANCH_NAME"
echo "Type: $TYPE ($([ "$TYPE" == "CR" ] && echo "Change Request" || echo "Bug Fix"))"
echo "Ticket: $TICKET"
echo "Description: $DESCRIPTION"
echo ""

# Confirm with user
read -p "Create this branch? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 1
fi

# Ensure we're on develop or main
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
if [[ ! "$CURRENT_BRANCH" =~ ^(main|develop)$ ]]; then
  echo "⚠️  Warning: Currently on branch '$CURRENT_BRANCH'"
  echo "It's recommended to create branches from 'develop' or 'main'"
  echo ""
  read -p "Switch to 'develop' first? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git checkout develop
    git pull origin develop
  fi
fi

# Create and checkout branch
echo ""
echo "🔨 Creating branch..."
if git checkout -b "$BRANCH_NAME"; then
  echo "✅ Branch created and checked out successfully"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 Next Steps:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "1. 💻 Make your changes"
  echo ""
  echo "2. 📝 Commit with conventional format:"
  if [ "$TYPE" == "CR" ]; then
    echo "   git commit -m \"feat(<scope>): <description>"
    echo ""
    echo "   <body>"
    echo ""
    echo "   ${TYPE}-${TICKET}\""
  else
    echo "   git commit -m \"fix(<scope>): <description>"
    echo ""
    echo "   <body>"
    echo ""
    echo "   ${TYPE}-${TICKET}\""
  fi
  echo ""
  echo "3. ⬆️  Push to remote:"
  echo "   git push origin $BRANCH_NAME"
  echo ""
  echo "4. 🔀 Create Pull Request on GitHub"
  echo "   Title: [${TYPE}-${TICKET}] <PR Title>"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo "❌ Failed to create branch"
  exit 1
fi
