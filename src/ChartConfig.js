// chartConfig.js
import {
    Chart as ChartJS,
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
  } from "chart.js";
  
  // Register the elements you need globally
  ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);
  