# Pet Testing Website

A professional website for pet personality testing and product recommendations.

## Test Update
Last test deployment: 测试部署时间 - $(date)

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

The project uses GitHub Actions for:
- Automated data synchronization
- Code validation
- Deployment

### Netlify

The website is automatically deployed to Netlify when:
- Changes are pushed to main branch
- Pull requests are created

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

- All sensitive data is stored in GitHub Secrets
- Environment variables are properly configured
- Access tokens are securely managed

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 