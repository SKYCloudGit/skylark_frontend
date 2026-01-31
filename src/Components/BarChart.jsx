import { useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";


const BarChart = ({ title, data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    // <div className="bg-white shadow rounded-xl p-4 w-full" style={{height : "400px"}}>
      // <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="w-full" style={{height : "300px"}}>
        <h4 className="text-lg font-semibold mb-4">{title}</h4>
        
        <Bar data={data} options={options} />
      {/* </div> */}
    </div>
 
  );
};

export default BarChart;
