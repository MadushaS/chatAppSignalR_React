
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    breakpoints: {
      sm: "320px",
      md: "768px",
      lg: "960px",
      xl: "1200px",
      "2xl": "1536px",
    },
    // Base colors
    tokens: {
      colors: {
        // Primary brand colors
        primary: {
          50: "#e3f2fd",
          100: "#bbdefb",
          200: "#90caf9",
          300: "#64b5f6",
          400: "#42a5f5",
          500: "#2196f3",  // Primary color
          600: "#1e88e5",
          700: "#1976d2",
          800: "#1565c0",
          900: "#0d47a1",
        },
        // Secondary/accent colors
        secondary: {
          50: "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#4caf50",  // Secondary color
          600: "#43a047",
          700: "#388e3c",
          800: "#2e7d32",
          900: "#1b5e20",
        },
        // Neutral shades
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
        // Success, error, warning, info
        success: "#4caf50",
        error: "#f44336",
        warning: "#ff9800",
        info: "#2196f3",
        // Dark mode enhancement
        darkBg: "#121212",
        darkPaper: "#1e1e1e",
        darkElevated: "#2d2d2d",
      },
      // Spacing tokens
      space: {
        micro: "2px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      // Border radius tokens
      radii: {
        none: "0",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      // Shadow tokens
      shadows: {
        xs: "0 1px 2px rgba(0,0,0,0.05)",
        sm: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
        md: "0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
        lg: "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
        xl: "0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)",
        "2xl": "0 25px 50px rgba(0,0,0,0.25)",
        inner: "inset 0 2px 4px rgba(0,0,0,0.06)",
      },
    },
    // Semantic tokens for light/dark mode
    semanticTokens: {
      colors: {
        text: {
          default: {
            value: {
              _light: "{colors.neutral.900}",
              _dark: "{colors.neutral.50}",
            }
          },
          secondary: {
            value: {
              _light: "{colors.neutral.600}",
              _dark: "{colors.neutral.400}",
            }
          },
          muted: {
            value: {
              _light: "{colors.neutral.500}",
              _dark: "{colors.neutral.500}",
            }
          },
          accent: {
            value: {
              _light: "{colors.primary.500}",
              _dark: "{colors.primary.400}",
            }
          },
        },
        bg: {
          default: {
            value: {
              _light: "white",
              _dark: "{colors.darkBg}",
            }
          },
          elevated: {
            value: {
              _light: "{colors.neutral.50}",
              _dark: "{colors.darkElevated}",
            }
          },
          subtle: {
            value: {
              _light: "{colors.neutral.100}",
              _dark: "{colors.darkPaper}",
            }
          },
          muted: {
            value: {
              _light: "{colors.neutral.200}",
              _dark: "rgba(255,255,255,0.08)",
            }
          },
        },
        border: {
          default: {
            value: {
              _light: "{colors.neutral.200}",
              _dark: "{colors.neutral.800}",
            }
          },
        },
        // Individual component tokens
        button: {
          primary: {
            bg: {
              value: {
                _light: "{colors.primary.500}",
                _dark: "{colors.primary.600}",
              }
            },
            hoverBg: {
              value: {
                _light: "{colors.primary.600}",
                _dark: "{colors.primary.500}",
              }
            },
          },
        },
        card: {
          bg: {
            value: {
              _light: "white",
              _dark: "{colors.darkPaper}",
            }
          },
          shadow: {
            value: {
              _light: "{shadows.md}",
              _dark: "0 4px 6px rgba(0,0,0,0.4)",
            }
          },
        },
      },
    },
    // Animations and transitions
    keyframes: {
      spin: {
        from: { transform: "rotate(0deg)" },
        to: { transform: "rotate(360deg)" },
      },
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      slideIn: {
        from: { transform: "translateY(20px)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 },
      },
      pulse: {
        "0%": { transform: "scale(1)" },
        "50%": { transform: "scale(1.05)" },
        "100%": { transform: "scale(1)" },
      },
    },
    // Typography
    textStyles: {
      h1: {
        fontSize: ["2.25rem", "2.5rem"],
        fontWeight: "700",
        lineHeight: "1.2",
        letterSpacing: "-0.02em",
      },
      h2: {
        fontSize: ["1.75rem", "2rem"],
        fontWeight: "700",
        lineHeight: "1.2",
        letterSpacing: "-0.01em",
      },
      h3: {
        fontSize: ["1.5rem", "1.75rem"],
        fontWeight: "600",
        lineHeight: "1.3",
      },
      h4: {
        fontSize: ["1.25rem", "1.5rem"],
        fontWeight: "600",
        lineHeight: "1.4",
      },
      body: {
        fontSize: "1rem",
        fontWeight: "400",
        lineHeight: "1.5",
      },
      caption: {
        fontSize: "0.875rem",
        fontWeight: "400",
        lineHeight: "1.5",
      },
      button: {
        fontSize: "0.875rem",
        fontWeight: "500",
        lineHeight: "1",
        letterSpacing: "0.02em",
      },
    },
    // Component variants
    components: {
      Button: {
        baseStyle: {
          borderRadius: "md",
          fontWeight: "500",
          _focus: {
            boxShadow: "outline",
          },
          _hover: {
            transform: "translateY(-1px)",
            boxShadow: "sm",
          },
          _active: {
            transform: "translateY(0)",
          },
          transition: "all 0.2s",
        },
      },
    },
    // Global styles
    styles: {
      global: (props) => ({
        body: {
          bg: props.colorMode === "dark" ? "darkBg" : "bg.default",
          color: props.colorMode === "dark" ? "text.default" : "text.secondary",
        },
        a: {
          color: props.colorMode === "dark" ? "primary.500" : "primary.600",
          textDecoration: "none",
          _hover: {
            textDecoration: "underline",
          },
        },
      }),
    },
  },
});


const ChakraTheme = createSystem(defaultConfig,config);
export default ChakraTheme;