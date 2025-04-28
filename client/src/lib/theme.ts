// SaviorNet Theme Configuration

export const theme = {
  // Professional Emergency Theme (Recommended)
  colors: {
    background: '#F8F9FA',
    primary: '#FF4C4C',     // Emergency Red
    secondary: '#0066CC',   // Rescue Blue
    accent: '#00B894',      // Safety Green
    text: '#212529',        // Deep Charcoal
    
    // Additional Colors
    floodRisk: '#FF4C4C',   // Red
    earthquakeRisk: '#FF9500', // Orange
    wildfireRisk: '#FF6F00', // Fire Orange
    
    // Status Colors
    success: '#00B894',     // Green
    warning: '#FDCB6E',     // Yellow
    danger: '#FF4C4C',      // Red
    info: '#74B9FF',        // Blue
    
    // UI Elements
    cardBg: '#FFFFFF',
    navBg: '#212529',
    navText: '#FFFFFF',
    divider: '#E9ECEF',
  },
  
  // Responsive Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Animation Durations
  animations: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s',
  }
};

export const sosAlertAnimation = `
  @keyframes pulse-border {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 76, 76, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 76, 76, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 76, 76, 0);
    }
  }

  @keyframes pulse-bg {
    0% {
      background-color: rgba(255, 76, 76, 0.2);
    }
    50% {
      background-color: rgba(255, 76, 76, 0.5);
    }
    100% {
      background-color: rgba(255, 76, 76, 0.2);
    }
  }
`;

// Map Marker Styles
export const mapMarkerStyles = {
  sosAlert: {
    size: 25,
    background: theme.colors.danger,
    animation: 'pulse-border 1.5s infinite',
    zIndex: 10
  },
  rescueTeam: {
    size: 20,
    background: theme.colors.secondary,
    zIndex: 8
  },
  safeZone: {
    size: 22,
    background: theme.colors.accent,
    zIndex: 7
  }
};

// Disaster Card Styles
export const disasterCardStyles = {
  flood: {
    icon: '🌊',
    color: theme.colors.floodRisk,
    background: 'rgba(255, 76, 76, 0.1)'
  },
  earthquake: {
    icon: '🌎',
    color: theme.colors.earthquakeRisk,
    background: 'rgba(255, 149, 0, 0.1)'
  },
  wildfire: {
    icon: '🔥',
    color: theme.colors.wildfireRisk,
    background: 'rgba(255, 111, 0, 0.1)'
  }
};

// Additional helper styles
export const helpers = {
  dropShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  cardBorder: '1px solid ' + theme.colors.divider,
  roundedSm: '0.25rem',
  roundedMd: '0.375rem',
  roundedLg: '0.5rem',
  roundedFull: '9999px',
};