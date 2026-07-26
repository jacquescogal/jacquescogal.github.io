/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        // Console faces. Martian Mono is squarish and slightly extended — the
        // Eurostile lineage a forensic terminal wants — and carries display,
        // labels, and data. Archivo carries anything meant to be read at length.
        'sans': ['"Archivo Variable"', 'Archivo', 'system-ui', 'sans-serif'],
        'read': ['"Archivo Variable"', 'Archivo', 'system-ui', 'sans-serif'],
        'console': ['"Martian Mono Variable"', '"Martian Mono"', 'ui-monospace', 'monospace'],
        'mono': ['"Martian Mono Variable"', '"Martian Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Warm near-black. Tungsten and smoke, never blue-black, never pure #000.
        //
        // The ramp is wider than it looks. The first cut put the page field at
        // #0B0907 and panels at #14100C — close enough that no panel read as an
        // object sitting on anything, and a stripe pattern was doing the whole
        // job of separating planes. The field drops, the panels lift, and each
        // step is a real perceptual move (~0.045 OKLCH L) rather than a nudge.
        void: {
          DEFAULT: '#080706',
          deep: '#040302',
        },
        panel: {
          1: '#191410',
          2: '#221C15',
          3: '#2D251C',
          4: '#3A3126',
        },
        // Sodium-vapour phosphor: the signal colour of the whole console.
        amber: {
          DEFAULT: '#F2A93B',
          dim: '#B4762A',
          deep: '#7A4E18',
          wash: '#3A2810',
        },
        // The cold counterpoint — light temperature contrast, not a neon accent.
        cold: {
          DEFAULT: '#7FB2BF',
          pale: '#CFE3E8',
          deep: '#2E4A52',
        },
        blood: {
          DEFAULT: '#C4362B',
          dim: '#8C241C',
        },
        brass: {
          DEFAULT: '#A8843C',
          dim: '#6E5626',
        },
        bone: {
          DEFAULT: '#EDE3D4',
          soft: '#A99C8A',
          // Lifted with the panels. At #8A7E6C this tier read 3.8:1 on the
          // brighter plates — legible-looking and measurably not. The quiet
          // tier stays quiet; it just stays above 4.5:1 while doing it.
          faint: '#9A8E7A',
        },
        // Signal channels: six, drawn from the world's own palette so
        // classification never breaks the room's light.
        ch: {
          1: '#F2A93B',
          2: '#7FB2BF',
          3: '#C4362B',
          4: '#A8843C',
          5: '#9186AE',
          6: '#5F9E86',
        },

        // shadcn bridge tokens, repointed at the console.
        'background': 'var(--background)',
        'foreground': 'var(--foreground)',
        'card': 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        'popover': 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        'primary': 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        'secondary': 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        'muted': 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        'accent': 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        'destructive': 'var(--destructive)',
        'border': 'var(--border)',
        'input': 'var(--input)',
        'ring': 'var(--ring)',
      },
      /* The console's type ramp. The build had drifted to 27 arbitrary sizes,
         eight of them inside a single 0.11rem band; these are the only steps. */
      fontSize: {
        'micro':   ['0.5rem',    { lineHeight: '1.4' }],
        'legend':  ['0.5625rem', { lineHeight: '1.4' }],
        'label':   ['0.625rem',  { lineHeight: '1.4' }],
        'data':    ['0.6875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem',   { lineHeight: '1.6' }],
        'body':    ['0.875rem',  { lineHeight: '1.75' }],
        'lede':    ['0.9375rem', { lineHeight: '1.6' }],
        'title':   ['1.125rem',  { lineHeight: '1.25' }],
        'display': ['clamp(1.7rem, 6vw, 2.6rem)', { lineHeight: '1.05' }],
      },
      borderRadius: {
        'unit': '2px',
        'sign': '999px',
      },
      letterSpacing: {
        'console': '0.08em',
        'console-wide': '0.2em',
      },
      boxShadow:
      {
        // One light source, high and to the left. Every raised surface takes a
        // lit hairline along its top edge and casts down-right; every recessed
        // surface takes an inset. Fill values alone cannot separate planes this
        // close to black — the edge cue does most of the work.
        'plate': 'inset 0 1px 0 rgba(242,169,59,0.11), inset 1px 0 0 rgba(242,169,59,0.045), 0 2px 4px rgba(0,0,0,0.55), 0 14px 30px -10px rgba(0,0,0,0.75)',
        'raise': '0 1px 0 rgba(242,169,59,0.08) inset, 0 6px 18px rgba(0,0,0,0.55)',
        'well': 'inset 0 2px 10px rgba(0,0,0,0.7)',
        'lift': '0 18px 50px rgba(0,0,0,0.7)',
      },
      keyframes: {
        // The Esper's scan travelling down a loaded frame.
        'scan-sweep': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '12%': { opacity: '1' },
          '88%': { opacity: '1' },
          '100%': { transform: 'translateY(1400%)', opacity: '0' },
        },
        'reticle-snap': {
          '0%': { transform: 'scale(1.5)', opacity: '0' },
          '60%': { transform: 'scale(0.96)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'phosphor-in': {
          from: { opacity: '0', transform: 'translateY(3px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'lamp-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'node-ping': {
          '0%': { transform: 'scale(1)', opacity: '0.9' },
          '70%': { transform: 'scale(2.4)', opacity: '0' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        // Dust in the keylight. Each mote carries its own duration, delay and
        // drift vector, so nothing beats in unison.
        'mote': {
          '0%': { transform: 'translate3d(0, 0, 0)', opacity: '0' },
          '12%': { opacity: 'var(--mote-peak, 0.16)' },
          '76%': { opacity: 'var(--mote-peak, 0.16)' },
          '100%': {
            transform: 'translate3d(var(--mote-dx, -14px), var(--mote-dy, -120px), 0)',
            opacity: '0',
          },
        },
        // A single amber pass across a section the moment its feed lands.
        // Caused, never looped: three of these per visit at most.
        'feed-sweep': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '18%': { opacity: '1' },
          '82%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        // The key light breathing across the plate. Motes are small and can
        // only ever be a texture; a soft mass this large is the thing the eye
        // actually registers as the room being alive.
        'light-drift': {
          '0%, 100%': { transform: 'translate3d(-5%, 1%, 0) scale(1)', opacity: '0.5' },
          '50%': { transform: 'translate3d(7%, -2%, 0) scale(1.14)', opacity: '1' },
        },
        // The analyser re-reading the frame. The sweep occupies the first fifth
        // of the cycle and the rest is dead air, so it recurs without ever
        // being a thing that is constantly moving.
        'scan-repeat': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '3%': { opacity: '1' },
          '17%': { opacity: '1' },
          '21%': { transform: 'translateY(1500%)', opacity: '0' },
          '100%': { transform: 'translateY(1500%)', opacity: '0' },
        },
        // A readout cell coming up to power.
        'cell-strike': {
          '0%': { transform: 'scaleY(0.2)', opacity: '0' },
          '70%': { transform: 'scaleY(1.06)', opacity: '1' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
      },
      animation: {
        'scan-sweep': 'scan-sweep 2.6s linear 1',
        // Overshoot lives in the keyframes (1.5 -> 0.96 -> 1), so the easing only
        // needs to decelerate: a stamp strike settles, it does not wobble.
        'reticle-snap': 'reticle-snap 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'phosphor-in': 'phosphor-in 220ms ease-out both',
        'lamp-pulse': 'lamp-pulse 2.2s ease-in-out infinite',
        'node-ping': 'node-ping 900ms ease-out',
        'mote': 'mote var(--mote-dur, 22s) linear var(--mote-delay, 0s) infinite',
        'light-drift': 'light-drift 26s ease-in-out infinite',
        'scan-repeat': 'scan-repeat 9s linear infinite',
        'feed-sweep': 'feed-sweep 1100ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'cell-strike': 'cell-strike 240ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
