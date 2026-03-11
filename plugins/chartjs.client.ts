import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'

export default defineNuxtPlugin(() => {
  Chart.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    PointElement,
    LineElement,
    Filler
  )

  // Set default options
  Chart.defaults.font.family = "'Inter', 'Noto Sans TC', system-ui, sans-serif"
  Chart.defaults.color = '#5C554D'
  Chart.defaults.plugins.tooltip.backgroundColor = '#3D3833'
  Chart.defaults.plugins.tooltip.titleFont = { weight: 500 }
  Chart.defaults.plugins.tooltip.cornerRadius = 8
  Chart.defaults.plugins.tooltip.padding = 12
})
