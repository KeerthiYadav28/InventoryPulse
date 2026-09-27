interface StatCardProps {
    title: string;
    value: number;
  }
  
  const StatCard = ({ title, value }: StatCardProps) => {
    return (
      <div className="stat-card">
        <h4>{title}</h4>
        <p>{value}</p>
      </div>
    );
  };
  
  export default StatCard;