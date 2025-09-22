import { Pie } from "react-chartjs-2";

const PieChart = ({ title, data }) => {
  const options = { responsive: true, maintainAspectRatio: false };

  return (
    // <div className="bg-white shadow rounded-xl p-4 w-full " style={{height : "400px"}}>
      <div className="w-full" style={{height : "300px"}}>
              <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>

        <Pie data={data} options={options} />
      </div>
    // </div>
  );
};



export default PieChart;
