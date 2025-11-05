# Fargepalett - Mocca/Champagne Theme

## Designprinsipper
JobCrawl bruker en elegant og behagelig fargepalett inspirert av mocca og champagne toner. Dette gir en profesjonell, varm og komfortabel brukeropplevelse.

## Hovedfarger

### Mocca Range
```css
--mocca-50: #FAF5F0;    /* Lysest - Hovedbakgrunn */
--mocca-100: #F5ECE2;   /* Svært lys champagne - Cards */
--mocca-200: #E8D5C1;   /* Lys champagne - Borders */
--mocca-300: #D4B99A;   /* Medium mocca - Hover states */
--mocca-400: #C29B73;   /* Standard mocca - Buttons */
--mocca-500: #A67E5A;   /* Mørk mocca - Active states */
--mocca-600: #8B6B47;   /* Mørkere mocca - Buttons hover */
--mocca-700: #6B5439;   /* Svært mørk mocca - Text emphasis */
```

### Tekstfarger
```css
--dark-text: #3D2F1F;           /* Hovedtekst */
--bold-heading: #2A2018;         /* Overskrifter (font-weight: 700) */
--subheading: #4A3F2F;           /* Undertitler */
--light-text: #6B5439;           /* Sekundær tekst */
```

### Aksentfarger
```css
--champaigne: #F7E7CE;          /* Champagne highlight */
--mocca-accent: #B8956A;        /* Mocca accent */
```

## Bruksområder

### Background Colors
- **Primary Background**: `#FAF5F0` (mocca-50) - Main page background
- **Card Background**: `#F5ECE2` (mocca-100) - Cards and containers
- **Section Background**: `#E8D5C1` (mocca-200) - Section backgrounds

### Text Colors
- **Body Text**: `#3D2F1F` (dark-text) - Readable dark brown
- **Headings**: `#2A2018` (bold-heading) - Extra dark with bold weight
- **Subheadings**: `#4A3F2F` (subheading) - Medium brown
- **Secondary Text**: `#6B5439` (light-text) - Lighter informational text
- **Muted Text**: `#8B6B47` (mocca-600) - Disabled or placeholders

### Interactive Elements
- **Primary Buttons**: `#C29B73` (mocca-400) - Background color
- **Button Hover**: `#B8956A` (mocca-accent) - Hover state
- **Button Active**: `#A67E5A` (mocca-500) - Active state
- **Links**: `#8B6B47` (mocca-600) - Link color
- **Link Hover**: `#6B5439` (mocca-700) - Link hover

### Borders and Dividers
- **Light Border**: `#E8D5C1` (mocca-200)
- **Medium Border**: `#D4B99A` (mocca-300)
- **Dark Border**: `#C29B73` (mocca-400)

### Highlights and Accents
- **Success/Positive**: `#8B6B47` (mocca-600)
- **Info**: `#A67E5A` (mocca-500)
- **Warning**: `#C29B73` (mocca-400)
- **Highlight**: `#F7E7CE` (champaigne)

## Typography

### Font Weights
- **Regular**: 400 - Body text
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Main headings
- **Extrabold**: 800 - Special emphasis

### Font Sizes
- **Hero**: 3rem (48px) - Extra bold
- **H1**: 2rem (32px) - Bold
- **H2**: 1.5rem (24px) - Bold/Semibold
- **H3**: 1.25rem (20px) - Semibold
- **Body**: 1rem (16px) - Regular
- **Small**: 0.875rem (14px) - Regular

## CSS Implementation
Create a CSS variables file that can be imported in your components:

```css
:root {
  /* Mocca Colors */
  --mocca-50: #FAF5F0;
  --mocca-100: #F5ECE2;
  --mocca-200: #E8D5C1;
  --mocca-300: #D4B99A;
  --mocca-400: #C29B73;
  --mocca-500: #A67E5A;
  --mocca-600: #8B6B47;
  --mocca-700: #6B5439;
  
  /* Text Colors */
  --text-primary: #3D2F1F;
  --text-heading: #2A2018;
  --text-subheading: #4A3F2F;
  --text-secondary: #6B5439;
  
  /* Accents */
  --champaigne: #F7E7CE;
  --mocca-accent: #B8956A;
}
```

## Design Examples

### Card Component
```css
.card {
  background-color: var(--mocca-100);
  border: 1px solid var(--mocca-200);
  border-radius: 8px;
  padding: 1.5rem;
}

.card h2 {
  color: var(--text-heading);
  font-weight: 700;
  font-size: 1.5rem;
}

.card p {
  color: var(--text-primary);
  font-size: 1rem;
}
```

### Button Component
```css
.button-primary {
  background-color: var(--mocca-400);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.button-primary:hover {
  background-color: var(--mocca-500);
}

.button-primary:active {
  background-color: var(--mocca-600);
}
```

