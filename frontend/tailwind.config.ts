import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
        // BOLT Design System Colors
        'bolt-black': '#020A18',
        'bolt-medium-black': '#10103C',
        'bolt-dark-purple': '#4322AA',
        'bolt-blue': '#135EE3',
        'bolt-cyan': '#68D8FC',
        'bolt-purple': '#B688FF',
        'bolt-white': '#F8F8FE',
        'bolt-mid-blue': '#005CFF',
        'bolt-light-blue': '#D1D8FA',
        'bolt-light-cyan': '#B2ECFF',
        'bolt-light-purple': '#C5B8FF',

  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			
  			// =====================================
  			// NEW DESIGN SYSTEM COLORS (Phase 1)
  			// =====================================
  			// Commented sections for new design system
  			// Uncomment when migrating components to new system
  			
  			// ds: {
  			// 	primary: {
  			// 		DEFAULT: 'hsl(var(--ds-primary))',
  			// 		foreground: 'hsl(var(--ds-primary-foreground))'
  			// 	},
  			// 	secondary: {
  			// 		DEFAULT: 'hsl(var(--ds-secondary))',
  			// 		foreground: 'hsl(var(--ds-secondary-foreground))'
  			// 	},
  			// 	accent: {
  			// 		DEFAULT: 'hsl(var(--ds-accent))',
  			// 		foreground: 'hsl(var(--ds-accent-foreground))'
  			// 	},
  			// 	destructive: {
  			// 		DEFAULT: 'hsl(var(--ds-destructive))',
  			// 		foreground: 'hsl(var(--ds-destructive-foreground))'
  			// 	},
  			// 	muted: {
  			// 		DEFAULT: 'hsl(var(--ds-muted))',
  			// 		foreground: 'hsl(var(--ds-muted-foreground))'
  			// 	},
  			// 	background: 'hsl(var(--ds-background))',
  			// 	foreground: 'hsl(var(--ds-foreground))',
  			// 	card: {
  			// 		DEFAULT: 'hsl(var(--ds-card))',
  			// 		foreground: 'hsl(var(--ds-card-foreground))'
  			// 	},
  			// 	popover: {
  			// 		DEFAULT: 'hsl(var(--ds-popover))',
  			// 		foreground: 'hsl(var(--ds-popover-foreground))'
  			// 	},
  			// 	border: 'hsl(var(--ds-border))',
  			// 	input: 'hsl(var(--ds-input))',
  			// 	ring: 'hsl(var(--ds-ring))',
  			// 	chart: {
  			// 		'1': 'hsl(var(--ds-chart-1))',
  			// 		'2': 'hsl(var(--ds-chart-2))',
  			// 		'3': 'hsl(var(--ds-chart-3))',
  			// 		'4': 'hsl(var(--ds-chart-4))',
  			// 		'5': 'hsl(var(--ds-chart-5))'
  			// 	}
  			// },
  		},
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			
  			// =====================================
  			// NEW DESIGN SYSTEM RADIUS (Phase 1)
  			// =====================================
  			// Uncomment when migrating components to new system
  			
  			// 'ds-lg': 'var(--ds-radius)',
  			// 'ds-md': 'calc(var(--ds-radius) - 2px)',
  			// 'ds-sm': 'calc(var(--ds-radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'slideInDown': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'float-medium': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        'float-fast': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        'spinner-rotation': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        patternMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '100px 100px' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        
        // =====================================
        // NEW DESIGN SYSTEM ANIMATIONS (Phase 1)
        // =====================================
        // Uncomment when migrating components to new system
        
        // 'ds-fade-in': {
        //   '0%': { opacity: '0' },
        //   '100%': { opacity: '1' },
        // },
        // 'ds-slide-in': {
        //   '0%': { transform: 'translateY(-10px)', opacity: '0' },
        //   '100%': { transform: 'translateY(0)', opacity: '1' },
        // },
        // 'ds-scale-in': {
        //   '0%': { transform: 'scale(0.95)', opacity: '0' },
        //   '100%': { transform: 'scale(1)', opacity: '1' },
        // },
        // 'ds-bounce-in': {
        //   '0%': { transform: 'scale(0.8)', opacity: '0' },
        //   '50%': { transform: 'scale(1.05)' },
        //   '100%': { transform: 'scale(1)', opacity: '1' },
        // }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'slideInDown': 'slideInDown 0.5s ease-out',
        'float': 'float-medium 4s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-fast': 'float-fast 3s ease-in-out infinite',
        'spinner-rotation': 'spinner-rotation 0.75s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pattern-move': 'patternMove 20s linear infinite',
        'shake': 'shake 0.4s ease-in-out',
        
        // =====================================
        // NEW DESIGN SYSTEM ANIMATIONS (Phase 1)
        // =====================================
        // Uncomment when migrating components to new system
        
        // 'ds-fade-in': 'ds-fade-in var(--ds-animation-normal) ease-out',
        // 'ds-slide-in': 'ds-slide-in var(--ds-animation-normal) ease-out',
        // 'ds-scale-in': 'ds-scale-in var(--ds-animation-normal) ease-out',
        // 'ds-bounce-in': 'ds-bounce-in var(--ds-animation-normal) ease-out',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;