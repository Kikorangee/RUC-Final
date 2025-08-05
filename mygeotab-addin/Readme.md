# RUC License Management - MyGeotab Add-In

A comprehensive Road User Charges (RUC) license management system integrated with MyGeotab for fleet operators to track vehicle licenses, monitor odometer readings, and manage compliance with RUC regulations.

## Features

- **Real-time MyGeotab Integration**: Syncs vehicle data and odometer readings directly from MyGeotab
- **License Status Monitoring**: Color-coded status system (green/orange/red) for easy identification
- **Interactive Filtering**: Click on status cards to filter vehicles by license status
- **2000km Alert Threshold**: Automatic alerts for licenses expiring within 2000km
- **Odometer Updates**: Update vehicle odometer readings with status recalculation
- **Responsive Design**: Works seamlessly within MyGeotab interface

## Installation Instructions

### 1. Host Your Files

You need to host the Add-In files on a publicly accessible HTTPS server. Options include:

- **GitHub Pages** (Free):
  1. Create a new repository
  2. Upload the files from the `mygeotab-addin/` folder
  3. Enable GitHub Pages in repository settings
  4. Your URL will be: `https://yourusername.github.io/repository-name/index.html`

- **Netlify** (Free):
  1. Drag and drop the `mygeotab-addin/` folder to Netlify
  2. Get your assigned URL: `https://your-site-name.netlify.app/index.html`

- **Your Own Server**: Upload to any HTTPS-enabled web server

### 2. Update Configuration

Edit `addin-config.json` and replace:
- `https://your-hosting-domain.com/ruc-addin/index.html` with your actual hosted URL
- `https://your-hosting-domain.com/ruc-addin/icon.svg` with your actual icon URL
- `support@yourcompany.com` with your support email

### 3. Install in MyGeotab

1. Log into your MyGeotab account
2. Navigate to **Administration → System → System Settings**
3. Click the **Add-Ins** tab
4. Click **+ Add-In**
5. Paste your updated `addin-config.json` content
6. Click **Save**
7. Refresh your browser

### 4. Access the Add-In

After installation, you'll find "RUC Management" in the left navigation menu under the Activity section.

## Configuration File Structure

```json
{
  "name": "RUC License Management",
  "supportEmail": "your-email@company.com",
  "version": "1.0.0",
  "items": [
    {
      "url": "https://your-domain.com/ruc-addin/index.html",
      "path": "ActivityLink/",
      "category": "ComplianceId",
      "svgIcon": "https://your-domain.com/ruc-addin/icon.svg",
      "menuName": {
        "en": "RUC Management",
        "fr": "Gestion RUC"
      }
    }
  ],
  "enableViewSecurityId": true,
  "securityIds": [
    {
      "name": "ViewRUCManagement",
      "en": "View RUC Management Add-in"
    }
  ]
}
```

## MyGeotab API Integration

The Add-In integrates with MyGeotab APIs to:

- **Retrieve Vehicles**: Gets all devices (vehicles) from your MyGeotab account
- **Fetch Odometer Data**: Pulls recent odometer readings from diagnostic data
- **Real-time Updates**: Syncs data when the Add-In gains focus

### Key API Calls Used:

```javascript
// Get all vehicles
geotabApi.call('Get', {
    typeName: 'Device'
});

// Get odometer readings
geotabApi.call('Get', {
    typeName: 'StatusData',
    search: {
        diagnosticSearch: {
            id: 'DiagnosticOdometerAdjustmentId'
        }
    }
});
```

## RUC License Logic

The system calculates license status based on:

- **Active**: Remaining distance > 2000km
- **Expiring Soon**: Remaining distance ≤ 2000km but > 0
- **Expired**: Current odometer exceeds license end odometer

Formula: `Remaining Distance = License End Odometer - Current Odometer`

## Customization

### Styling
The Add-In uses Tailwind CSS with custom CSS variables for RUC-specific colors:
- `--success: #10b981` (Green for active licenses)
- `--warning: #f59e0b` (Orange for expiring licenses)  
- `--danger: #ef4444` (Red for expired licenses)

### Alert Threshold
Change the 2000km alert threshold by modifying the status calculation logic in the `transformMyGeotabData` function.

### Multi-language Support
Add additional language support by updating the `menuName` object in the configuration file.

## Security Features

- **View Security**: Optional security clearance required to view the Add-In
- **Custom Security IDs**: Define custom permissions for RUC management functions
- **HTTPS Required**: All resources must be served over HTTPS

## Troubleshooting

### Common Issues:

1. **Add-In not appearing**: Check that all URLs are HTTPS and publicly accessible
2. **No vehicle data**: Ensure your MyGeotab account has vehicles with recent diagnostic data
3. **Permission denied**: Check security clearances in MyGeotab user management

### Browser Console Logs:
Open browser developer tools to see detailed logging of API calls and any errors.

## Integration with External RUC Systems

This Add-In provides a foundation for integrating with external RUC license management systems. You can extend it to:

- Connect to RUC license databases
- Automate license renewal processes
- Generate compliance reports
- Send automated alerts via email/SMS

## Support

For technical support with this Add-In, contact: support@yourcompany.com

## License

This RUC Management Add-In is designed for fleet operators using MyGeotab to manage Road User Charges compliance efficiently.
