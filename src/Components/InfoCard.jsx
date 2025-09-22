import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";

const InfoCard = ({ title, value, icon: Icon, children }) => (
  <div
    className="card text-black h-100 shadow"
    style={{
      background: "linear-gradient(#FBFBFB 0%, #E8F9FF 100%)",
      borderRadius: "1rem",
    }}
  >
    <div className="card-body d-flex justify-content-between align-items-center">
      <div>
        <h5 className="card-title">{title}</h5>
        <h2 className="fw-bold">{value}</h2>
        {children && (
          <div className="mt-2 small text-muted">
            {children}
          </div>
        )}
      </div>
      {Icon && <Icon size={40} />}
    </div>
  </div>
);


export default InfoCard;