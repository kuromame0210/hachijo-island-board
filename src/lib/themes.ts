export type ThemeName = 'ocean' | 'nature' | 'geothermal' | 'sunset' | 'community'

export interface Theme {
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    primaryHover: string
    secondaryHover: string
    accentHover: string
  }
  categoryColors: {
    '不動産': string
    '仕事': string
    '不用品': string
  }
}

export const themes: Record<ThemeName, Theme> = {
  ocean: {
    name: "Ocean Blue",
    description: "海の青・清潔・信頼性",
    colors: {
      primary: "blue-600",
      secondary: "blue-500",
      accent: "emerald-600",
      primaryHover: "blue-700",
      secondaryHover: "blue-600",
      accentHover: "emerald-700"
    },
    categoryColors: {
      '不動産': 'bg-blue-50 text-blue-700 border border-blue-200',
      '仕事': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      '不用品': 'bg-amber-50 text-amber-700 border border-amber-200'
    }
  },
  nature: {
    name: "Island Nature",
    description: "島の自然・緑と海",
    colors: {
      primary: "emerald-600",
      secondary: "cyan-600",
      accent: "amber-500",
      primaryHover: "emerald-700",
      secondaryHover: "cyan-700",
      accentHover: "amber-600"
    },
    categoryColors: {
      '不動産': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
      '仕事': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      '不用品': 'bg-amber-50 text-amber-700 border border-amber-200'
    }
  },
  geothermal: {
    name: "Geothermal",
    description: "地熱・温泉の温かさ",
    colors: {
      primary: "red-600",
      secondary: "orange-600",
      accent: "lime-600",
      primaryHover: "red-700",
      secondaryHover: "orange-700",
      accentHover: "lime-700"
    },
    categoryColors: {
      '不動産': 'bg-red-50 text-red-700 border border-red-200',
      '仕事': 'bg-orange-50 text-orange-700 border border-orange-200',
      '不用品': 'bg-lime-50 text-lime-700 border border-lime-200'
    }
  },
  sunset: {
    name: "Island Sunset",
    description: "夕景・温かい橙色",
    colors: {
      primary: "orange-700",
      secondary: "orange-900",
      accent: "sky-700",
      primaryHover: "orange-800",
      secondaryHover: "orange-950",
      accentHover: "sky-800"
    },
    categoryColors: {
      '不動産': 'bg-orange-50 text-orange-700 border border-orange-200',
      '仕事': 'bg-amber-50 text-amber-700 border border-amber-200',
      '不用品': 'bg-sky-50 text-sky-700 border border-sky-200'
    }
  },
  community: {
    name: "Community",
    description: "親しみやすいコミュニティ",
    colors: {
      primary: "violet-600",
      secondary: "pink-600",
      accent: "emerald-600",
      primaryHover: "violet-700",
      secondaryHover: "pink-700",
      accentHover: "emerald-700"
    },
    categoryColors: {
      '不動産': 'bg-violet-50 text-violet-700 border border-violet-200',
      '仕事': 'bg-pink-50 text-pink-700 border border-pink-200',
      '不用品': 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }
  }
}

export const defaultTheme: ThemeName = 'ocean'