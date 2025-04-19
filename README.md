# Pet Testing Website

A professional website for pet personality testing and product recommendations.

## Deployment Status
Last deployed: $(date)

## Features

- Pet Personality Test
- User Survey
- Product Pre-sale
- Data Synchronization

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PAT_TOKEN=your_github_token
REPO_OWNER=your_github_username
REPO_NAME=your_repo_name

# Netlify configuration
NETLIFY_SITE_ID=your_site_id
NETLIFY_AUTH_TOKEN=your_netlify_token
```

### GitHub Actions

GitHub Actions handles:
- Data synchronization
- Code validation
- Deployment

### Netlify

Netlify deploys the website automatically when:
- You push changes to the main branch
- You create pull requests

## Directory Structure

```
.
├── data/           # Data files
├── scripts/        # Automation scripts
├── .github/        # GitHub configuration
├── logs/           # Log files
├── *.html          # Web pages
└── README.md       # This file
```

## Security

- GitHub Secrets stores all sensitive data
- We configure environment variables properly
- We manage access tokens securely

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project uses the MIT License. 